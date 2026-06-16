// src/types/ai-plan.types.ts
import { AIActionPayload } from "./ai-system-actions.types";

/**
 * AI Multi-Step Plan
 * Produced by AI planner layer (later),
 * executed by multi-step executor service.
 */
export interface AIExecutionPlan {
  steps: AIActionPayload[];
  source: "AI" | "SYSTEM";
}

/**
 * Per-step execution result
 */
export interface AIExecutionStepResult {
  index: number;
  action: AIActionPayload;
  result: {
    ok: boolean;
    blocked?: boolean;
    reason?: string;
    data?: any;
  };
}

/**
 * Final execution summary
 */
export interface AIExecutionSummary {
  ok: boolean;
  executedSteps: number;
  blockedAtStep?: number;
  results: AIExecutionStepResult[];
}

export interface AIPlanStep {
  id: string;
  action: string;
  payload: any;
}
