// src/middlewares/ai-cost-guard.middleware.ts
// This middleware checks if the workspace has exceeded its AI usage limits based on the current plan before allowing access to AI-related endpoints.
import { Request, Response, NextFunction } from "express";
import { AI_LIMITS } from "../config/ai-limits.config";
import { countWorkspaceAICalls } from "../services/ai-usage.service";
import { getWorkspacePlan } from "../services/workspace-plan.service";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

export const aiCostGuard = () => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new AppError("Unauthorized", 401));
    }

    const auth = req.auth as AuthPayload;

    if (!auth.workspaceId) {
      return next(new AppError("Workspace required", 403));
    }

    const plan = await getWorkspacePlan(auth.workspaceId);
    const limits = AI_LIMITS[plan];

    const used = await countWorkspaceAICalls(auth.workspaceId);

    if (used >= limits.aiCalls) {
      return next(
        new AppError("AI usage limit reached for your workspace plan", 429),
      );
    }

    next();
  };
};
