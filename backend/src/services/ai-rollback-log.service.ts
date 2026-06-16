// src/services/ai-rollback-log.service.ts
import { AIRollbackLog } from "../models/ai-rollback-log.model";

export const logRollback = async (data: {
  workspaceId: string;
  projectId: string;
  planId?: string;

  stepId: string;
  undoType: string;

  success: boolean;
  error?: string;
}) => {
  await AIRollbackLog.create(data);
};
