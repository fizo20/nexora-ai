// src/middlewares/workspace-context.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

export const requireWorkspaceContext = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  if (!req.auth) {
    return next(new AppError("Unauthorized", 401));
  }

  const auth = req.auth as Partial<AuthPayload>;

  if (!auth.workspaceId || !auth.role) {
    return next(new AppError("Workspace context required", 403));
  }

  next();
};
