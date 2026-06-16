// src/services/ai-policy.service.ts
import { Types } from "mongoose";
import { AIPolicy, IAIPolicy } from "../models/ai-policy.model";
import { AIActionPayload } from "../types/ai-system-actions.types";
import { AIPolicyResult } from "../types/ai-policy.types";

export async function evaluateAIPolicy(
  workspaceId: string,
  action: AIActionPayload,
): Promise<AIPolicyResult> {
  const policy = await AIPolicy.findOne({ workspaceId });

  /* fallback defaults if not configured yet */
  const rules = policy ?? {
    allowTaskCreate: true,
    allowTaskStatusUpdate: true,
    allowPriorityChange: true,
    allowHighPriorityCreate: false,
    maxActionsPerRequest: 3,
  };

  /* =========================
     CREATE TASK POLICY
  ========================= */

  if (action.action === "create_task") {
    if (!rules.allowTaskCreate) {
      return {
        allowed: false,
        reason: "AI task creation disabled by workspace policy",
      };
    }

    if (action.priority === "HIGH" && !rules.allowHighPriorityCreate) {
      return {
        allowed: false,
        reason: "High priority tasks must be created manually",
      };
    }
  }

  /* =========================
     STATUS UPDATE POLICY
  ========================= */

  if (action.action === "update_task_status") {
    if (!rules.allowTaskStatusUpdate) {
      return {
        allowed: false,
        reason: "AI status updates disabled",
      };
    }
  }

  /* =========================
     PRIORITY CHANGE POLICY
  ========================= */

  if (action.action === "set_task_priority") {
    if (!rules.allowPriorityChange) {
      return {
        allowed: false,
        reason: "AI priority changes disabled",
      };
    }
  }

  /* =========================
     PASSED ALL RULES
  ========================= */

  return { allowed: true };
}

/**
 * Get workspace AI policy
 * Auto-create default if missing
 */
export const getWorkspacePolicy = async (
  workspaceId: string | Types.ObjectId,
): Promise<IAIPolicy> => {
  const wid =
    typeof workspaceId === "string"
      ? new Types.ObjectId(workspaceId)
      : workspaceId;

  let policy = await AIPolicy.findOne({ workspaceId: wid });

  if (!policy) {
    policy = await AIPolicy.create({ workspaceId: wid });
  }

  return policy;
};
