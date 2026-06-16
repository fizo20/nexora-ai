// backend/src/controllers/ai-analytics.controller.ts
import { Request, Response } from "express";
import { AuthPayload } from "../types/auth.types";
import { getAIAnalytics } from "../services/ai-analytics.service";

export async function getAIAnalyticsController(req: Request, res: Response) {
  try {
    const auth = req.auth as AuthPayload;

    if (!auth?.workspaceId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const analytics = await getAIAnalytics(auth.workspaceId);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      error: "Failed to load AI analytics",
    });
  }
}
