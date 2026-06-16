// src/controllers/workspace-invite.controller.ts
// This file contains controllers related to workspace invitations, including inviting members and accepting invites.
import { Request, Response, NextFunction } from "express";
import {
  createWorkspaceInvite,
  acceptWorkspaceInvite,
} from "../services/workspace-invite.service";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";
import { sendResponse } from "../utils/sendResponse";
import { recordUsage } from "../services/usage-metering.service";

export const inviteWorkspaceMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth) {
      throw new AppError("Unauthorized", 401);
    }

    const auth = req.auth as AuthPayload;
    const { email, role } = req.body;

    if (!email || !role) {
      throw new AppError("Email and role are required", 400);
    }
    if (auth.role === "ADMIN" && role === "OWNER") {
      throw new AppError("Admins cannot invite owners", 403);
    }

    const invite = await createWorkspaceInvite({
      email,
      workspaceId: auth.workspaceId,
      role,
      invitedBy: auth.userId,
    });

    await recordUsage(auth.workspaceId, "member_invites", 1);

    res.status(201).json({
      message: "Invitation created",
      inviteId: invite._id,
    });
  } catch (err) {
    next(err);
  }
};

export const acceptInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { token } = req.body;
    const userId = req.auth?.userId;

    if (!token) {
      throw new AppError("Invite token required", 400);
    }

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const result = await acceptWorkspaceInvite(token, userId);

    return sendResponse({
      res,
      message: "Workspace invite accepted",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
