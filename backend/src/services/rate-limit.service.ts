// src/services/rate-limit.service.ts
import { WorkspaceRateLimit } from "../models/workspace-rate-limit.model";

export const checkAndIncrementUsage = async (
  workspaceId: string,
  key: string,
  limit: number,
  windowMs: number,
) => {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMs);

  let usage = await WorkspaceRateLimit.findOne({
    workspace: workspaceId,
    key,
  });

  if (!usage || usage.windowStart < windowStart) {
    usage = await WorkspaceRateLimit.create({
      workspace: workspaceId,
      key,
      count: 1,
      windowStart: now,
    });
    return;
  }

  if (usage.count >= limit) {
    throw new Error("Rate limit exceeded");
  }

  usage.count += 1;
  await usage.save();
};
