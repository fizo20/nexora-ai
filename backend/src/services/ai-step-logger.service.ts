// src/services/ai-step-logger.service.ts
import { AIExecutionStepState } from "../types/ai-system-actions.types";

export const logStepState = (
  executionId: string,
  step: AIExecutionStepState,
) => {
  console.log("[AI EXECUTION]", {
    executionId,
    stepIndex: step.index,
    action: step.action,
    status: step.status,
    error: step.error ?? null,
    timestamp: new Date(),
  });
};
