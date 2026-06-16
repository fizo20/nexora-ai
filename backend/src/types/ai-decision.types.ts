// src/types/ai-decision.types.ts
export type AIDecisionType =
  | "retry"
  | "skip"
  | "modify_payload"
  | "generate_tool"
  | "abort";

export interface AIDecision {
  decision: AIDecisionType;

  reason: string;

  newPayload?: any;
}
