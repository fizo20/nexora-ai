// src/services/ai-usage.service.ts
import { Types } from "mongoose";
import { AIAudit } from "../models/ai-audit.model";

/**
 * Count AI calls in rolling window
 */
export const countWorkspaceAICalls = async (workspaceId: string, days = 30) => {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return AIAudit.countDocuments({
    workspaceId: new Types.ObjectId(workspaceId),
    createdAt: { $gte: since },
  });
};

/**
 * AI Usage Service
 *
 * Calculates AI usage for current calendar month.
 * Uses Mongo aggregation for performance.
 */
export const getWorkspaceMonthlyUsage = async (workspaceId: string) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const result = await AIAudit.aggregate([
    {
      $match: {
        workspaceId: new Types.ObjectId(workspaceId),
        createdAt: { $gte: monthStart },
      },
    },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        totalInputSize: { $sum: "$inputSize" },
        totalOutputSize: { $sum: "$outputSize" },
      },
    },
  ]);

  return (
    result[0] ?? {
      totalCalls: 0,
      totalInputSize: 0,
      totalOutputSize: 0,
    }
  );
};
