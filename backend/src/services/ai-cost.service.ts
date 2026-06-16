// src/services/ai-cost.service.ts
import { Types } from "mongoose";
import { AIAudit } from "../models/ai-audit.model";

export const getWorkspaceMonthlyAICost = async (workspaceId: string) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const result = await AIAudit.aggregate([
    {
      $match: {
        workspaceId: new Types.ObjectId(workspaceId),
        createdAt: { $gte: since },
      },
    },
    {
      $group: {
        _id: null,
        totalCost: { $sum: "$cost" },
      },
    },
  ]);

  return Number(result[0]?.totalCost ?? 0);
};
