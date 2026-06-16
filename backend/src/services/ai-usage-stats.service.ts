// src/services/ai-usage-stats.service.ts
import { getWorkspaceMonthlyUsage } from "./ai-usage.service";
import { AI_LIMITS } from "../config/ai-limits.config";
import { Workspace } from "../models/workspace.model";

export const getWorkspaceUsageStats = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  const usage = await getWorkspaceMonthlyUsage(workspaceId);
  const limits = AI_LIMITS[workspace.plan];

  const percentage = Math.min((usage.totalCalls / limits.aiCalls) * 100, 100);

  return {
    plan: workspace.plan,
    usage: usage.totalCalls,
    limit: limits.aiCalls,
    percentage: Math.round(percentage),
  };
};
