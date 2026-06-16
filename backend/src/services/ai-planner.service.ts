// src/services/ai-planner.service.ts
import { callLLMRaw } from "./ai-provider.service";
import { AIActionPayload } from "../types/ai-system-actions.types";
import { buildToolPromptBlock } from "./ai-tool-discovery.service";
import { analyzeLearning } from "./ai-learning-engine.service";
import { WorkspaceState } from "./ai-context.service";

interface WorkspaceContext {
  projectsCount: number;
  tasksCount: number;
  blockedTasks: number;
  overdueTasks: number;
}

/**
 * Build planner prompt
 *
 * Forces AI to return structured safe action plan
 */
const buildPlannerPrompt = (
  workspaceName: string,
  userInstruction: string,

  context?: WorkspaceContext,
  learning?: {
    recommendedTools: string[];
    riskyTools: string[];
  },
): string => {
  const contextBlock = context
    ? `
Workspace Intelligence:
${JSON.stringify(context, null, 2)}

Guidelines:
- Avoid creating duplicate tasks from recentTasks
- Avoid actions that previously failed (failurePatterns)
- Prioritize fixing blocked or overdue tasks
`
    : "";

  const learningBlock = learning
    ? `
AI Tool Learning Insights:

Reliable Tools (prefer using these):
${learning.recommendedTools.join(", ") || "None"}

Risky Tools (avoid if possible):
${learning.riskyTools.join(", ") || "None"}
`
    : "";

  return `
You are an AI workspace planner.

STRICT INSTRUCTIONS:
- You MUST return ONLY valid JSON
- DO NOT include text, explanations, or markdown
- DO NOT return empty array
- ALWAYS return at least ONE action

Available actions:
- create_task
- update_task_status
- set_task_priority

${contextBlock}
${learningBlock}

User instruction:
"${userInstruction}"

Return this format EXACTLY:

[
  {
    "action": "create_task",
    "title": "Clear descriptive task name",
    "priority": "HIGH"
  }
]
`;
};

/**
 * Generates an AI action plan.
 *
 * @param workspaceState Pre-computed workspace state (from
 *   `buildWorkspaceState`, called once per request in
 *   ai-agent.service.ts). Avoids a redundant second DB read.
 */
export const generateAIPlan = async (
  workspaceId: string,
  instruction: string,
  projectId: string | undefined,
  workspaceState: WorkspaceState,
): Promise<AIActionPayload[]> => {
  // 1️⃣ Load learning data (bounded query — see ai-learning-engine.service.ts)
  const learning = await analyzeLearning(workspaceId, projectId);

  // 2️⃣ Build planner prompt
  const prompt = buildPlannerPrompt(
    workspaceId,
    instruction,

    workspaceState,
    learning,
  );

  const raw = await callLLMRaw(prompt);

  let cleaned = raw.trim();

  // 🧹 Remove markdown code blocks (```json ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
  }

  // 🧹 Extract JSON array if AI added text before/after
  const start = cleaned.indexOf("[");
  const end = cleaned.lastIndexOf("]");

  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    console.error("❌ AI planner returned invalid JSON:", cleaned);
    throw new Error("AI planner returned invalid JSON");
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    console.warn("⚠️ AI returned empty/invalid plan — using fallback");

    return [
      {
        action: "create_task",
        title: "Untitled Task",
        priority: "MEDIUM",
      } as AIActionPayload,
    ];
  }

  return parsed.slice(0, 5) as AIActionPayload[];
};
