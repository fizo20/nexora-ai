// src/services/usage-quota.service.ts
import { Workspace } from "../models/workspace.model";
import { planFeatures } from "../config/plan-features";
import { UsageRecord } from "../models/usage-record.model";

export const getCurrentUsage = async (workspaceId: string) => {
  const result = await UsageRecord.aggregate([
    { $match: { workspaceId } },
    { $group: { _id: null, total: { $sum: "$quantity" } } },
  ]);

  return result[0]?.total || 0;
};

export const isOverQuota = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return false;

  const limit = planFeatures[workspace.plan].includedApiCalls;
  const used = await getCurrentUsage(workspaceId);

  return used > limit;
};
