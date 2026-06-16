// backend/src/services/ai-analytics.service.ts
import { AIExecutionMemory } from "../models/ai-execution-memory.model";
import { AIActivity } from "../models/ai-activity.model";
import { AIAudit } from "../models/ai-audit.model";
import { WorkspaceRateLimit } from "../models/workspace-rate-limit.model";
import { Task } from "../models/task.model";
import { getAgentAnalytics } from "./ai-agent-analytics.service";

export async function getAIAnalytics(workspaceId: string) {
  const [
    executions,
    recentActivity,
    aiCalls,
    rateLimits,
    tasks,
    agentAnalytics,
  ] = await Promise.all([
    AIExecutionMemory.find({ workspaceId }).lean(),

    AIActivity.find({ workspaceId }).sort({ createdAt: -1 }).limit(50).lean(),

    AIAudit.countDocuments({
      workspaceId,
    }),

    WorkspaceRateLimit.find({
      workspace: workspaceId,
    }).lean(),

    Task.find({
      workspaceId,
      deletedAt: null,
    }).lean(),
    getAgentAnalytics(workspaceId),
  ]);

  /* =========================
     EXECUTION METRICS
  ========================= */

  const totalExecutions = executions.length;

  const successfulExecutions = executions.filter(
    (e) => e.outcome === "success",
  ).length;

  const failedExecutions = executions.filter(
    (e) => e.outcome === "failed",
  ).length;

  const successRate =
    totalExecutions === 0
      ? 0
      : Number(((successfulExecutions / totalExecutions) * 100).toFixed(2));

  const failureRate =
    totalExecutions === 0
      ? 0
      : Number(((failedExecutions / totalExecutions) * 100).toFixed(2));

  /* =========================
     FAILURE ANALYTICS
  ========================= */

  const failureMap: Record<string, number> = {};

  executions.forEach((execution: any) => {
    if (execution.outcome === "failed" && execution.stepError) {
      failureMap[execution.stepError] =
        (failureMap[execution.stepError] || 0) + 1;
    }
  });

  const commonFailures = Object.entries(failureMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([failure, count]) => ({
      failure,
      count,
    }));

  /* =========================
     AUTONOMOUS AI
  ========================= */

  const autonomousActions = recentActivity.filter(
    (activity) => activity.type === "autonomous_action",
  ).length;

  /* =========================
     PRODUCTIVITY SCORE
  ========================= */

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task: any) => task.status === "DONE" || task.status === "COMPLETED",
  ).length;

  const overdueTasks = tasks.filter(
    (task: any) => task.status === "OVERDUE",
  ).length;

  let productivityScore = 0;

  if (totalTasks > 0) {
    productivityScore = Math.max(
      0,
      Math.round(
        (completedTasks / totalTasks) * 100 - (overdueTasks / totalTasks) * 25,
      ),
    );
  }

  /* =========================
     EXECUTION CHART
  ========================= */

  const executionTimeline: Record<string, number> = {};

  executions.forEach((execution: any) => {
  const date = execution.createdAt
  ? new Date(execution.createdAt).toISOString().split("T")[0]
  : "unknown";

    executionTimeline[date] = (executionTimeline[date] || 0) + 1;
  });

  const executionChart = Object.entries(executionTimeline).map(
    ([date, total]) => ({
      date,
      total,
    }),
  );

  return {
    totals: {
      totalExecutions,
      successfulExecutions,
      failedExecutions,
      autonomousActions,
      aiCalls,
      agentAnalytics,
    },

    performance: {
      successRate,
      failureRate,
      productivityScore,
    },

    failures: commonFailures,

    rateLimits,

    executionChart,

    activityFeed: recentActivity,
  };
}
