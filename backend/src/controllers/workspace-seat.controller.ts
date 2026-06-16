// src/controllers/workspace-seat.controller.ts
import { Request, Response, NextFunction } from "express";
import { getWorkspaceSeatUsageSummary } from "../services/workspace-seat.service";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

/**
 * Get workspace seat usage
 *
 * Read-only endpoint.
 * Returns:
 * - member count
 * - pending invites
 * - total seats used
 * - plan seat limit
 * - remaining seats
 *
 * Requires workspace-scoped JWT.
 */

export const getSeatUsageController = async (
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

    const usage = await getWorkspaceSeatUsageSummary(auth.workspaceId);

    res.json({
      success: true,
      data: usage,
    });
  } catch (err) {
    next(err);
  }
};
