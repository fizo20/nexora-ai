// src/services/ai-cost-estimator.service.ts
import { AI_MODEL_COST } from "../config/ai-model-cost.config";

/**
 * Estimate AI request cost before execution.
 *
 * Uses character length as token approximation.
 * Can later be replaced with real tokenizer.
 */
export const estimateAICost = (params: { prompt: string; model?: string }) => {
  const modelName = params.model ?? "mock-ai";

  const pricing =
    AI_MODEL_COST[modelName as keyof typeof AI_MODEL_COST] ??
    AI_MODEL_COST["mock-ai"];

  const estimatedInputSize = params.prompt.length;

  /**
   * Conservative assumption:
   * Output ≈ 1.2x input
   */
  const estimatedOutputSize = Math.ceil(estimatedInputSize * 1.2);

  const cost =
    (estimatedInputSize / 1000) * pricing.inputPer1K +
    (estimatedOutputSize / 1000) * pricing.outputPer1K;

  return Number(cost.toFixed(6));
};
