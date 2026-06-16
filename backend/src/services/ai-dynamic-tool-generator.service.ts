// src/services/ai-dynamic-tool-generator.service.ts
import { aiToolRegistry, AITool } from "./ai-tool-registry.service";

interface ToolContext {
  workspaceId: string;
  projectId: string;
}

export async function generateDynamicTool(toolName: string): Promise<AITool> {
  console.log(`AI generating dynamic tool: ${toolName}`);

  const tool: AITool = {
    name: toolName,
    description: "AI dynamically generated tool",

    async execute(payload: any, context: ToolContext) {
      console.log(`Executing dynamic tool: ${toolName}`);

      return {
        tool: toolName,
        executed: true,
        payload,
      };
    },
  };

  // Register tool correctly
  aiToolRegistry.register(tool);

  return tool;
}
