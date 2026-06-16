// src/controllers/workspace-seat-cleanup.controller.ts
// This file contains the controller for cleaning up workspace seats after a plan downgrade.
import { Request, Response, NextFunction } from "express";
import { removeWorkspaceMemberForCleanup } from "../services/workspace-seat-cleanup.service";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";
import { recordUsage } from "../services/usage-metering.service";

/**
 * Owner cleanup endpoint
 * Used after plan downgrade seat overflow
 */
export const cleanupSeatController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth) {
      throw new AppError("Unauthorized", 401);
    }

    const auth = req.auth as AuthPayload;

    if (!auth.workspaceId) {
      throw new AppError("Workspace context required", 403);
    }

    const rawMemberId = req.params.memberId;

    /* ---------- TYPE SAFE PARAM NORMALIZATION ---------- */
    const memberId = Array.isArray(rawMemberId) ? rawMemberId[0] : rawMemberId;

    if (!memberId) {
      throw new AppError("memberId is required", 400);
    }

    const result = await removeWorkspaceMemberForCleanup(
      auth.workspaceId,
      memberId,
    );

    res.json({
      success: true,
      message: "Member removed for seat cleanup",
      data: result,
    });
    await recordUsage(auth.workspaceId, "seat_cleanup_actions", 1);
  } catch (err) {
    next(err);
  }
};
