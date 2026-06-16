// src/services/ai-strategy-engine.service.ts
import { buildWorkspaceState } from "./ai-context.service";

interface StrategyInput {
  workspaceId: string;
  projectId: string;
}

interface StrategyReport {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  reasons: string[];
  recommendations: string[];
}

/**
 * AI Strategy Engine
 *
 * Analyzes workspace health and predicts project risk.
 */
export async function analyzeWorkspaceStrategy(
  input: StrategyInput,
): Promise<StrategyReport> {
  const { workspaceId, projectId } = input;

  const state = await buildWorkspaceState(workspaceId, projectId);

  const reasons: string[] = [];
  const recommendations: string[] = [];

  let riskScore = 0;

  /* =========================
     Blocked Tasks
  ========================= */

  if (state.blockedTasks > 0) {
    riskScore += 2;

    reasons.push(`${state.blockedTasks} blocked tasks detected`);

    recommendations.push("Resolve blocked tasks or assign support resources");
  }

  /* =========================
     Overdue Tasks
  ========================= */

  if (state.overdueTasks > 0) {
    riskScore += 2;

    reasons.push(`${state.overdueTasks} overdue tasks detected`);

    recommendations.push("Prioritize overdue tasks to prevent delivery delays");
  }

  /* =========================
     High Task Load
  ========================= */

  if (state.tasksCount > 100) {
    riskScore += 1;

    reasons.push("High task workload detected");

    recommendations.push("Consider splitting tasks across multiple sprints");
  }

  /* =========================
     Determine Risk Level
  ========================= */

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" = "LOW";

  if (riskScore >= 4) {
    riskLevel = "HIGH";
  } else if (riskScore >= 2) {
    riskLevel = "MEDIUM";
  }

  return {
    riskLevel,
    reasons,
    recommendations,
  };
}
