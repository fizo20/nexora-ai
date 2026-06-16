// src/controllers/ai-admin.controller.ts
import { Request, Response } from "express";
import { AuthPayload } from "../types/auth.types";
import {
  getExecutionLogs,
  getFailedSteps,
  getPlanTimeline,
  getRollbackLogs,
} from "../services/ai-monitoring.service";
import { AIExecutionLog } from "../models/ai-execution-log.model";

/* =====================================
   LIST EXECUTION LOGS
===================================== */

export const listExecutionLogsController = async (
  req: Request,
  res: Response,
) => {
  const auth = req.auth as AuthPayload;

  const logs = await getExecutionLogs(auth.workspaceId, {
    projectId: req.query.projectId as string,
    planId: req.query.planId as string,
    status: req.query.status as string,
    limit: Number(req.query.limit || 50),
  });

  res.json(logs);
};

/* =====================================
   LIST ROLLBACK HISTORY
===================================== */

export const listRollbackLogsController = async (
  req: Request,
  res: Response,
) => {
  const auth = req.auth as AuthPayload;

  const logs = await getRollbackLogs(
    auth.workspaceId,
    req.query.planId as string,
  );

  res.json(logs);
};

export const failureExplorerController = async (
  req: Request,
  res: Response,
) => {
  const auth = req.auth as AuthPayload;

  const failures = await getFailedSteps(auth.workspaceId);

  res.json(failures);
};

export const planTimelineController = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const { planId } = req.params;

  if (!planId || Array.isArray(planId)) {
    return res.status(400).json({ message: "Invalid planId" });
  }

  const timeline = await getPlanTimeline(auth.workspaceId, planId);

  res.json(timeline);
};
