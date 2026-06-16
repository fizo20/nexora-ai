// src/services/ai-context.service.ts
import { Types } from "mongoose";
import { AIContext } from "../models/ai-context.model";
import { AIFeatureType } from "../types/ai-feature.types";
import { Project } from "../models/project.model";
import { Task } from "../models/task.model";
import { AIExecutionMemory } from "../models/ai-execution-memory.model"; // ✅ NEW

export const storeAIContext = async (params: {
  workspaceId: string;
  projectId?: string;
  type: AIFeatureType;
  input: string;
  output: string;
}) => {
  await AIContext.create({
    workspaceId: new Types.ObjectId(params.workspaceId),
    projectId: params.projectId
      ? new Types.ObjectId(params.projectId)
      : undefined,
    type: params.type,
    input: params.input,
    output: params.output,
  });
};

export const getRecentContext = async (
  workspaceId: string,
  projectId?: string,
  limit = 5,
) => {
  return AIContext.find({
    workspaceId,
    ...(projectId && { projectId }),
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

export const buildContextBlock = (contexts: any[]) => {
  if (!contexts.length) return "";

  return `
Previous AI insights:
${contexts.map((c) => `- ${c.type}: ${c.output.substring(0, 200)}`).join("\n")}
`;
};

/**
 * 🧠 ENHANCED WORKSPACE STATE (REAL AI MEMORY)
 *
 * PERFORMANCE NOTE:
 * This now uses countDocuments / lean projections instead of
 * loading every Project and Task document into memory. It is
 * also intended to be called ONCE per request and the result
 * passed down — see ai-agent.service.ts and ai-planner.service.ts.
 */
export const buildWorkspaceState = async (
  workspaceId: string,
  projectId?: string,
) => {
  const baseFilter = { workspaceId, deletedAt: null };

  const [
    projectsCount,
    tasksCount,
    blockedTasks,
    overdueTasks,
    recentTasksRaw,
    recentFailures,
  ] = await Promise.all([
    Project.countDocuments(baseFilter),

    Task.countDocuments(baseFilter),

    Task.countDocuments({ ...baseFilter, status: "BLOCKED" }),

    Task.countDocuments({
      ...baseFilter,
      dueDate: { $lt: new Date() },
    }),

    // Only fetch the fields we actually expose, only the last 10
    Task.find(baseFilter, { title: 1, status: 1, priority: 1 })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),

    AIExecutionMemory.find({ workspaceId, outcome: "failed" })
      .sort({ timestamp: -1 })
      .limit(5)
      .lean(),
  ]);

  const recentTasks = recentTasksRaw.map((t) => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
  }));

  const failurePatterns = recentFailures.map((f) => f.actionType);

  return {
    projectsCount,
    tasksCount,
    blockedTasks,
    overdueTasks,

    // 🧠 MEMORY
    recentTasks,
    failurePatterns,
  };
};

export type WorkspaceState = Awaited<ReturnType<typeof buildWorkspaceState>>;
