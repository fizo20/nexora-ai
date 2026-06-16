// src/services/ai-learning-engine.service.ts
import { AIExecutionMemory } from "../models/ai-execution-memory.model";

interface ToolLearningStats {
  tool: string;
  successCount: number;
  failureCount: number;
  successRate: number;
}

interface LearningResult {
  toolStats: ToolLearningStats[];
  recommendedTools: string[];
  riskyTools: string[];
}

const LEARNING_HISTORY_LIMIT = 200;

/**
 * AI Learning Engine
 *
 * Learns from historical execution results
 * and calculates tool reliability.
 *
 * PERFORMANCE: bounded to the most recent
 * LEARNING_HISTORY_LIMIT records to avoid an
 * unbounded collection scan on every chat message.
 */
export async function analyzeLearning(
  workspaceId: string,
  projectId?: string,
): Promise<LearningResult> {
  const records = await AIExecutionMemory.find({
    workspaceId,
    ...(projectId && { projectId }),
  })
    .sort({ timestamp: -1 })
    .limit(LEARNING_HISTORY_LIMIT)
    .lean();

  if (!records.length) {
    return {
      toolStats: [],
      recommendedTools: [],
      riskyTools: [],
    };
  }

  const toolMap: Record<string, { success: number; failure: number }> = {};

  for (const record of records) {
    const tool = record.actionType;

    if (!toolMap[tool]) {
      toolMap[tool] = { success: 0, failure: 0 };
    }

    if (record.outcome === "success") {
      toolMap[tool].success++;
    }

    if (record.outcome === "failed") {
      toolMap[tool].failure++;
    }
  }

  const toolStats: ToolLearningStats[] = Object.entries(toolMap).map(
    ([tool, stats]) => {
      const total = stats.success + stats.failure;

      return {
        tool,
        successCount: stats.success,
        failureCount: stats.failure,
        successRate: total > 0 ? stats.success / total : 0,
      };
    },
  );

  const recommendedTools = toolStats
    .filter((t) => t.successRate >= 0.7 && t.successCount + t.failureCount >= 3)
    .map((t) => t.tool);

  const riskyTools = toolStats
    .filter((t) => t.successRate < 0.4 && t.successCount + t.failureCount >= 3)
    .map((t) => t.tool);

  return {
    toolStats,
    recommendedTools,
    riskyTools,
  };
}
