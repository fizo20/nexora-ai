// src/controllers/workspace-metrics.controller.ts
import { Request, Response, NextFunction } from "express";
import { getWorkspaceMetrics } from "../services/workspace-metrics.service";
import { AuthPayload } from "../types/auth.types";
import { AppError } from "../errors/app-error";

/**
 * Workspace Metrics Endpoint
 * Read-only analytics snapshot
 */
export const getWorkspaceMetricsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth || !("workspaceId" in req.auth)) {
      throw new AppError("Workspace context required", 403);
    }

    const auth = req.auth as AuthPayload;

    const metrics = await getWorkspaceMetrics(auth.workspaceId);

    res.json({
      success: true,
      data: metrics,
    });
  } catch (err) {
    next(err);
  }
};
