// src/services/ai-anomaly.service.ts
import { AIAudit } from "../models/ai-audit.model";

/**
 * Detect abnormal AI usage spike
 */
export const detectAIUsageSpike = async (workspaceId: string) => {
  const lastHour = new Date(Date.now() - 60 * 60 * 1000);

  const count = await AIAudit.countDocuments({
    workspaceId,
    createdAt: { $gte: lastHour },
  });

  if (count > 100) {
    console.warn("⚠️ AI usage spike detected", workspaceId, count);
  }
};
