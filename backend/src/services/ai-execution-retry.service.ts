// src/services/ai-execution-retry.service.ts
import { AIExecution } from "../models/ai-execution.model";
import { executeSingleAIStep } from "./ai-execution-step.service";
import { executeAIPlanOrchestrator } from "./ai-orchestrator.service";
import { AppError } from "../errors/app-error";
import {
  AIActionPayload,
  AIStepStatus,
} from "../types/ai-system-actions.types";
import { ExecutionStatus } from "../enums/execution-status.enum";
import { markExecutionTerminal } from "./execution.service";

const MAX_RETRY_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 2000; // 2 seconds

/* =========================
   Utilities
========================= */

const calculateBackoff = (retryCount: number): number => {
  return BASE_BACKOFF_MS * Math.pow(2, retryCount);
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/* =========================
   Atomic Step Lock Helpers
========================= */

const LOCK_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

const acquireStepLock = async (
  workspaceId: string,
  executionId: string,
  stepIndex: number,
) => {
  const now = new Date();
  const staleThreshold = new Date(now.getTime() - LOCK_TIMEOUT_MS);

  const execution = await AIExecution.findOneAndUpdate(
    {
      workspaceId,
      executionId,
      $or: [
        { [`steps.${stepIndex}.isLocked`]: false },
        {
          [`steps.${stepIndex}.isLocked`]: true,
          [`steps.${stepIndex}.lockedAt`]: { $lt: staleThreshold },
        },
      ],
    },
    {
      $set: {
        [`steps.${stepIndex}.isLocked`]: true,
        [`steps.${stepIndex}.lockedAt`]: now,
      },
    },
    { new: true },
  );

  if (!execution) {
    throw new AppError(
      "Step is currently locked by another active process",
      409,
    );
  }

  return execution;
};

const releaseStepLock = async (
  workspaceId: string,
  executionId: string,
  stepIndex: number,
) => {
  await AIExecution.updateOne(
    { workspaceId, executionId },
    {
      $set: {
        [`steps.${stepIndex}.isLocked`]: false,
        [`steps.${stepIndex}.lockedAt`]: null,
      },
    },
  );
};

/* =========================
   Retry Failed Step
========================= */

export const retryFailedStep = async (
  workspaceId: string,
  executionId: string,
) => {
  const execution = await AIExecution.findOne({
    workspaceId,
    executionId,
  });

  if (!execution) {
    throw new AppError("Execution not found", 404);
  }

  if (execution.status !== ExecutionStatus.FAILED) {
    throw new AppError("Only FAILED executions can retry a step", 400);
  }

  if (execution.failedStep === undefined) {
    throw new AppError("No failed step to retry", 400);
  }

  const failedIndex = execution.failedStep;

  // ✅ Validate index properly
  if (failedIndex < 0 || failedIndex >= execution.plan.length) {
    throw new AppError("Invalid failed step index", 400);
  }

  const stepState = execution.steps[failedIndex];
  const stepPayload = execution.plan[failedIndex] as AIActionPayload;

  if (!stepState || !stepPayload) {
    throw new AppError("Failed step not found", 400);
  }

  /* =========================
     Retry Limit Protection
  ========================= */

  const currentRetryCount = stepState.retryCount ?? 0;

  if (currentRetryCount >= MAX_RETRY_ATTEMPTS) {
    await markExecutionTerminal(
      workspaceId,
      executionId,
      failedIndex,
      new Error("Max retry attempts exceeded"),
    );

    throw new AppError(`Retry limit reached (${MAX_RETRY_ATTEMPTS})`, 400);
  }

  /* =========================
     Acquire Atomic Lock
  ========================= */

  await acquireStepLock(workspaceId, executionId, failedIndex);

  try {
    /* =========================
       Exponential Backoff
    ========================= */

    const delay = calculateBackoff(currentRetryCount);
    await sleep(delay);

    /* =========================
       Update Step State
    ========================= */

    stepState.status = AIStepStatus.RUNNING;
    stepState.error = undefined;
    stepState.retryCount = currentRetryCount + 1;
    stepState.lastRetryAt = new Date();

    execution.status = ExecutionStatus.RUNNING;

    await execution.save();

    /* =========================
       Execute Step
    ========================= */

    await executeSingleAIStep(
      workspaceId,
      execution.projectId!.toString(),
      stepPayload,
    );

    /* =========================
       Mark Step Success
    ========================= */

    stepState.status = AIStepStatus.SUCCESS;
    execution.failedStep = undefined;

    await execution.save();

    /* =========================
       Continue Remaining Steps
    ========================= */

    const remainingPlan = execution.plan.slice(failedIndex + 1);

    if (remainingPlan.length > 0) {
      return executeAIPlanOrchestrator(
        workspaceId,
        execution.projectId,
        remainingPlan,
        {
          resumeFrom: failedIndex + 1,
          existingExecutionId: execution.executionId,
        },
      );
    }

    /* =========================
       All Steps Completed
    ========================= */

    execution.status = ExecutionStatus.COMPLETED;
    execution.completedAt = new Date();

    await execution.save();

    return execution;
  } catch (error: any) {
    stepState.status = AIStepStatus.FAILED;
    stepState.error = error?.message || "Unknown error";

    execution.status = ExecutionStatus.FAILED;
    execution.failedStep = failedIndex;

    await execution.save();

    throw error;
  } finally {
    await releaseStepLock(workspaceId, executionId, failedIndex);
  }
};
