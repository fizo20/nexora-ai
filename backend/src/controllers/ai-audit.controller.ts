// src/controllers/ai-audit.controller.ts
import { Request, Response } from "express";
import { AIAudit } from "../models/ai-audit.model";
import { AuthPayload } from "../types/auth.types";

export const listAIAuditLogs = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;

  const logs = await AIAudit.find({
    workspaceId: auth.workspaceId,
  })
    .sort({ createdAt: -1 })
    .limit(100);

  res.json(logs);
};
