// src/middlewares/billing-enforcement.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Workspace } from "../models/workspace.model";
import { planFeatures } from "../config/plan-features";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

/**
 * Enforces workspace billing rules (plan-based limits)
 * This middleware assumes workspace-scoped authentication
 */
export const enforceWorkspacePlan = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth) {
      throw new AppError("Unauthorized", 401);
    }

    const auth = req.auth as AuthPayload;

    if (!auth.workspaceId) {
      throw new AppError("Workspace context missing", 400);
    }

    const workspace = await Workspace.findById(auth.workspaceId);

    if (!workspace) {
      throw new AppError("Workspace not found", 404);
    }

    if (workspace.status !== "ACTIVE") {
      throw new AppError("Workspace is not active", 403);
    }

    const features = planFeatures[workspace.plan];

    // Attach billing context to request for downstream use
    req.workspace = {
      id: workspace._id,
      plan: workspace.plan,
      features,
    };

    next();
  } catch (err) {
    next(err);
  }
};
