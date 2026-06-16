// src/services/workspace-seat.service.ts
import { WorkspaceMember } from "../models/workspace-member.model";
import { WorkspaceInvite } from "../models/workspace-invite.model";
import { Workspace } from "../models/workspace.model";
import { planFeatures } from "../config/plan-features";
import { AppError } from "../errors/app-error";

export const getWorkspaceSeatUsage = async (workspaceId: string) => {
  const memberCount = await WorkspaceMember.countDocuments({
    workspace: workspaceId,
  });

  const pendingInvitesCount = await WorkspaceInvite.countDocuments({
    workspaceId,
    status: "pending",
    expiresAt: { $gt: new Date() },
  });

  return {
    members: memberCount,
    pendingInvites: pendingInvitesCount,
    totalSeatsUsed: memberCount + pendingInvitesCount,
  };
};

export const assertWorkspaceHasSeatAvailable = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  if (workspace.seatOverflow) {
    throw new AppError(
      "Workspace exceeds plan seat limit — remove members or upgrade",
      402,
    );
  }
  const usage = await getWorkspaceSeatUsage(workspaceId);

  const limits = planFeatures[workspace.plan];

  if (usage.totalSeatsUsed >= limits.maxMembers) {
    throw new AppError("Workspace seat limit reached — upgrade plan", 402);
  }

  return usage;
};

export const getWorkspaceSeatUsageSummary = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  const usage = await getWorkspaceSeatUsage(workspaceId);
  const limits = planFeatures[workspace.plan];

  const remainingSeats = Math.max(limits.maxMembers - usage.totalSeatsUsed, 0);

  return {
    workspaceId,
    plan: workspace.plan,
    maxSeats: limits.maxMembers,
    usedSeats: usage.totalSeatsUsed,
    memberCount: usage.members,
    pendingInvites: usage.pendingInvites,
    remainingSeats,
  };
};

/**
 * Check and update seat overflow state after plan change
 */
export const updateSeatOverflowState = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  const usage = await getWorkspaceSeatUsage(workspaceId);
  const limits = planFeatures[workspace.plan];

  const overflow = usage.totalSeatsUsed > limits.maxMembers;

  if (workspace.seatOverflow !== overflow) {
    workspace.seatOverflow = overflow;
    await workspace.save();
  }

  return {
    overflow,
    used: usage.totalSeatsUsed,
    allowed: limits.maxMembers,
  };
};
