// src/services/ai-action-executor.service.ts
import { Task } from "../models/task.model";
import { AIActionPayload } from "../types/ai-system-actions.types";
import { evaluateAIPolicy } from "./ai-policy.service";
import { AIActionExecResult } from "../types/ai-execution.types";

export const executeAIAction = async (
  workspaceId: string,
  projectId: string,
  action: AIActionPayload,
): Promise<AIActionExecResult> => {
  /* ---------- Policy Gate ---------- */

  const policy = await evaluateAIPolicy(workspaceId, action);

  if (!policy.allowed) {
    return {
      success: false,
      blocked: true,
      reason: policy.reason ?? "Blocked by AI policy",
    };
  }

  if (policy.modifiedAction) {
    action = policy.modifiedAction;
  }

  /* ---------- Execution ---------- */

  switch (action.action) {
    case "create_task": {
      const task = await Task.create({
        workspaceId,
        projectId,
        title: action.title,
        description: action.description,
        priority: action.priority || "MEDIUM",
      });

      return {
        success: true,
        result: {
          taskId: task._id.toString(),
          title: task.title,
          priority: task.priority,
          status: task.status,
          createdAt: task.createdAt,
        },
      };
    }

    case "update_task_status": {
      const task = await Task.findOneAndUpdate(
        { _id: action.taskId, workspaceId, projectId },
        { status: action.status },
        { new: true },
      );

      if (!task) {
        return { success: false, reason: "Task not found" };
      }

      return { success: true, result: task };
    }

    case "set_task_priority": {
      const task = await Task.findOneAndUpdate(
        { _id: action.taskId, workspaceId, projectId },
        { priority: action.priority },
        { new: true },
      );

      if (!task) {
        return { success: false, reason: "Task not found" };
      }

      return { success: true, result: task };
    }

    default:
      return {
        success: false,
        reason: "Unknown action type",
      };
  }
};
