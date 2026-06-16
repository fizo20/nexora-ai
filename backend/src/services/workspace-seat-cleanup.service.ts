// src/services/workspace-seat-cleanup.service.ts
import { WorkspaceMember } from "../models/workspace-member.model";
import { Workspace } from "../models/workspace.model";
import { planFeatures } from "../config/plan-features";
import { AppError } from "../errors/app-error";
import { getWorkspaceSeatUsage } from "./workspace-seat.service";

/**
 * Remove a workspace member during downgrade cleanup
 * Only OWNER should be allowed to call this via controller
 */
export const removeWorkspaceMemberForCleanup = async (
  workspaceId: string,
  memberId: string,
) => {
  /* ---------- VALIDATE WORKSPACE ---------- */
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  /* ---------- REMOVE MEMBER ---------- */
  const deleted = await WorkspaceMember.findOneAndDelete({
    _id: memberId,
    workspace: workspaceId,
  });

  if (!deleted) {
    throw new AppError("Member not found in workspace", 404);
  }

  /* ---------- RECHECK SEAT USAGE ---------- */
  const usage = await getWorkspaceSeatUsage(workspaceId);
  const limits = planFeatures[workspace.plan];

  /* ---------- CLEAR OVERFLOW IF FIXED ---------- */
  if (usage.totalSeatsUsed <= limits.maxMembers) {
    workspace.seatOverflow = false;
    await workspace.save();
  }

  return {
    removedMemberId: memberId,
    usage,
    limit: limits.maxMembers,
    overflowCleared: !workspace.seatOverflow,
  };
};
