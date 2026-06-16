// src/services/ai-agent-supervisor.service.ts

import { runAIAgent } from "./ai-agent.service";

type AgentType =
  | "planning"
  | "tasks"
  | "analytics"
  | "notifications"
  | "general";

type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

interface AgentRequest {
  workspaceId: string;
  projectId: string;
  userId: string;

  goal: string;

  messages?: AIMessage[];

  agentType?: AgentType;

  onToolEvent?: (event: any) => void;
}

export async function runAgentSupervisor(
  request: AgentRequest,
): Promise<string> {
  const selectedAgent = request.agentType || determineAgent(request.goal);

  console.log(`Supervisor selected agent: ${selectedAgent}`);

  const result: any = await runAIAgent(
    {
      goal: request.goal,
      messages: request.messages,
    },
    {
      workspaceId: request.workspaceId,
      projectId: request.projectId,
      userId: request.userId,
      specialization: selectedAgent,
      onToolEvent: request.onToolEvent,
    },
  );

  /*
   * Convert executor output into human language
   */

  if (typeof result === "string") {
    return result;
  }

  if (result && typeof result === "object" && result.data?.title) {
    return `Task "${result.data.title}" was created successfully.`;
  }

  if (result && typeof result === "object" && result.message) {
    return result.message;
  }

  return "Action completed successfully.";
}

function determineAgent(goal: string): AgentType {
  const text = goal.toLowerCase();

  if (text.includes("plan") || text.includes("roadmap")) {
    return "planning";
  }

  if (
    text.includes("task") ||
    text.includes("assign") ||
    text.includes("deadline")
  ) {
    return "tasks";
  }

  if (
    text.includes("report") ||
    text.includes("analytics") ||
    text.includes("metrics")
  ) {
    return "analytics";
  }

  if (
    text.includes("notify") ||
    text.includes("message") ||
    text.includes("alert")
  ) {
    return "notifications";
  }

  return "general";
}
