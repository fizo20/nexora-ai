//  src/services/ai-risk-analyzer.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";

export interface PlanRiskResult {
  riskScore: number; // 0 - 100
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
}

export const analyzePlanRisk = (plan: AIActionPayload[]): PlanRiskResult => {
  let riskScore = 0;
  const reasons: string[] = [];

  if (plan.length > 10) {
    riskScore += 20;
    reasons.push("Large multi-step plan");
  }

  const highPriorityChanges = plan.filter(
    (p) => p.action === "set_task_priority" && p.priority === "HIGH",
  );

  if (highPriorityChanges.length > 3) {
    riskScore += 25;
    reasons.push("Multiple HIGH priority changes");
  }

  if (riskScore >= 60) {
    return { riskScore, riskLevel: "HIGH", reasons };
  }

  if (riskScore >= 30) {
    return { riskScore, riskLevel: "MEDIUM", reasons };
  }

  return { riskScore, riskLevel: "LOW", reasons };
};
