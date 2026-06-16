// src/services/execution.service.ts
import { AIExecution } from "../models/ai-execution.model";
import { ExecutionStatus } from "../enums/execution-status.enum";
import { AppError } from "../errors/app-error";
import {
  AIStepStatus,
  AIActionPayload,
} from "../types/ai-system-actions.types";
import { v4 as uuidv4 } from "uuid";

export const markExecutionTerminal = async (
  workspaceId: string,
  executionId: string,
  stepIndex: number,
  error: Error,
) => {
  const execution = await AIExecution.findOne({
    workspaceId,
    executionId,
  });

  if (!execution) {
    throw new AppError("Execution not found", 404);
  }

  if (stepIndex < 0 || stepIndex >= execution.plan.length) {
    throw new Error("Invalid step index");
  }

  if (execution.status === ExecutionStatus.TERMINAL) {
    return; // already terminal, do nothing
  }

  execution.status = ExecutionStatus.TERMINAL;
  execution.failure = {
    reason: "MAX_RETRIES_EXCEEDED",
    stepIndex,
    errorMessage: error.message,
    failedAt: new Date(),
  };

  await execution.save();

  // 🔎 Check if all steps succeeded
  const allSucceeded = execution.steps.every(
    (s) => s.status === AIStepStatus.SUCCESS,
  );

  if (allSucceeded) {
    execution.status = ExecutionStatus.COMPLETED;
    execution.completedAt = new Date();
    await execution.save();
  }
  console.error("Execution moved to TERMINAL:", executionId);
};

export const createExecution = async (
  workspaceId: string,
  projectId: string,
  plan: AIActionPayload[],
) => {
  if (!plan || plan.length === 0) {
    throw new Error("Execution plan cannot be empty");
  }

  const executionId = uuidv4();

  const steps = plan.map((action, index) => ({
    index,
    action: action.action,
    status: AIStepStatus.PENDING,
    retryCount: 0,
    isLocked: false,
  }));

  if (steps.length !== plan.length) {
    throw new Error("Plan and steps length mismatch");
  }

  const execution = await AIExecution.create({
    executionId,
    workspaceId,
    projectId,
    status: ExecutionStatus.PENDING,
    plan,
    steps,
    completedSteps: 0,
    startedAt: new Date(),
  });

  return execution;
};
