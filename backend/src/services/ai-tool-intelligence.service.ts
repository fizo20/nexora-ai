// src/services/ai-tool-intelligence.service.ts
import { AIToolMetrics } from "../models/ai-tool-metrics.model";

export async function recordDecisionMetric(params: {
  workspaceId: string;
  action: string;
  decision: string;
  success: boolean;
}) {
  console.log("📊 Decision Metric:", params);

  // Future: store in DB for ML optimization
}
/**
 * Record tool execution metrics
 */
export async function recordToolMetrics(params: {
  workspaceId: string;
  toolName: string;
  success: boolean;
  duration: number;
}) {
  const { workspaceId, toolName, success, duration } = params;

  const metrics = await AIToolMetrics.findOne({
    workspaceId,
    toolName,
  });

  if (!metrics) {
    await AIToolMetrics.create({
      workspaceId,
      toolName,
      usageCount: 1,
      successCount: success ? 1 : 0,
      failureCount: success ? 0 : 1,
      totalDuration: duration,
    });

    return;
  }

  metrics.usageCount += 1;
  metrics.totalDuration += duration;

  if (success) metrics.successCount += 1;
  else metrics.failureCount += 1;

  metrics.updatedAt = new Date();

  await metrics.save();
}

export async function getToolPerformance(
  workspaceId: string,
  toolName: string,
) {
  const metrics = await AIToolMetrics.findOne({
    workspaceId,
    toolName,
  });

  if (!metrics) {
    return {
      successRate: 1,
      avgDuration: 0,
    };
  }

  const successRate = metrics.successCount / Math.max(metrics.usageCount, 1);

  const avgDuration = metrics.totalDuration / Math.max(metrics.usageCount, 1);

  return {
    successRate,
    avgDuration,
  };
}
