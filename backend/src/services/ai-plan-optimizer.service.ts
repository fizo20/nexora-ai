// src/services/ai-plan-optimizer.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";

export interface OptimizationResult {
  optimizedPlan: AIActionPayload[];
  removedSteps: number;
  mergedSteps: number;
}

/**
 * Optimizes AI plan before execution.
 * - Removes redundant updates
 * - Merges compatible operations
 * - Ensures minimal action set
 */
export const optimizeAIPlan = (plan: AIActionPayload[]): OptimizationResult => {
  const optimized: AIActionPayload[] = [];
  let removed = 0;
  let merged = 0;

  const taskUpdateMap = new Map<string, AIActionPayload>();

  for (const step of plan) {
    switch (step.action) {
      case "update_task_status":
      case "set_task_priority": {
        // Merge updates on same task
        const key = step.taskId;

        if (taskUpdateMap.has(key)) {
          const existing = taskUpdateMap.get(key)!;

          taskUpdateMap.set(key, {
            ...existing,
            ...step, // merge fields
          });

          merged++;
        } else {
          taskUpdateMap.set(key, step);
        }

        break;
      }

      case "create_task": {
        optimized.push(step);
        break;
      }

      default:
        optimized.push(step);
    }
  }

  // Add merged updates
  for (const update of taskUpdateMap.values()) {
    optimized.push(update);
  }

  // Remove exact duplicates
  const uniquePlan = Array.from(
    new Map(optimized.map((step) => [JSON.stringify(step), step])).values(),
  );

  removed = optimized.length - uniquePlan.length;

  return {
    optimizedPlan: uniquePlan,
    removedSteps: removed,
    mergedSteps: merged,
  };
};
