// src/controllers/billing.controller.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { AuthPayload } from "../types/auth.types";
import { getWorkspaceUsageStats } from "../services/ai-usage-stats.service";

export const getUsageStatsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.auth || !("workspaceId" in req.auth)) {
      throw new AppError("Unauthorized", 401);
    }

    const auth = req.auth as AuthPayload;

    const stats = await getWorkspaceUsageStats(auth.workspaceId);

    res.json(stats);
  } catch (err) {
    next(err);
  }
};
