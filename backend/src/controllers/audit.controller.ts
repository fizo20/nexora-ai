// src/controllers/audit.controller.ts
import { Request, Response } from "express";
import { AuditLog } from "../models/audit.model";
import { AuthPayload } from "../types/auth.types";

export const listWorkspaceAuditLogs = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;

  const logs = await AuditLog.find({
    workspaceId: auth.workspaceId,
  })
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(logs);
};
