// src/config/plan-features.ts
import { WorkspacePlan } from "../models/workspace.model";
import { AIAction } from "../types/ai-system-actions.types";

export interface PlanFeatures {
  maxMembers: number;
  aiEnabled: boolean;
  auditLogsEnabled: boolean;
  /** Feature flags */
  apiAccess: boolean;

  /** Included monthly usage quotas */
  includedApiCalls: number;
}

/**
 * Feature limits per workspace plan
 * This is the single source of truth for billing enforcement
 */
export const planFeatures: Record<WorkspacePlan, PlanFeatures> = {
  FREE: {
    maxMembers: 3,
    aiEnabled: false,
    auditLogsEnabled: false,
    apiAccess: false,
    includedApiCalls: 0,
  },

  PRO: {
    maxMembers: 10,
    aiEnabled: true,
    auditLogsEnabled: true,
    apiAccess: true,
    includedApiCalls: 10000,
  },

  ENTERPRISE: {
    maxMembers: 100,
    aiEnabled: true,
    auditLogsEnabled: true,
    apiAccess: true,
    includedApiCalls: 100000,
  },
} as const;
