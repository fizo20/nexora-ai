// src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

export const authenticateUser = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (!("userId" in payload)) {
      throw new AppError("Invalid identity token", 401);
    }

    req.auth = {
      userId: payload.userId,
      email: (payload as any).email,
    } as AuthPayload;

    next();
  } catch (err) {
    next(err);
  }
};

export const authenticateWorkspace = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token);

    if (
      !("workspaceId" in payload) ||
      !("plan" in payload) ||
      !("role" in payload)
    ) {
      throw new AppError("Workspace token required", 403);
    }

    req.auth = payload as AuthPayload;

    next();
  } catch (err) {
    next(err);
  }
};

export const requireAuth = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];
    const payload = verifyAccessToken(token) as any;

    if (!payload.userId) {
      throw new AppError("Invalid token", 401);
    }

    // Require a real workspace token — no hardcoded fallback
    if (!payload.workspaceId) {
      throw new AppError(
        "Workspace token required. Please switch workspace.",
        403,
      );
    }

    req.auth = {
      userId: payload.userId,
      email: payload.email,
      workspaceId: payload.workspaceId,
      plan: payload.plan || "FREE",
      role: payload.role || "OWNER",
    } as AuthPayload;

    next();
  } catch (err) {
    next(err);
  }
};
