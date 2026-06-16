// src/services/billing-enforcement.service.ts
import { Workspace } from "../models/workspace.model";
import { getWorkspaceSeatUsage } from "./workspace-seat.service";
import { planFeatures } from "../config/plan-features";

/**
 * Checks whether workspace exceeds seat limit for its plan.
 * If exceeded — auto-suspends workspace.
 *
 * Safe to run after plan downgrade or webhook sync.
 */
export const enforceSeatLimitAfterPlanChange = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) return;

  const usage = await getWorkspaceSeatUsage(workspaceId);

  const limits = planFeatures[workspace.plan];

  if (usage.totalSeatsUsed > limits.maxMembers) {
    workspace.status = "SUSPENDED";
    workspace.seatOverflow = true;
    workspace.seatOverflowDetectedAt = new Date();
    await workspace.save();

    console.warn(
      `🚨 Seat overflow detected — workspace ${workspaceId} suspended. Used: ${usage.totalSeatsUsed}, Allowed: ${limits.maxMembers}`,
    );
  } else {
    // auto-clear if back within limits
    workspace.seatOverflow = false;
    workspace.seatOverflowDetectedAt = undefined;
    await workspace.save();
  }
};
