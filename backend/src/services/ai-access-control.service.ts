// src/services/ai-access-control.service.ts
import mongoose from "mongoose";
import { Workspace } from "../models/workspace.model";
import { AppError } from "../errors/app-error";

/**
 * FREE PLAN LIMIT
 */
const FREE_AI_LIMIT = 50;

/**
 * Enforce AI usage rules
 */
export const enforceAIUsageAccess = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  const billingStatus = workspace.billingStatus;
  const plan = workspace.plan;

  /* =========================
     ❌ BLOCK IF PAYMENT FAILED
  ========================= */
  if (billingStatus === "PAST_DUE") {
    throw new AppError("Payment required. Please update your billing.", 402);
  }

  /* =========================
     🆓 FREE PLAN LIMIT (50)
  ========================= */
  if (plan === "FREE") {
    const usage = await mongoose.connection
      .collection("usage_events")
      .aggregate([
        {
          $match: {
            workspaceId: new mongoose.Types.ObjectId(workspaceId),
            metric: "ai_chat",
            /*   metric: { $in: ["ai_chat", "ai_tasks", "ai_summary", "ai_plans"] }, */
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$quantity" },
          },
        },
      ])
      .toArray();

    const totalUsed = usage[0]?.total || 0;

    if (totalUsed >= FREE_AI_LIMIT) {
      throw new AppError(
        `You’ve used ${totalUsed}/${FREE_AI_LIMIT} free AI requests. Upgrade to continue.`,
        403,
      );
    }
  }
};
