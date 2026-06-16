// src/config/plan-limits.ts
import { WorkspacePlan } from "../models/workspace.model";

export const planLimits: Record<
  WorkspacePlan,
  {
    aiCallsPerHour: number;
    apiCallsPerHour: number;
  }
> = {
  FREE: {
    aiCallsPerHour: 20,
    apiCallsPerHour: 200,
  },
  PRO: {
    aiCallsPerHour: 200,
    apiCallsPerHour: 2000,
  },
  ENTERPRISE: {
    aiCallsPerHour: 2000,
    apiCallsPerHour: 20000,
  },
};
