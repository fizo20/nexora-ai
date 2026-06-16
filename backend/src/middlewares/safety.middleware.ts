// src/middlewares/safety.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Workspace } from "../models/workspace.model";
import { planLimits } from "../config/plan-limits";
import { checkAndIncrementUsage } from "../services/rate-limit.service";
import { AuthPayload } from "../types/auth.types";
import { AppError } from "../errors/app-error";

type SafetyOptions = {
  key: "ai_calls" | "api_calls";
  windowMs?: number;
};

export const safetyGuard = (options: SafetyOptions) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.auth || !("workspaceId" in req.auth)) {
        throw new AppError("Workspace context required", 403);
      }

      const auth = req.auth as AuthPayload;

      const workspace = await Workspace.findById(auth.workspaceId);

      if (!workspace) {
        throw new AppError("Workspace not found", 404);
      }

      const limits = planLimits[workspace.plan];

      const limit =
        options.key === "ai_calls"
          ? limits.aiCallsPerHour
          : limits.apiCallsPerHour;

      await checkAndIncrementUsage(
        auth.workspaceId,
        options.key,
        limit,
        options.windowMs ?? 60 * 60 * 1000,
      );

      next();
    } catch (err: any) {
      if (err.message === "Rate limit exceeded") {
        const auth = req.auth as AuthPayload;

        const workspace = await Workspace.findById(auth.workspaceId);

        return next(
          new AppError("Too many requests for your plan", 429, "RATE_LIMIT", {
            currentPlan: workspace?.plan,
            upgradeTo: workspace?.plan === "FREE" ? "PRO" : "ENTERPRISE",
          }),
        );
      }

      next(err);
    }
  };
};
