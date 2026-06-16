// src/services/ai-plan-validator.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";

export interface PlanValidationResult {
  isValid: boolean;
  score: number; // 0 - 100
  errors: string[];
}

export const validateAIPlan = (
  plan: AIActionPayload[],
): PlanValidationResult => {
  const errors: string[] = [];

  if (!plan.length) {
    errors.push("Plan is empty");
  }

  plan.forEach((step, index) => {
    if (!step.action) {
      errors.push(`Step ${index} missing action`);
    }

    if (step.action === "create_task" && !step.title) {
      errors.push(`Step ${index} missing task title`);
    }

    if (
      (step.action === "update_task_status" ||
        step.action === "set_task_priority") &&
      !step.taskId
    ) {
      errors.push(`Step ${index} missing taskId`);
    }
  });

  const score = Math.max(0, 100 - errors.length * 10);

  return {
    isValid: errors.length === 0,
    score,
    errors,
  };
};
