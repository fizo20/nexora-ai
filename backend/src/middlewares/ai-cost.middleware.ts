// src/middlewares/ai-cost.middleware.ts
// This middleware checks if the workspace has exceeded its monthly AI budget before allowing access to AI-related endpoints. It retrieves the workspace's current AI spend and compares it against the budget defined for their plan.
import { Request, Response, NextFunction } from "express";
import { WorkspaceRequest } from "../types/express.types";
import { Workspace } from "../models/workspace.model";
import { AI_MONTHLY_BUDGET } from "../config/ai-budget.config";
import { getWorkspaceMonthlyAICost } from "../services/ai-cost.service";
import { AppError } from "../errors/app-error";

export const enforceAICostBudget = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  const workspaceReq = req as WorkspaceRequest;

  if (!workspaceReq.auth?.workspaceId) {
    return next(new AppError("Workspace authentication required", 401));
  }

  const workspace = await Workspace.findById(workspaceReq.auth.workspaceId);

  if (!workspace) {
    return next(new AppError("Workspace not found", 404));
  }

  const budget = AI_MONTHLY_BUDGET[workspace.plan];

  if (!budget || budget === 0) {
    return next(new AppError("AI not included in plan", 403));
  }

  const totalCost = await getWorkspaceMonthlyAICost(workspace.id);

  if (totalCost >= budget) {
    return next(new AppError(`Monthly AI budget exceeded ($${budget})`, 403));
  }

  next();
};
