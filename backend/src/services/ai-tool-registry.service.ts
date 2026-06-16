// src/services/ai-tool-registry.service.ts

export interface AITool {
  name: string;
  description: string;

  execute: (payload: any, context: any) => Promise<any>;
}

class AIToolRegistry {
  private tools = new Map<string, AITool>();

  /* =========================================
     REGISTER TOOL
  ========================================= */

  register(tool: AITool): void {
    this.tools.set(tool.name, tool);
  }

  /* =========================================
     GET TOOL
  ========================================= */

  getTool(name: string): AITool | undefined {
    return this.tools.get(name);
  }

  /* =========================================
     CHECK TOOL EXISTENCE
  ========================================= */

  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /* =========================================
     REMOVE TOOL
  ========================================= */

  unregister(name: string): void {
    this.tools.delete(name);
  }

  /* =========================================
     ALL TOOLS
  ========================================= */

  getAllTools(): AITool[] {
    return [...this.tools.values()];
  }

  /* =========================================
     TOOL NAMES
  ========================================= */

  getToolNames(): string[] {
    return [...this.tools.keys()];
  }

  /* =========================================
     TOOL COUNT
  ========================================= */

  size(): number {
    return this.tools.size;
  }

  /* =========================================
     RESET REGISTRY
  ========================================= */

  clear(): void {
    this.tools.clear();
  }
}

export const aiToolRegistry = new AIToolRegistry();
