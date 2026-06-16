// src/middlewares/ai-cost-preview.middleware.ts
// This middleware estimates the cost of an AI operation based on the incoming request and checks it against the workspace's monthly AI budget before allowing the operation to proceed.
import { Request, Response, NextFunction } from "express";
import { WorkspaceRequest } from "../types/express.types";
import { Workspace } from "../models/workspace.model";
import { getWorkspaceMonthlyAICost } from "../services/ai-cost.service";
import { estimateAICost } from "../services/ai-cost-estimator.service";
import { AI_MONTHLY_BUDGET } from "../config/ai-budget.config";
import { AppError } from "../errors/app-error";

export const enforceAICostPreview = async (
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

  const currentSpend = await getWorkspaceMonthlyAICost(workspace.id);

  const prompt = req.body?.prompt ?? "";
  const model = req.body?.model;

  const estimatedCost = estimateAICost({ prompt, model });

  if (currentSpend + estimatedCost > budget) {
    return next(
      new AppError("AI monthly budget exceeded", 403, "UPGRADE_REQUIRED", {
        currentPlan: workspace.plan,
        upgradeTo: workspace.plan === "FREE" ? "PRO" : "ENTERPRISE",
      }),
    );
  }

  next();
};
