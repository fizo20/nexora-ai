// src/services/ai-learning-predictstep-failure.service.ts
import { AIExecutionMemory } from "../models/ai-execution-memory.model";

export interface FailurePrediction {
  riskScore: number;
  predictedFailure: boolean;
  suggestedStrategy?: "retry" | "repair" | "skip";
}

export const predictStepFailure = async (
  workspaceId: string,
  actionType: string,
): Promise<FailurePrediction> => {
  const history = await AIExecutionMemory.find({
    workspaceId,
    actionType,
  }).limit(50);

  if (history.length === 0) {
    return {
      riskScore: 0,
      predictedFailure: false,
    };
  }

  const failures = history.filter((h) => h.outcome === "failed").length;
  const retries = history.filter((h) => h.healingDecision === "retry").length;
  const repairs = history.filter((h) => h.healingDecision === "repair").length;

  const riskScore = failures / history.length;

  let strategy: "retry" | "repair" | "skip" | undefined;

  if (repairs > retries) strategy = "repair";
  else if (retries > 0) strategy = "retry";

  return {
    riskScore,
    predictedFailure: riskScore > 0.4,
    suggestedStrategy: strategy,
  };
};
