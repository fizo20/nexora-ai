// src/middlewares/feature-gate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Workspace } from "../models/workspace.model";
import { planFeatures, PlanFeatures } from "../config/plan-features";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

/**
 * Feature Gate Middleware Factory
 */
export const requireFeature = (featureKey: keyof PlanFeatures) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const auth = req.auth as AuthPayload;

      if (!auth?.workspaceId) {
        return next(new AppError("Workspace context required", 403));
      }

      const workspace = await Workspace.findById(auth.workspaceId);

      if (!workspace) {
        return next(new AppError("Workspace not found", 404));
      }

      const features = planFeatures[workspace.plan];

      if (!features) {
        return next(new AppError("Plan configuration missing", 500));
      }

      const enabled = features[featureKey];

      if (!enabled) {
        return next(
          new AppError(
            `Feature "${featureKey}" not available on ${workspace.plan} plan`,
            402,
          ),
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
