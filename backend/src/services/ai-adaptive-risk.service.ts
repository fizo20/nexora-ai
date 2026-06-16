// src/services/ai-adaptive-risk.service.ts
import { AITelemetry } from "../models/ai-telemetry.model";

/**
 * Calculates dynamic risk threshold for a workspace
 * based on recent execution performance.
 */
export const getAdaptiveRiskThreshold = async (
  workspaceId: string,
): Promise<number> => {
  const recent = await AITelemetry.find({ workspaceId })
    .sort({ createdAt: -1 })
    .limit(20);

  if (recent.length === 0) {
    return 75; // default base threshold
  }

  const avgSuccessRate =
    recent.reduce((sum, t) => sum + t.successRate, 0) / recent.length;

  /*
    Adaptive Logic:
    - If workspace fails frequently → tighten risk tolerance
    - If workspace is stable → loosen risk tolerance
  */

  if (avgSuccessRate < 50) {
    return 60; // stricter
  }

  if (avgSuccessRate > 90) {
    return 85; // more tolerant
  }

  return 75; // neutral baseline
};
