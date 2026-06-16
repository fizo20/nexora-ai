// src/controllers/workspace.controller.ts
import { Request, Response, NextFunction } from "express";
import {
  createWorkspace,
  getUserWorkspaces,
} from "../services/workspace.service";
import { sendResponse } from "../utils/sendResponse";
import { AppError } from "../utils/app-error";
import { switchWorkspace } from "../services/workspace.service";
import { signWorkspaceAccessToken } from "../utils/jwt";
import {
  recordUsage,
  reportUsageToStripe,
} from "../services/usage-report.service";
import { AuthPayload } from "../types/auth.types";

/**
 * POST /api/workspaces
 * Create a new workspace
 */
export const createWorkspaceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth) {
      return next(new AppError("Unauthorized", 401));
    }

    const { userId } = req.auth;
    const { name } = req.body;

    const workspace = await createWorkspace(userId, name);

    return sendResponse({
      res,
      statusCode: 201,
      message: "Workspace created successfully",
      data: workspace,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/workspaces
 * List all workspaces for authenticated user
 */
export const listUserWorkspacesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth) {
      return next(new AppError("Unauthorized", 401));
    }

    const { userId } = req.auth;

    const workspaces = await getUserWorkspaces(userId);

    return sendResponse({
      res,
      message: "Workspaces fetched successfully",
      data: workspaces,
    });
  } catch (error) {
    next(error);
  }
};

export const switchWorkspaceHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth) {
      throw new AppError("Unauthorized", 401);
    }

    const { userId } = req.auth;

    /**
     * Normalize workspaceId (Express params can be string | string[])
     */
    const rawWorkspaceId = req.params.workspaceId;

    if (!rawWorkspaceId || Array.isArray(rawWorkspaceId)) {
      throw new AppError("Invalid workspace id", 400);
    }

    const workspaceId = rawWorkspaceId;

    const { role } = await switchWorkspace(userId, workspaceId);

    /* ✅ BILLABLE USAGE — workspace API execution */
    await recordUsage(workspaceId, "api_calls", 1);
    await reportUsageToStripe(workspaceId, 1);

    const accessToken = signWorkspaceAccessToken({
      userId,
      workspaceId,
      role,
      plan: (req.auth as AuthPayload).plan || "FREE",
      email: req.auth.email,
    });

    return sendResponse({
      res,
      message: "Workspace switched successfully",
      data: { accessToken },
    });
  } catch (error) {
    next(error);
  }
};
