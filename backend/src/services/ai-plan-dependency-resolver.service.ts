// src/services/ai-plan-dependency-resolver.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";

export const resolveExecutionBatches = (plan: AIActionPayload[]) => {
  const resolved: number[] = [];
  const batches: number[][] = [];

  while (resolved.length < plan.length) {
    const batch: number[] = [];

    for (let i = 0; i < plan.length; i++) {
      if (resolved.includes(i)) continue;

      const deps = plan[i].dependsOn ?? [];

      const canRun = deps.every((d) => resolved.includes(d));

      if (canRun) {
        batch.push(i);
      }
    }

    if (batch.length === 0) {
      throw new Error("Circular dependency detected in AI plan");
    }

    batches.push(batch);
    resolved.push(...batch);
  }

  return batches;
};
