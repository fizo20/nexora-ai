// src/services/ai-plan-metrics.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";

export interface AIPlanStepMetrics {
  action: string;
  risk: number;
  cost: number;
}

export interface AIPlanMetricsResult {
  totalRisk: number;
  totalCost: number;
  steps: AIPlanStepMetrics[];
  approvalRequired: boolean;
}

/**
 * Risk score (0–5)
 * Cost score (1–10)
 */
const ACTION_METRICS: Record<string, { risk: number; cost: number }> = {
  create_task: { risk: 1, cost: 2 },
  update_task: { risk: 2, cost: 3 },
  move_task: { risk: 2, cost: 3 },

  delete_task: { risk: 5, cost: 6 },

  create_comment: { risk: 1, cost: 1 },
  update_comment: { risk: 2, cost: 2 },
  delete_comment: { risk: 3, cost: 3 },

  update_project: { risk: 3, cost: 4 },
};

export const calculatePlanMetrics = (
  plan: AIActionPayload[],
): AIPlanMetricsResult => {
  const steps: AIPlanStepMetrics[] = [];

  let totalRisk = 0;
  let totalCost = 0;

  for (const step of plan) {
    const metrics = ACTION_METRICS[step.action] || {
      risk: 3,
      cost: 3,
    };

    steps.push({
      action: step.action,
      risk: metrics.risk,
      cost: metrics.cost,
    });

    totalRisk += metrics.risk;
    totalCost += metrics.cost;
  }

  /* ---------- approval rules ---------- */

  const approvalRequired = totalRisk >= 8 || steps.some((s) => s.risk >= 5);

  return {
    totalRisk,
    totalCost,
    steps,
    approvalRequired,
  };
};
