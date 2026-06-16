// src/services/ai-orchestrator.service.ts
import crypto from "crypto";
import { AppError } from "../errors/app-error";
import { AIPolicy } from "../models/ai-policy.model";
import { executeAIActionStep, AIExecutorResult } from "./ai-executor.service";
import { rollbackExecutedSteps, AIExecutorUndo } from "./ai-rollback.service";
import { detectPlanConflicts } from "./ai-conflict-detector.service";
import {
  AIActionPayload,
  AIStepStatus,
} from "../types/ai-system-actions.types";
import { ExecutionStatus } from "../enums/execution-status.enum";
import { calculatePlanMetrics } from "./ai-plan-metrics.service";
import { validateAIStep } from "./ai-step-validator.service";
import { AIExecution } from "../models/ai-execution.model";
import { validateAIPlan } from "./ai-plan-validator.service";
import { analyzePlanRisk } from "./ai-risk-analyzer.service";
import { AITelemetry } from "../models/ai-telemetry.model";
import { getAdaptiveRiskThreshold } from "./ai-adaptive-risk.service";
import { optimizeAIPlan } from "./ai-plan-optimizer.service";
import { resolveExecutionBatches } from "./ai-plan-dependency-resolver.service";
import { runWithConcurrencyLimit } from "./ai-concurrency-limiter.service";
import { executeStepWithRetry } from "./ai-retry-engine.service";
import { selfHealFailedStep } from "./self-healing-ai-engine.service";
import { AIExecutionMemory } from "../models/ai-execution-memory.model";
import { predictStepFailure } from "./ai-prediction-engine.service";

export interface AIOrchestratorOptions {
  dryRun?: boolean;
  resumeFrom?: number;
  existingExecutionId?: string;
}

export const executeAIPlanOrchestrator = async (
  workspaceId: string,
  projectId: string,
  initialPlan: AIActionPayload[],
  options: AIOrchestratorOptions = {},
) => {
  if (!Array.isArray(initialPlan) || initialPlan.length === 0) {
    throw new AppError("AI plan must contain at least one step", 400);
  }

  /* =========================
     1️⃣ PLAN VALIDATION
  ========================= */

  const validation = validateAIPlan(initialPlan);

  if (!validation.isValid) {
    throw new AppError(
      `AI Plan rejected: ${validation.errors.join(", ")}`,
      400,
    );
  }

  /* =========================
     2️⃣ PLAN OPTIMIZATION
  ========================= */

  const optimization = optimizeAIPlan(initialPlan);
  const plan = optimization.optimizedPlan;

  /* =========================
     3️⃣ RISK ANALYSIS
  ========================= */

  const risk = analyzePlanRisk(plan);
  const adaptiveRiskThreshold = await getAdaptiveRiskThreshold(workspaceId);

  if (risk.riskScore > adaptiveRiskThreshold) {
    throw new AppError(
      `AI Plan rejected: risk score (${risk.riskScore}) exceeds threshold (${adaptiveRiskThreshold})`,
      403,
    );
  }

  /* =========================
     4️⃣ CONFLICT DETECTION
  ========================= */

  const conflictResult = await detectPlanConflicts(workspaceId, plan);

  if (conflictResult.hasConflicts) {
    throw new AppError(
      `AI Plan rejected due to conflicts: ${conflictResult.conflicts.join(", ")}`,
      400,
    );
  }

  /* =========================
     5️⃣ POLICY CHECK
  ========================= */

  const policy = await AIPolicy.findOne({ workspaceId });

  const maxSteps = policy?.maxActionsPerRequest ?? 5;
  const maxConcurrent = policy?.maxConcurrentSteps ?? 3;

  if (plan.length > maxSteps) {
    throw new AppError(`AI plan exceeds allowed step count (${maxSteps})`, 400);
  }

  const metrics = calculatePlanMetrics(plan);

  if (metrics.approvalRequired && !options?.dryRun) {
    throw new AppError(
      "AI plan requires manual approval due to risk score",
      403,
    );
  }

  /* =========================
     6️⃣ EXECUTION ID
  ========================= */

  const executionId = options.existingExecutionId ?? crypto.randomUUID();

  /* =========================
     7️⃣ CREATE EXECUTION RECORD
  ========================= */

  if (!options.existingExecutionId) {
    await AIExecution.create({
      workspaceId,
      projectId,
      executionId,
      status: ExecutionStatus.RUNNING,
      plan,
      validationScore: validation.score,
      riskScore: risk.riskScore,
      steps: plan.map((step, index) => ({
        index,
        action: step.action,
        status: AIStepStatus.PENDING,
        retryCount: 0,
        isLocked: false,
      })),
      startedAt: new Date(),
    });
  }

  const results: AIExecutorResult[] = [];
  const undoStack: AIExecutorUndo[] = [];
  const stepDurations: number[] = [];
  let failedStepsCount = 0;

  /* =========================
     8️⃣ DEPENDENCY EXECUTION
  ========================= */

  const batches = resolveExecutionBatches(plan);

  for (const batch of batches) {
    try {
      const tasks = batch.map((i) => {
        return async (): Promise<AIExecutorResult> => {
          let step = plan[i];

          validateAIStep(step);

          /* =========================
             FAILURE PREDICTION
          ========================= */

          const prediction = await predictStepFailure({
            workspaceId,
            projectId,
            actionType: step.action,
          });

          if (prediction.predictedFailure) {
            console.warn(
              `⚠️ AI predicted failure for step ${i}. Probability: ${prediction.failureProbability}`,
            );

            if (prediction.recommendation === "repair") {
              const repair = await selfHealFailedStep(
                { workspaceId, projectId, executionId },
                {
                  stepIndex: i,
                  step,
                  error: "Predicted failure",
                  retryCount: 0,
                },
              );

              if (repair.repairedStep) {
                step = repair.repairedStep;
              }
            }

            if (prediction.recommendation === "skip") {
              await AIExecution.updateOne(
                { executionId },
                { $set: { "steps.$[elem].status": AIStepStatus.SKIPPED } },
                { arrayFilters: [{ "elem.index": i }] },
              );

              return {
                ok: true,
                blocked: false,
                data: null,
                reason: "Skipped due to AI failure prediction",
              };
            }
          }

          await AIExecution.updateOne(
            { executionId },
            { $set: { "steps.$[elem].status": AIStepStatus.RUNNING } },
            { arrayFilters: [{ "elem.index": i }] },
          );

          const start = Date.now();

          try {
            const result = await executeStepWithRetry(
              workspaceId,
              projectId,
              step,
              { dryRun: options?.dryRun === true },
            );

            const duration = Date.now() - start;
            stepDurations.push(duration);

            if (!result || result.blocked || !result.ok) {
              throw new Error(result?.reason || "Step failed");
            }

            await AIExecution.updateOne(
              { executionId },
              { $set: { "steps.$[elem].status": AIStepStatus.SUCCESS } },
              { arrayFilters: [{ "elem.index": i }] },
            );

            if (!options?.dryRun) {
              undoStack.push({
                stepId: `${executionId}-${i}`,
                type: step.action,
                data: result.data,
              });
            }

            await AIExecutionMemory.create({
              workspaceId,
              projectId,
              executionId,
              stepIndex: i,
              actionType: step.action,
              outcome: "success",
              duration,
            });

            return result;
          } catch (error: any) {
            const duration = Date.now() - start;
            stepDurations.push(duration);

            const execution = await AIExecution.findOne(
              { executionId },
              { steps: 1 },
            );

            const retryCount =
              execution?.steps?.find((s: any) => s.index === i)?.retryCount ??
              0;

            const healing = await selfHealFailedStep(
              { workspaceId, projectId, executionId },
              {
                stepIndex: i,
                step,
                error: error?.message || "Unknown error",
                retryCount,
              },
            );

            await AIExecutionMemory.create({
              workspaceId,
              projectId,
              executionId,
              stepIndex: i,
              actionType: step.action,
              stepError: error?.message,
              healingDecision: healing.decision,
              outcome: "failed",
              duration,
            });

            switch (healing.decision) {
              case "retry": {
                const retryResult = await executeStepWithRetry(
                  workspaceId,
                  projectId,
                  step,
                  { dryRun: options?.dryRun === true },
                );

                if (!retryResult || !retryResult.ok) {
                  throw new Error(retryResult?.reason || "Retry failed");
                }

                return retryResult;
              }

              case "repair": {
                const repairedStep = healing.repairedStep!;

                const repairedResult = await executeStepWithRetry(
                  workspaceId,
                  projectId,
                  repairedStep,
                  { dryRun: options?.dryRun === true },
                );

                if (!repairedResult || !repairedResult.ok) {
                  throw new Error("Repaired step failed");
                }

                return repairedResult;
              }

              case "skip": {
                await AIExecution.updateOne(
                  { executionId },
                  {
                    $set: {
                      "steps.$[elem].status": AIStepStatus.SKIPPED,
                      "steps.$[elem].error": error?.message,
                    },
                  },
                  { arrayFilters: [{ "elem.index": i }] },
                );

                return {
                  ok: true,
                  blocked: false,
                  data: null,
                  reason: "Step skipped by AI healing engine",
                };
              }

              default:
                throw new Error(
                  healing.reason || "Execution aborted by AI healing engine",
                );
            }
          }
        };
      });

      const batchResults = await runWithConcurrencyLimit(tasks, maxConcurrent);

      results.push(...batchResults.filter(Boolean));

      await AIExecution.updateOne(
        { executionId },
        { $inc: { completedSteps: batch.length } },
      );
    } catch (err: any) {
      failedStepsCount++;

      const rb = options?.dryRun
        ? { rolledBack: 0 }
        : await rollbackExecutedSteps(
            workspaceId,
            projectId,
            executionId,
            undoStack,
          );

      await AIExecution.updateOne(
        { executionId },
        {
          $set: {
            status: ExecutionStatus.FAILED,
            completedAt: new Date(),
          },
        },
      );

      const totalSteps = plan.length;

      const avg =
        stepDurations.length === 0
          ? 0
          : stepDurations.reduce((a, b) => a + b, 0) / stepDurations.length;

      await AITelemetry.create({
        executionId,
        workspaceId,
        projectId,
        totalSteps,
        completedSteps: results.length,
        failedSteps: 1,
        averageStepDuration: avg,
        validationScore: validation.score,
        riskScore: risk.riskScore,
        successRate: (results.length / totalSteps) * 100,
      });

      return {
        executionId,
        success: false,
        completedSteps: results.length,
        results,
        rollback: {
          attempted: true,
          rolledBackSteps: rb.rolledBack,
        },
      };
    }
  }

  /* =========================
     9️⃣ SUCCESS COMPLETE
  ========================= */

  await AIExecution.updateOne(
    { executionId },
    {
      $set: {
        status: ExecutionStatus.COMPLETED,
        completedAt: new Date(),
        completedSteps: plan.length,
      },
    },
  );

  return {
    executionId,
    success: true,
    completedSteps: plan.length,
    results,
    rollback: {
      attempted: false,
      rolledBackSteps: 0,
    },
  };
};
