// src/controllers/ai-governance.controller.ts
import { Request, Response, NextFunction } from "express";
import { Workspace } from "../models/workspace.model";
import { AIAudit } from "../models/ai-audit.model";
import { AppError } from "../errors/app-error";
import { WorkspaceRequest } from "../types/express.types";

import { logAIAudit } from "../services/ai-audit.service";

export const disableWorkspaceAI = async (
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction,
) => {
  const workspaceId = req.auth.workspaceId;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    return next(new AppError("Workspace not found", 404));
  }

  if (!workspace.aiEnabled) {
    return res.json({ success: true, message: "AI already disabled" });
  }

  workspace.aiEnabled = false;
  workspace.aiSuspendedAt = new Date();

  await workspace.save();

  /**
   * Governance audit logging
   */
  await logAIAudit({
    workspaceId: req.auth.workspaceId,
    userId: req.auth.userId,
    action: "AI_DISABLED",
    endpoint: req.originalUrl,
  });

  res.json({ success: true });
};

export const enableWorkspaceAI = async (
  req: WorkspaceRequest,
  res: Response,
  next: NextFunction,
) => {
  const workspaceId = req.auth.workspaceId;

  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    return next(new AppError("Workspace not found", 404));
  }

  if (workspace.aiEnabled) {
    return res.json({ success: true, message: "AI already enabled" });
  }

  workspace.aiEnabled = true;
  workspace.aiSuspendedAt = null;

  await workspace.save();

  await logAIAudit({
    workspaceId: req.auth.workspaceId,
    userId: req.auth.userId,
    action: "AI_ENABLED",
    endpoint: req.originalUrl,
  });

  res.json({ success: true });
};
