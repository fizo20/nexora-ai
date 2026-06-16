// src/middlewares/ai-usage.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Workspace } from "../models/workspace.model";
import { AI_LIMITS } from "../config/ai-limits.config";
import { countWorkspaceAICalls } from "../services/ai-usage.service";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";
import { isTrialExpired } from "../services/trial.service";

/**
 * AI Usage Enforcement Middleware
 *
 * Enforces:
 * - 50-day rolling call quota
 * - Per-request input size limit
 *
 * Must run AFTER:
 * - Auth
 * - Governance
 */
export const enforceAIUsageLimit = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.auth as AuthPayload;

    if (!auth?.workspaceId) {
      return next(new AppError("Workspace context missing", 403));
    }

    const workspace = await Workspace.findById(auth.workspaceId);

    if (!workspace) {
      return next(new AppError("Workspace not found", 404));
    }

    const limits = AI_LIMITS[workspace.plan];

    if (!limits) {
      return next(new AppError("Plan limits not configured", 500));
    }

    // 🧠 TRIAL EXPIRATION CHECK
    if (workspace.plan === "FREE") {
      const trialStart = workspace.trialStartedAt ?? workspace.createdAt;

      const expired = isTrialExpired(trialStart);

      if (expired) {
        return next(
          new AppError("Your free trial has expired.", 403, "TRIAL_EXPIRED", {
            currentPlan: "FREE",
            upgradeTo: "PRO",
          }),
        );
      }
    }

    /**
     * 1️⃣ Enforce rolling 50-day call quota
     */
    const totalCalls = await countWorkspaceAICalls(workspace.id, 50);

    if (totalCalls >= limits.aiCalls) {
      return next(
        new AppError(
          `AI call quota exceeded for ${workspace.plan} plan.`,
          403,
          "AI_LIMIT_EXCEEDED",
          {
            currentPlan: workspace.plan,
            upgradeTo: workspace.plan === "FREE" ? "PRO" : "ENTERPRISE",
          },
        ),
      );
    }

    /**
     * 2️⃣ Enforce input size limit
     */
    const prompt =
      req.body?.prompt ||
      req.body?.goal ||
      (Array.isArray(req.body?.messages)
        ? req.body.messages.map((m: any) => m.content).join(" ")
        : "") ||
      "";

    if (prompt.length > limits.maxInputSize) {
      return next(
        new AppError(
          `Input too large for ${workspace.plan} plan`,
          400,
          "AI_INPUT_TOO_LARGE",
          {
            currentPlan: workspace.plan,
            upgradeTo: workspace.plan === "FREE" ? "PRO" : "ENTERPRISE",
          },
        ),
      );
    }

    next();
  } catch (error) {
    next(error);
  }
};
