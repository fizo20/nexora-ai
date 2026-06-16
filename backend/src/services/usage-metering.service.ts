// src/services/usage-meter.service.ts
import { WorkspaceUsage } from "../models/workspace-usage.model";

/**
 * Records billable usage for a workspace
 *
 * Safe to call from anywhere in the codebase.
 */
export const recordUsage = async (
  workspaceId: string,
  feature: string,
  units = 1,
) => {
  await WorkspaceUsage.create({
    workspace: workspaceId,
    feature,
    units,
  });
};
