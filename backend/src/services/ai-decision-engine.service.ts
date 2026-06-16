// src/services/ai-decision-engine.service.ts

import { AIDecision } from "../types/ai-decision.types";
import { AIExecutionMemory } from "../models/ai-execution-memory.model";

interface DecideNextActionParams {
  action: string;
  payload: any;
  error: string;
  retryCount: number;
  workspaceId: string;
}

/**
 * AI Decision Engine
 */
export async function decideNextAction(
  params: DecideNextActionParams,
): Promise<AIDecision> {
  const { action, error, retryCount, workspaceId } = params;

  const normalizedError = error.toLowerCase();

  /* =========================================
     LOAD FAILURE HISTORY
  ========================================= */

  const previousFailures = await AIExecutionMemory.find({
    workspaceId,
    actionType: action,
    outcome: "failed",
  })
    .sort({ timestamp: -1 })
    .limit(5)
    .lean();

  const failureCount = previousFailures.length;

  /* =========================================
     TIMEOUT → RETRY
  ========================================= */

  if (normalizedError.includes("timeout") && retryCount < 2) {
    return {
      decision: "retry",
      reason: "Transient timeout error",
    };
  }

  /* =========================================
     RESOURCE NOT FOUND → SKIP
  ========================================= */

  if (normalizedError.includes("not found")) {
    return {
      decision: "skip",
      reason: "Target resource not found",
    };
  }

  /* =========================================
     HISTORICAL FAILURES → SKIP
  ========================================= */

  if (failureCount >= 3) {
    return {
      decision: "skip",
      reason: "Repeated failures detected",
    };
  }

  /* =========================================
     VALIDATION ERROR → REPAIR PAYLOAD
  ========================================= */

  if (normalizedError.includes("validation")) {
    return {
      decision: "modify_payload",
      reason: "Repairing payload",

      newPayload: {
        priority: "MEDIUM",
      },
    };
  }

  /* =========================================
     UNKNOWN ERROR → RETRY ONCE
  ========================================= */

  if (retryCount < 1) {
    return {
      decision: "retry",
      reason: "Retrying unknown failure",
    };
  }

  /* =========================================
     FINAL FALLBACK
  ========================================= */

  return {
    decision: "abort",
    reason: "Too many failures",
  };
}
