// src/services/ai-retry-engine.service.ts
import { executeAIActionStep } from "./ai-executor.service";
import { aiToolRegistry } from "../services/ai-tool-registry.service";

export interface AIRetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
}

export const defaultRetryPolicy: AIRetryPolicy = {
  maxRetries: 3,
  baseDelayMs: 1000,
};

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const calculateBackoff = (
  attempt: number,
  baseDelay: number,
): number => {
  return baseDelay * Math.pow(2, attempt);
};

export async function executeStepWithRetry(
  workspaceId: string,
  projectId: string,
  step: any,
  options?: any,
) {
  const tool = aiToolRegistry.getTool(step.action);

  if (!tool) {
    return {
      ok: false,
      blocked: true,
      reason: `Unknown tool: ${step.action}`,
    };
  }

  try {
    const result = await tool.execute(step.payload, { workspaceId, projectId });

    return {
      ok: true,
      blocked: false,
      data: result,
    };
  } catch (error: any) {
    return {
      ok: false,
      blocked: false,
      reason: error.message,
    };
  }
}
