// src/types/ai-policy.types.ts
import { AIActionPayload } from "./ai-system-actions.types";

export interface AIPolicyResult {
  allowed: boolean;
  reason?: string;
  modifiedAction?: AIActionPayload;
}
