//src/config/ai-limits.config.ts
import { WorkspacePlan } from "../models/workspace.model";

export interface AIUsageLimit {
  aiCalls: number;
  maxInputSize: number;
  maxOutputSize: number;
}

/**
 * AI volume limits per 30-day rolling window.
 * This protects infrastructure cost and abuse.
 */
export const AI_LIMITS: Record<WorkspacePlan, AIUsageLimit> = {
  FREE: {
    aiCalls: 50,
    maxInputSize: 5000,
    maxOutputSize: 5000,
  },

  PRO: {
    aiCalls: 500,
    maxInputSize: 15000,
    maxOutputSize: 15000,
  },

  ENTERPRISE: {
    aiCalls: 5000,
    maxInputSize: 50000,
    maxOutputSize: 50000,
  },
};
