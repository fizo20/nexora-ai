// src/controllers/ai-approval.controller.ts
import { Request, Response } from "express";
import { Types } from "mongoose";
import { AIPlan } from "../models/ai-plan.model";
import { AuthPayload } from "../types/auth.types";

export const approveAIPlanController = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const { planId } = req.params as { planId: string };

  const plan = await AIPlan.findById(planId);

  if (!plan) {
    return res.status(404).json({ message: "Plan not found" });
  }

  if (!plan.approvalRequired) {
    return res.status(400).json({ message: "Approval not required" });
  }

  plan.status = "APPROVED";

  // ✅ FIX HERE
  plan.approvedBy = new Types.ObjectId(auth.userId);

  await plan.save();

  return res.json({
    approved: true,
    planId,
  });
};
