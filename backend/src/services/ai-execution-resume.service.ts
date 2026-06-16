// src/services/ai-execution-resume.service.ts
import { AIExecution } from "../models/ai-execution.model";
import { executeAIPlanOrchestrator } from "./ai-orchestrator.service";
import { AppError } from "../errors/app-error";
import { AIActionPayload } from "../types/ai-system-actions.types";
import { AIStepStatus } from "../types/ai-system-actions.types";
import { ExecutionStatus } from "../enums/execution-status.enum";

export const resumeAIExecution = async (
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

  if (execution.status !== "FAILED") {
    throw new AppError("Only failed executions can be resumed", 400);
  }

  if (execution.failedStep === undefined) {
    throw new AppError("No failed step found", 400);
  }

  const remainingPlan = execution.plan.slice(
    execution.failedStep,
  ) as AIActionPayload[];

  if (!remainingPlan.length) {
    throw new AppError("No remaining steps to execute", 400);
  }

  return executeAIPlanOrchestrator(
    workspaceId,
    execution.projectId,
    remainingPlan,
    {
      resumeFrom: execution.failedStep,
      existingExecutionId: execution.executionId,
    },
  );
};

export async function resumeExecution(executionId: string) {
  const execution = await AIExecution.findById(executionId);

  if (!execution) return;

  if (execution.status === ExecutionStatus.TERMINAL) return;

  for (const step of execution.steps) {
    if (step.status === AIStepStatus.FAILED && step.retryCount < 3) {
      // Re-dispatch this step to execution engine
      console.log("Resuming step", step.index);
    }
  }
}
