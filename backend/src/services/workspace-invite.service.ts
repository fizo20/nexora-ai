// src/services/workspace-invite.service.ts
import crypto from "crypto";
import { WorkspaceInvite } from "../models/workspace-invite.model";

import { WorkspaceMember } from "../models/workspace-member.model";
import { AppError } from "../errors/app-error";
import { Types } from "mongoose";
import { Workspace } from "../models/workspace.model";
import { planFeatures } from "../config/plan-features";
import { assertWorkspaceHasSeatAvailable } from "./workspace-seat.service";

export const createWorkspaceInvite = async ({
  email,
  workspaceId,
  role,
  invitedBy,
}: {
  email: string;
  workspaceId: string;
  role: string;
  invitedBy: string;
}) => {
  // 1️⃣ Load workspace
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }
  /* ---------- SEAT OVERFLOW BLOCK ---------- */
  if (workspace.seatOverflow) {
    throw new AppError(
      "Seat overflow — remove members before inviting new ones",
      402,
    );
  }

  await assertWorkspaceHasSeatAvailable(workspaceId);
  // 2️⃣ Resolve plan limits
  const features = planFeatures[workspace.plan];

  // 3️⃣ Count existing members
  const memberCount = await WorkspaceMember.countDocuments({
    workspaceId,
  });

  // 4️⃣ Count pending invites
  const pendingInvitesCount = await WorkspaceInvite.countDocuments({
    workspaceId,
    status: "pending",
    expiresAt: { $gt: new Date() },
  });

  const totalSeatsUsed = memberCount + pendingInvitesCount;

  // 5️⃣ Enforce member limit
  if (totalSeatsUsed >= features.maxMembers) {
    throw new AppError(
      "Workspace member limit reached. Upgrade your plan to add more members.",
      402,
    );
  }

  // Enforce seat availability
  await assertWorkspaceHasSeatAvailable(workspaceId);

  // 6️⃣ Generate invite token
  const token = crypto.randomBytes(32).toString("hex");

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // 7️⃣ Create invite
  const invite = await WorkspaceInvite.create({
    email,
    workspaceId,
    role,
    invitedBy,
    token,
    expiresAt,
  });

  return invite;
};

export const acceptWorkspaceInvite = async (token: string, userId: string) => {
  const invite = await WorkspaceInvite.findOne({ token });

  if (!invite) {
    throw new AppError("Invalid invite token", 400);
  }

  if (invite.status !== "pending") {
    throw new AppError("Invite already used or expired", 400);
  }

  if (invite.expiresAt < new Date()) {
    invite.status = "expired";
    await invite.save();
    throw new AppError("Invite has expired", 400);
  }

  /* ---------- LOAD WORKSPACE ---------- */
  const workspace = await Workspace.findById(invite.workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  /* ---------- SEAT OVERFLOW BLOCK ---------- */
  // If workspace is already over seat limit after downgrade,
  // no new members should be allowed until cleanup happens.
  if (workspace.seatOverflow) {
    throw new AppError(
      "Seat overflow — workspace requires cleanup before accepting invites",
      402,
    );
  }

  const existingMember = await WorkspaceMember.findOne({
    workspace: invite.workspaceId,
    user: userId,
  });

  if (existingMember) {
    throw new AppError("User already belongs to this workspace", 400);
  }

  /* ---------- SEAT LIMIT CHECK ---------- */
  await assertWorkspaceHasSeatAvailable(invite.workspaceId.toString());

  /* ---------- CREATE MEMBER ---------- */
  await WorkspaceMember.create({
    workspace: invite.workspaceId,
    user: new Types.ObjectId(userId),
    role: invite.role,
  });

  invite.status = "accepted";
  await invite.save();

  return {
    workspaceId: invite.workspaceId.toString(),
    role: invite.role,
  };
};
