// src/services/ai-execution-query.service.ts
import { AIExecution } from "../models/ai-execution.model";
import { AppError } from "../errors/app-error";

export const getWorkspaceExecutionHistory = async (
  workspaceId: string,
  limit = 20,
  page = 1,
) => {
  const skip = (page - 1) * limit;

  const executions = await AIExecution.find({ workspaceId })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  const total = await AIExecution.countDocuments({ workspaceId });

  return {
    data: executions,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getSingleExecution = async (
  workspaceId: string,
  executionId: string,
) => {
  const execution = await AIExecution.findOne({
    workspaceId,
    executionId,
  }).lean();

  if (!execution) {
    throw new AppError("Execution not found", 404);
  }

  return execution;
};
