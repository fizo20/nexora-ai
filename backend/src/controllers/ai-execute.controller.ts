// src/controllers/ai-execute.controller.ts
import { Request, Response } from "express";
import { executeAIPlan } from "../services/ai-plan-executor.service";

export const executeAIPlanController = async (req: Request, res: Response) => {
  try {
    const rawId = req.params.planId;

    if (!rawId || Array.isArray(rawId)) {
      return res.status(400).json({ message: "Invalid planId" });
    }

    const results = await executeAIPlan(rawId);

    return res.json({
      executed: true,
      results,
    });
  } catch (err: any) {
    return res.status(400).json({
      error: err.message,
    });
  }
};
