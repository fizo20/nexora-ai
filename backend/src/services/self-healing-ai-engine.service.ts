// src/services/self-healing-ai-engine.service.ts
import { AIActionPayload } from "../types/ai-system-actions.types";

interface SelfHealingContext {
  workspaceId: string;
  projectId: string;
  executionId: string;
}

interface StepFailureInfo {
  stepIndex: number;
  step: AIActionPayload;
  error: string;
  retryCount: number;
}

export type SelfHealingDecision = "retry" | "skip" | "repair" | "abort";

export interface SelfHealingResult {
  decision: SelfHealingDecision;
  repairedStep?: AIActionPayload;
  reason: string;
}

export const selfHealFailedStep = async (
  context: SelfHealingContext,
  failure: StepFailureInfo,
): Promise<SelfHealingResult> => {
  const { step, retryCount, error } = failure;

  const MAX_RETRY = 2;

  /* =========================
     1️⃣ RETRY STRATEGY
  ========================= */

  if (retryCount < MAX_RETRY) {
    return {
      decision: "retry",
      reason: "Retrying failed step",
    };
  }

  /* =========================
     2️⃣ INPUT REPAIR
  ========================= */

  if (step.action === "create_task") {
    const repairedStep = { ...step };

    if (!repairedStep.title || repairedStep.title.trim() === "") {
      repairedStep.title = "Auto repaired task title";
    }

    return {
      decision: "repair",
      repairedStep,
      reason: "Task title auto repaired",
    };
  }

  /* =========================
     3️⃣ SKIP NON CRITICAL
  ========================= */

  const nonCriticalActions = [
    "update_task_status",
    "log_event",
    "send_notification",
  ];

  if (nonCriticalActions.includes(step.action)) {
    return {
      decision: "skip",
      reason: "Non critical step skipped",
    };
  }

  /* =========================
     4️⃣ ABORT EXECUTION
  ========================= */

  return {
    decision: "abort",
    reason: `Critical step failed: ${error}`,
  };
};
