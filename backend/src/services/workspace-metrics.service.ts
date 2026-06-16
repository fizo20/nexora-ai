// src/services/workspace-metrics.service.ts
import { WorkspaceUsage } from "../models/workspace-usage.model";
import { AIAudit } from "../models/ai-audit.model";
import { WorkspaceMember } from "../models/workspace-member.model";
import { WorkspaceInvite } from "../models/workspace-invite.model";
import { WorkspaceRateLimit } from "../models/workspace-rate-limit.model";
import { Task } from "../models/task.model";
import { Project } from "../models/project.model";

/**
 * Workspace Metrics Aggregator
 *
 * Provides dashboard-ready metrics snapshot.
 * Read-only, safe, analytics layer.
 */
export const getWorkspaceMetrics = async (workspaceId: string) => {
  const now = new Date();
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  /* ---------- USAGE TOTALS ---------- */

  const usageAgg = await WorkspaceUsage.aggregate([
    {
      $match: {
        workspace: new (require("mongoose").Types.ObjectId)(workspaceId),
      },
    },
    {
      $group: {
        _id: "$feature",
        totalUnits: { $sum: "$units" },
      },
    },
  ]);

  /* ---------- AI ACTIVITY ---------- */

  const aiCalls = await AIAudit.countDocuments({
    workspaceId,
    createdAt: { $gte: last30Days },
  });

  /* ---------- SEAT METRICS ---------- */

  const memberCount = await WorkspaceMember.countDocuments({
    workspace: workspaceId,
  });

  const pendingInvites = await WorkspaceInvite.countDocuments({
    workspaceId,
    status: "pending",
    expiresAt: { $gt: now },
  });

  /* ---------- RATE LIMIT WINDOW ---------- */

  const rateLimits = await WorkspaceRateLimit.find({
    workspace: workspaceId,
  }).lean();

  /* ---------- PROJECT / TASK STATS ---------- */

  const projectCount = await Project.countDocuments({
    workspaceId,
    deletedAt: null,
  });

  const taskStats = await Task.aggregate([
    { $match: { workspaceId, deletedAt: null } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  return {
    usageByFeature: usageAgg,
    aiCallsLast30Days: aiCalls,
    seats: {
      members: memberCount,
      pendingInvites,
      total: memberCount + pendingInvites,
    },
    rateLimits,
    projects: projectCount,
    taskStats,
  };
};
