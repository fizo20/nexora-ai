//src/config/ai-model-cost.config.ts
/**
 * Cost per 1K tokens (example values)
 * These should mirror real provider pricing.
 */
export const AI_MODEL_COST = {
  "gpt-4": {
    inputPer1K: 0.03,
    outputPer1K: 0.06,
  },

  "gpt-4o": {
    inputPer1K: 0.005,
    outputPer1K: 0.015,
  },

  "mock-ai": {
    inputPer1K: 0,
    outputPer1K: 0,
  },
} as const;
