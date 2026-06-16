// src/middlewares/ai-governance.middleware.ts
import { Request, Response, NextFunction } from "express";
import { WorkspaceRequest } from "../types/express.types";
import { Workspace } from "../models/workspace.model";
import { SystemConfig } from "../models/system-config.model";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";

export const enforceAIGovernance = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const auth = req.auth as AuthPayload | undefined;

  if (!auth?.workspaceId) {
    return next(new AppError("Workspace required", 403));
  }

  const workspaceId = auth.workspaceId;

  /* ---------- GLOBAL SYSTEM CHECK ---------- */

  const config = await SystemConfig.findOne().lean();

  if (config && config.aiGlobalEnabled === false) {
    return next(new AppError("AI temporarily disabled system-wide", 503));
  }

  /* ---------- WORKSPACE CHECK ---------- */

  const workspace = await Workspace.findById(workspaceId).lean();

  if (!workspace) {
    return next(new AppError("Workspace not found", 404));
  }

  if (!workspace.aiEnabled) {
    return next(new AppError("AI disabled for this workspace", 403));
  }

  next();
};
