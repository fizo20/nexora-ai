// src/services/ai-execution-log.service.ts
import { AIExecutionLog } from "../models/ai-execution-log.model";

export const logExecutionStep = async (data: {
  workspaceId: string;
  projectId: string;
  planId?: string;

  stepId: string;
  action: string;

  status: "SUCCESS" | "FAILED" | "BLOCKED";

  input: any;
  output?: any;
  error?: string;
}) => {
  await AIExecutionLog.create({
    ...data,
    rolledBack: false,
  });
};
