// src/services/ai-executor.service.ts
import { evaluateAIPolicy } from "./ai-policy.service";
import { AIActionPayload } from "../types/ai-system-actions.types";
import { Task } from "../models/task.model";

export interface AIExecutorUndo {
  type: string;
  data: any;
}

export interface AIExecutorResult {
  ok: boolean;
  blocked?: boolean;
  reason?: string;
  data?: any;
  undo?: AIExecutorUndo;
}

export async function executeAIActionStep(
  workspaceId: string,
  projectId: string,
  action: AIActionPayload,
  options?: { dryRun?: boolean },
): Promise<AIExecutorResult> {
  const dryRun = options?.dryRun === true;

  /* ---------- POLICY ---------- */

  const policy = await evaluateAIPolicy(workspaceId, action);

  if (!policy.allowed) {
    return {
      ok: false,
      blocked: true,
      reason: policy.reason,
    };
  }

  /* ---------- ACTION SWITCH ---------- */

  switch (action.action) {
    /* =========================
       CREATE TASK
    ========================= */

    case "create_task": {
      const a = action as any;

      if (dryRun) {
        return {
          ok: true,
          data: {
            dryRun: true,
            simulated: "task would be created",
            title: a.title,
          },
        };
      }

      const task = await Task.create({
        workspaceId,
        projectId,
        title: a.title,
        description: a.description,
        priority: a.priority || "medium",
      });

      return {
        ok: true,
        data: {
          taskId: task._id,
          title: task.title,
        },
      };
    }

    /* =========================
       UPDATE STATUS
    ========================= */

    case "update_task_status": {
      const a = action as any;

      if (dryRun) {
        return {
          ok: true,
          data: {
            dryRun: true,
            simulated: "status would change",
            taskId: a.taskId,
            status: a.status,
          },
        };
      }

      const before = await Task.findOne({
        _id: a.taskId,
        workspaceId,
        projectId,
      });

      if (!before) {
        return { ok: false, reason: "Task not found" };
      }

      await Task.updateOne({ _id: a.taskId }, { status: a.status });

      return {
        ok: true,
        data: {
          taskId: a.taskId,
          beforeStatus: before.status,
        },
      };
    }

    /* =========================
       SET PRIORITY
    ========================= */

    case "set_task_priority": {
      const a = action as any;

      if (dryRun) {
        return {
          ok: true,
          data: {
            dryRun: true,
            simulated: "priority would change",
            taskId: a.taskId,
            priority: a.priority,
          },
        };
      }

      const before = await Task.findOne({
        _id: a.taskId,
        workspaceId,
        projectId,
      });

      if (!before) {
        return { ok: false, reason: "Task not found" };
      }

      await Task.updateOne({ _id: a.taskId }, { priority: a.priority });

      return {
        ok: true,
        data: {
          taskId: a.taskId,
          beforePriority: before.priority,
        },
      };
    }

    default:
      return {
        ok: false,
        blocked: true,
        reason: "Unknown AI action",
      };
  }
}
