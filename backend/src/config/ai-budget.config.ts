//src/config/ai-budget.config.ts
import { WorkspacePlan } from "../models/workspace.model";

export const AI_MONTHLY_BUDGET: Record<WorkspacePlan, number> = {
  FREE: 10,
  PRO: 50,
  ENTERPRISE: 1000,
};
