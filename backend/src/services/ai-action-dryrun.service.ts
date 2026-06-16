// src/services/ai-action-dryrun.service.ts
import { Task } from "../models/task.model";
import { AIActionPayload } from "../types/ai-system-actions.types";

/**
 * Simulates AI action without mutating database
 * Returns impact preview only
 */
export async function dryRunAIAction(
  workspaceId: string,
  projectId: string,
  action: AIActionPayload,
) {
  switch (action.action) {
    /* =========================
       CREATE TASK — SIMULATION
    ========================= */

    case "create_task":
      return {
        action: action.action,
        wouldCreate: 1,
        projectId,
        workspaceId,
        preview: {
          title: action.title,
          description: action.description ?? null,
          priority: action.priority,
          status: "TODO",
        },
      };

    /* =========================
       UPDATE STATUS — SIMULATION
    ========================= */

    case "update_task_status": {
      const task = await Task.findOne({
        _id: action.taskId,
        workspaceId,
        projectId,
        deletedAt: null,
      });

      if (!task) {
        return {
          action: action.action,
          wouldUpdate: 0,
          reason: "Task not found",
        };
      }

      return {
        action: action.action,
        wouldUpdate: 1,
        taskId: task._id,
        change: {
          status: action.status,
        },
        before: {
          status: task.status,
        },
      };
    }

    /* =========================
       SET PRIORITY — SIMULATION
    ========================= */

    case "set_task_priority": {
      const task = await Task.findOne({
        _id: action.taskId,
        workspaceId,
        projectId,
        deletedAt: null,
      });

      if (!task) {
        return {
          action: action.action,
          wouldUpdate: 0,
          reason: "Task not found",
        };
      }

      return {
        action: action.action,
        wouldUpdate: 1,
        taskId: task._id,
        change: {
          priority: action.priority,
        },
        before: {
          priority: task.priority,
        },
      };
    }

    /* ========================= */

    default: {
      const _exhaustive: never = action;

      return {
        supported: false,
        message: "Dry run not implemented",
      };
    }
  }
}
