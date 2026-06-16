// src/services/ai-conflict-detector.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";
import { Task } from "../models/task.model";

export interface ConflictResult {
  hasConflicts: boolean;
  conflicts: string[];
}

export const detectPlanConflicts = async (
  workspaceId: string,
  plan: AIActionPayload[],
): Promise<ConflictResult> => {
  const conflicts: string[] = [];

  for (let i = 0; i < plan.length; i++) {
    const step = plan[i];

    if (
      step.action === "update_task_status" ||
      step.action === "set_task_priority"
    ) {
      const task = await Task.findOne({
        _id: step.taskId,
        workspaceId,
      }).lean();

      if (!task) {
        conflicts.push(
          `Step ${i}: Task ${step.taskId} does not exist in workspace`,
        );
      }
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
};
