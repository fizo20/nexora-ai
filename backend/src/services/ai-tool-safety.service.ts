// src/services/ai-tool-safety.service.ts
import { AITool } from "./ai-tool-registry.service";

interface ToolExecutionContext {
  workspaceId: string;
  projectId: string;
}

export function validateToolExecution(
  tool: AITool,
  payload: any,
  context: ToolExecutionContext,
) {
  if (!tool) {
    throw new Error("Tool validation failed: tool does not exist");
  }

  if (!context.workspaceId) {
    throw new Error("Tool validation failed: missing workspaceId");
  }

  if (!context.projectId) {
    throw new Error("Tool validation failed: missing projectId");
  }

  if (payload === undefined || payload === null) {
    throw new Error("Tool validation failed: payload missing");
  }

  // Prevent extremely large payloads
  const payloadSize = JSON.stringify(payload).length;

  if (payloadSize > 10000) {
    throw new Error("Tool validation failed: payload too large");
  }

  return true;
}
