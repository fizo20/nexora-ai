// src/services/ai-monitoring.service.ts
import { AIExecutionLog } from "../models/ai-execution-log.model";
import { AIRollbackLog } from "../models/ai-rollback-log.model";

/* =====================================
   EXECUTION LOGS
===================================== */

export const getExecutionLogs = async (
  workspaceId: string,
  filters: {
    projectId?: string;
    planId?: string;
    status?: string;
    limit?: number;
  },
) => {
  const query: any = { workspaceId };

  if (filters.projectId) query.projectId = filters.projectId;
  if (filters.planId) query.planId = filters.planId;
  if (filters.status) query.status = filters.status;

  return AIExecutionLog.find(query)
    .sort({ createdAt: -1 })
    .limit(filters.limit ?? 50);
};

/* =====================================
   ROLLBACK LOGS
===================================== */

export const getRollbackLogs = async (workspaceId: string, planId?: string) => {
  const query: any = { workspaceId };
  if (planId) query.planId = planId;

  return AIRollbackLog.find(query).sort({ createdAt: -1 });
};

/* =====================================
   FAILURE EXPLORER
===================================== */

export const getFailedSteps = async (workspaceId: string) => {
  return AIExecutionLog.find({
    workspaceId,
    status: { $in: ["FAILED", "BLOCKED"] },
  })
    .sort({ createdAt: -1 })
    .limit(100);
};

export const getPlanTimeline = async (workspaceId: string, planId: string) => {
  return AIExecutionLog.find({
    workspaceId,
    planId,
  }).sort({ createdAt: 1 });
};
