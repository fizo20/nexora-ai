// src/services/ai-prediction-engine.service.ts
import { AIExecutionMemory } from "../models/ai-execution-memory.model";

interface PredictionInput {
  workspaceId: string;
  projectId: string;
  actionType: string;
}

interface PredictionResult {
  predictedFailure: boolean;
  failureProbability: number;
  confidence: number;
  recommendation?: "retry" | "repair" | "skip" | "proceed";
}

/*
 AI FAILURE PREDICTION ENGINE
 Learns from historical execution memory
*/

export async function predictStepFailure(
  input: PredictionInput,
): Promise<PredictionResult> {
  const { workspaceId, projectId, actionType } = input;

  const history = await AIExecutionMemory.find({
    workspaceId,
    projectId,
    actionType,
  }).limit(200);

  if (!history.length) {
    return {
      predictedFailure: false,
      failureProbability: 0,
      confidence: 0,
      recommendation: "proceed",
    };
  }

  let failures = 0;
  let successes = 0;

  for (const record of history) {
    if (record.outcome === "failed") failures++;
    if (record.outcome === "success") successes++;
  }

  const total = failures + successes;

  const failureProbability = failures / total;

  let recommendation: PredictionResult["recommendation"] = "proceed";

  if (failureProbability > 0.6) recommendation = "skip";
  else if (failureProbability > 0.4) recommendation = "repair";
  else if (failureProbability > 0.25) recommendation = "retry";

  return {
    predictedFailure: failureProbability > 0.4,
    failureProbability,
    confidence: Math.min(total / 50, 1),
    recommendation,
  };
}
