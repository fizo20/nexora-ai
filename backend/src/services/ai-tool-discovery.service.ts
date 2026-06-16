// src/services/ai-tool-discovery.service.ts
import { aiToolRegistry } from "./ai-tool-registry.service";

interface ToolDescription {
  name: string;
  description: string;
}

interface AITool {
  name: string;
  description?: string;
}

export const discoverAvailableTools = (): ToolDescription[] => {
  const tools = aiToolRegistry.getAllTools() as AITool[];

  return tools.map((tool: AITool) => ({
    name: tool.name,
    description: tool.description || "No description provided",
  }));
};

export const buildToolPromptBlock = (): string => {
  const tools = discoverAvailableTools();

  if (!tools.length) return "";

  const lines = tools.map((tool) => `- ${tool.name}: ${tool.description}`);

  return `
Available Tools:
${lines.join("\n")}
`;
};
