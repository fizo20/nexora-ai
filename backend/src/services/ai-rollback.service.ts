// src/services/ai-rollback.service.ts
import { Task } from "../models/task.model";
import { AIAudit } from "../models/ai-audit.model";
import { logRollback } from "./ai-rollback-log.service";
import { AIExecutionLog } from "../models/ai-execution-log.model";
import { AIAction } from "../types/ai-system-actions.types";

export interface AIExecutorUndo {
  stepId: string;
  type: AIAction;
  data?: any;
}

/* =============================== */

export const rollbackExecutedSteps = async (
  workspaceId: string,
  projectId: string,
  planId: string,
  steps: AIExecutorUndo[],
) => {
  let rolledBack = 0;

  for (let i = steps.length - 1; i >= 0; i--) {
    try {
      await rollbackUndoStep(workspaceId, projectId, planId, steps[i]);
      rolledBack++;
    } catch {
      // continue best-effort
    }
  }

  return { rolledBack };
};

/* =============================== */

export const rollbackUndoStep = async (
  workspaceId: string,
  projectId: string,
  planId: string,
  undo: AIExecutorUndo,
) => {
  try {
    switch (undo.type) {
      case "create_task":
        if (undo.data?.taskId) {
          await Task.findOneAndDelete({
            _id: undo.data.taskId,
            workspaceId,
            projectId,
          });
        }
        break;

      case "update_task_status":
        if (undo.data?.taskId && undo.data?.beforeStatus) {
          await Task.updateOne(
            { _id: undo.data.taskId, workspaceId, projectId },
            { status: undo.data.beforeStatus },
          );
        }
        break;

      case "set_task_priority":
        if (undo.data?.taskId && undo.data?.beforePriority) {
          await Task.updateOne(
            { _id: undo.data.taskId, workspaceId, projectId },
            { priority: undo.data.beforePriority },
          );
        }
        break;

      default:
        throw new Error(`Unknown undo type: ${undo.type}`);
    }

    /* ---------- rollback log ---------- */

    await logRollback({
      workspaceId,
      projectId,
      planId,
      stepId: undo.stepId,
      undoType: undo.type,
      success: true,
    });

    await AIExecutionLog.updateMany(
      { planId, stepId: undo.stepId },
      { rolledBack: true },
    );
  } catch (err: any) {
    await logRollback({
      workspaceId,
      projectId,
      planId,
      stepId: undo.stepId,
      undoType: undo.type,
      success: false,
      error: err.message,
    });

    throw err;
  }
};

/* =============================== */

export const rollbackAIAction = async (
  workspaceId: string,
  auditId: string,
) => {
  const audit = await AIAudit.findById(auditId);

  if (!audit) throw new Error("Audit record not found");

  if (audit.workspaceId.toString() !== workspaceId) {
    throw new Error("Workspace mismatch");
  }

  return {
    rolledBack: false,
    message: "Manual rollback unavailable — audit output not stored",
  };
};
