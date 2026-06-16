// src/middlewares/ai-size-guard.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AI_LIMITS } from "../config/ai-limits.config";
import { getWorkspacePlan } from "../services/workspace-plan.service";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

/**
 * Prompt size guard
 */
export const aiSizeGuard = (field: string) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const auth = req.auth as AuthPayload;

    const plan = await getWorkspacePlan(auth.workspaceId);
    const limits = AI_LIMITS[plan];

    const text = req.body[field];

    if (typeof text === "string" && text.length > limits.maxInputSize) {
      return next(new AppError("AI input too large for plan", 400));
    }

    next();
  };
};
