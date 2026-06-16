// src/services/analytics.service.ts
import mongoose from "mongoose";
import { Workspace } from "../models/workspace.model";
import { getWorkspaceMonthlyUsage } from "./ai-usage.service";

type RangeType = "7d" | "30d" | "90d";

export const getWorkspaceAnalytics = async (
  workspaceId: string,
  range: RangeType = "7d",
) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new Error("Workspace not found");
  }

  /* =========================
     DATE RANGE LOGIC ✅
  ========================= */
  const daysMap = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
  };

  const days = daysMap[range] || 7;

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  /* =========================
     AI USAGE
  ========================= */
  const usage = await getWorkspaceMonthlyUsage(workspaceId);

  const AI_LIMITS: Record<string, number> = {
    FREE: 50,
    PRO: 10000,
    ENTERPRISE: Infinity,
  };

  const limit = AI_LIMITS[workspace.plan];

  const usagePercentage =
    limit === Infinity ? 0 : Math.min((usage.totalCalls / limit) * 100, 100);

  /* =========================
     USAGE TREND (DYNAMIC RANGE) ✅
  ========================= */
  const usageTrend = await mongoose.connection
    .collection("usage_events") // ✅ FIXED (your actual collection)
    .aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
          createdAt: { $gte: startDate },
          metric: "api_calls",
        },
      },
      {
        $group: {
          _id: {
            date: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
          },
          total: { $sum: "$quantity" },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ])
    .toArray();

  /* =========================
     TASK ANALYTICS
  ========================= */
  const tasks = await mongoose.connection
    .collection("tasks")
    .aggregate([
      {
        $match: {
          workspaceId: new mongoose.Types.ObjectId(workspaceId),
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "DONE"] }, 1, 0],
            },
          },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ["$dueDate", new Date()] },
                    { $ne: ["$status", "DONE"] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ])
    .toArray();

  const taskStats = tasks[0] || {
    total: 0,
    completed: 0,
    overdue: 0,
  };

  const completionRate =
    taskStats.total === 0
      ? 0
      : Math.round((taskStats.completed / taskStats.total) * 100);

  /* =========================
     AI INSIGHTS ENGINE 🧠
  ========================= */
  const insights: string[] = [];

  if (usagePercentage > 80) {
    insights.push("High AI usage — upgrade recommended");
  }

  if (taskStats.overdue > 5) {
    insights.push("Too many overdue tasks — workflow inefficiency detected");
  }

  if (completionRate < 50) {
    insights.push("Low task completion rate — team productivity risk");
  }

  if (insights.length === 0) {
    insights.push("Workspace operating efficiently");
  }

  /* =========================
     FINAL RESPONSE
  ========================= */
  return {
    plan: workspace.plan,

    usage: {
      total: usage.totalCalls,
      limit,
      percentage: Math.round(usagePercentage),
    },

    tasks: {
      total: taskStats.total,
      completed: taskStats.completed,
      overdue: taskStats.overdue,
      completionRate,
    },

    insights,
    usageTrend,
  };
};
