// src/services/ai-plan-executor.service.ts
import { AIPlan } from "../models/ai-plan.model";
import { executeAIAction } from "./ai-action-executor.service";
import { logExecutionStep } from "./ai-execution-log.service";
import { verifyAIPlanSignature } from "./ai-integrity.service";

export interface ExecutionResult {
  stepId: string;
  success: boolean;
  message?: string;
}

export const executeAIPlan = async (planId: string) => {
  const plan = await AIPlan.findById(planId);

  if (!plan) {
    throw new Error("Plan not found");
  }

  if (plan.status !== "APPROVED") {
    throw new Error("Plan must be approved before execution");
  }

  if (plan.riskScore > 80) {
    throw new Error("High-risk plan requires manual admin review");
  }

  /* ---------- REPLAY PROTECTION ---------- */

  if (plan.executedAt) {
    throw new Error("Plan already executed — replay blocked");
  }

  if (!plan.signature) {
    throw new Error("Plan signature missing");
  }

  /* ---------- INTEGRITY CHECK ---------- */

  const valid = verifyAIPlanSignature(
    {
      workspaceId: plan.workspaceId.toString(),
      projectId: plan.projectId.toString(),
      steps: plan.steps,
      riskScore: plan.riskScore,
      costEstimate: plan.costEstimate,
    },
    plan.signature,
  );

  if (!valid) {
    throw new Error("AI Plan integrity check failed");
  }

  const workspaceId = plan.workspaceId.toString();
  const projectId = plan.projectId.toString();

  const results: ExecutionResult[] = [];

  /* ---------- STEP EXECUTION ---------- */

  for (const step of plan.steps) {
    try {
      const result = await executeAIAction(
        workspaceId,
        projectId,
        step.payload,
      );

      /* ===== BLOCKED ===== */

      if (!result.success) {
        await logExecutionStep({
          workspaceId,
          projectId,
          planId: plan._id.toString(),
          stepId: step.id,
          action: step.action,
          status: "BLOCKED",
          input: step.payload,
          error: result.reason ?? "Blocked by policy",
        });

        results.push({
          stepId: step.id,
          success: false,
          message: result.reason,
        });

        continue;
      }

      /* ===== SUCCESS ===== */

      await logExecutionStep({
        workspaceId,
        projectId,
        planId: plan._id.toString(),
        stepId: step.id,
        action: step.action,
        status: "SUCCESS",
        input: step.payload,
        output: result.result,
      });

      results.push({
        stepId: step.id,
        success: true,
      });
    } catch (err: any) {
      /* ===== FAILURE ===== */

      await logExecutionStep({
        workspaceId,
        projectId,
        planId: plan._id.toString(),
        stepId: step.id,
        action: step.action,
        status: "FAILED",
        input: step.payload,
        error: err.message,
      });

      results.push({
        stepId: step.id,
        success: false,
        message: err.message,
      });
    }
  }

  /* ---------- FINALIZE PLAN ---------- */

  plan.status = "EXECUTED";
  plan.executedAt = new Date();
  await plan.save();

  return results;
};
