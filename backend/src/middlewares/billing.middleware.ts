// src/middlewares/billing.middleware.ts
import { Request, Response, NextFunction } from "express";
import { Workspace } from "../models/workspace.model";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

/**
 * Billing Enforcement Middleware
 *
 * Ensures workspace is allowed to use billable / premium features.
 *
 * Enforces:
 * - workspace-scoped JWT required
 * - workspace must exist
 * - workspace not suspended
 * - billing status valid OR free plan
 * - trial not expired
 *
 * Safe to attach to premium routes only.
 */

export const requireActiveBilling = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    /* ---------- AUTH REQUIRED ---------- */
    if (!req.auth) {
      throw new AppError("Unauthorized", 401);
    }

    /* ---------- WORKSPACE TOKEN REQUIRED ---------- */
    if (!("workspaceId" in req.auth)) {
      throw new AppError("Workspace context required", 403);
    }

    const auth = req.auth as AuthPayload;

    /* ---------- LOAD WORKSPACE ---------- */
    const workspace = await Workspace.findById(auth.workspaceId);

    if (!workspace) {
      throw new AppError("Workspace not found", 404);
    }

    /**
     * Attach workspace to request to avoid duplicate DB queries
     * downstream in controllers.
     */
    (req as any).workspace = workspace;

    /* ---------- OPERATIONAL STATUS CHECK ---------- */
    if (workspace.status === "SUSPENDED") {
      throw new AppError("Workspace is suspended", 403);
    }

    /* ---------- FREE PLAN ALLOWED ---------- */
    if (workspace.plan === "FREE") {
      return next();
    }

    /* ---------- ACTIVE BILLING ---------- */
    if (workspace.billingStatus === "ACTIVE") {
      return next();
    }

    /* ---------- VALID TRIAL ---------- */
    if (
      workspace.billingStatus === "TRIALING" &&
      workspace.trialEndsAt &&
      workspace.trialEndsAt > new Date()
    ) {
      return next();
    }

    /* ---------- BILLING BLOCK ---------- */
    throw new AppError(
      "Billing inactive — upgrade or renew your subscription",
      402,
    );
  } catch (err) {
    next(err);
  }
};
