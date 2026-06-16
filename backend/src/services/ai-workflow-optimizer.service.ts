// src/services/ai-workflow-optimizer.service.ts
import { AIExecutionMemory } from "../models/ai-execution-memory.model";

interface OptimizeInput {
  workspaceId: string;
  projectId: string;
}

interface OptimizationSuggestion {
  actionType: string;
  averageDuration: number;
  failureRate: number;
  suggestion: "move_earlier" | "move_later" | "keep" | "remove";
}

/*
 AI WORKFLOW OPTIMIZER
 Learns from historical execution memory
*/
export async function analyzeWorkflowOptimization(
  input: OptimizeInput,
): Promise<OptimizationSuggestion[]> {
  const history = await AIExecutionMemory.find({
    workspaceId: input.workspaceId,
    projectId: input.projectId,
  }).limit(500);

  if (!history.length) {
    console.warn("No execution history found for optimization");
    throw new Error("No execution history found for optimization");
  }

  const stats: Record<string, any> = {};

  for (const record of history) {
    if (!stats[record.actionType]) {
      stats[record.actionType] = {
        count: 0,
        failures: 0,
        totalDuration: 0,
      };
    }

    stats[record.actionType].count++;

    if (record.outcome === "failed") {
      stats[record.actionType].failures++;
    }

    stats[record.actionType].totalDuration += record.duration || 0;
  }

  const suggestions: OptimizationSuggestion[] = [];

  for (const actionType of Object.keys(stats)) {
    const data = stats[actionType];

    const avgDuration = data.totalDuration / data.count;
    const failureRate = data.failures / data.count;

    let suggestion: OptimizationSuggestion["suggestion"] = "keep";

    if (failureRate > 0.6) {
      suggestion = "remove";
    } else if (avgDuration > 5000) {
      suggestion = "move_earlier";
    } else if (failureRate > 0.3) {
      suggestion = "move_later";
    }

    suggestions.push({
      actionType,
      averageDuration: avgDuration,
      failureRate,
      suggestion,
    });
  }

  return suggestions;
}
