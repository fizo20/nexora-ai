// src/services/ai-step-validator.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";
import { AppError } from "../errors/app-error";

export const validateAIStep = (step: AIActionPayload): void => {
  switch (step.action) {
    case "create_task":
      if (!step.title) {
        throw new AppError("create_task requires title", 400);
      }
      return;

    case "update_task_status":
      if (!step.taskId || !step.status) {
        throw new AppError(
          "update_task_status requires taskId and status",
          400,
        );
      }
      return;

    case "set_task_priority":
      if (!step.taskId || !step.priority) {
        throw new AppError(
          "set_task_priority requires taskId and priority",
          400,
        );
      }
      return;
  }

  // Exhaustiveness safety
  const _exhaustiveCheck: never = step;
  throw new AppError(`Unsupported AI action`, 400);
};
