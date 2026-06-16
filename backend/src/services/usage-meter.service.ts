// src/services/usage-meter.service.ts
import { Types } from "mongoose";
import { UsageRecord } from "../models/usage-record.model";

/**
 * Records usage safely and consistently
 */
export const recordUsage = async (
  workspaceId: string,
  metric: string,
  quantity = 1,
) => {
  await UsageRecord.create({
    workspaceId: new Types.ObjectId(workspaceId),
    metric,
    quantity,
  });
};
