// backend/src/controllers/analytics.controller.ts

import { Request, Response, NextFunction } from "express";
import { AuthPayload } from "../types/auth.types";
import { AppError } from "../errors/app-error";
import { getWorkspaceAnalytics } from "../services/analytics.service";
import { getAIAnalytics } from "../services/ai-analytics.service";

type RangeType = "7d" | "30d" | "90d";

function parseRange(value: unknown): RangeType {
  if (value === "30d") return "30d";
  if (value === "90d") return "90d";
  return "7d";
}

export const getAnalyticsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.auth as AuthPayload;

    if (!auth?.workspaceId) {
      throw new AppError("Unauthorized", 401);
    }

    const range = parseRange(req.query.range);

    const [workspaceAnalytics, aiAnalytics] = await Promise.all([
      getWorkspaceAnalytics(auth.workspaceId, range),
      getAIAnalytics(auth.workspaceId),
    ]);

    return res.json({
      workspace: workspaceAnalytics,
      ai: aiAnalytics,
    });
  } catch (error) {
    next(error);
  }
};
