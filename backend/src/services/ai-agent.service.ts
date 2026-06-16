//backend/src/services/ai-agent.service.ts

import { randomUUID } from "crypto";

import { generateAIPlan } from "./ai-planner.service";
import { improveAIPlan } from "./ai-adaptive-planner.service";
import { translateAIPlan } from "./ai-plan-translator.service";
import { runExecutionPlan } from "./ai-execution-orchestrator.service";
import { analyzeExecution } from "./ai-reflection-engine.service";
import { buildWorkspaceState } from "./ai-context.service";
import { formatAIResponse } from "./ai-response-formatter.service";

import { aiSkillEngine } from "./ai-skill-engine.service";
import { basicTaskSkill } from "./skills/basic-task.skill";

import { AIAgentExecution } from "../models/ai-agent-execution.model";

import {
  AIActionPayload,
  AIStepStatus,
} from "../types/ai-system-actions.types";

import { ExecutionStep, ToolEvent } from "../types/ai-execution.types";

type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

interface AgentGoal {
  goal: string;
  messages?: AIMessage[];
}

interface AgentContext {
  workspaceId: string;
  projectId: string;
  userId: string;

  specialization?:
    | "planning"
    | "tasks"
    | "analytics"
    | "notifications"
    | "general";

  onToolEvent?: (event: ToolEvent) => void;
}

export async function runAIAgent(input: AgentGoal, context: AgentContext) {
  const { goal, messages } = input;

  /*
   * LOAD SKILLS
   */

  aiSkillEngine.reset();

  aiSkillEngine.registerSkill(basicTaskSkill);

  await aiSkillEngine.loadLearnedSkills(context.workspaceId);

  /*
   * BUILD CONTEXT (single source of truth — computed once per request)
   */

  const workspaceState = await buildWorkspaceState(
    context.workspaceId,
    context.projectId,
  );

  const conversationContext =
    messages
      ?.slice(-5)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n") || "";

  const enhancedGoal = `
${conversationContext}

Workspace State:
Projects: ${workspaceState.projectsCount}
Tasks: ${workspaceState.tasksCount}
Blocked: ${workspaceState.blockedTasks}
Overdue: ${workspaceState.overdueTasks}

User Goal:
${goal}
`;

  /*
   * SKILL ENGINE
   *
   * NOTE: we resolve against the raw `goal`, not `enhancedGoal`.
   * Dynamic skill builders (e.g. basic-task) need to parse the
   * user's literal wording ("Create a task called Build API docs"),
   * not a prompt wrapped in workspace-state boilerplate.
   */

  let actions: AIActionPayload[] | null = aiSkillEngine.resolveSkill(
    goal,
    messages,
  );

  /*
   * PLANNER
   */

  if (!actions) {
    actions = await generateAIPlan(
      context.workspaceId,
      enhancedGoal,
      context.projectId,
      workspaceState,
    );
  }

  /*
   * ADAPTIVE PLANNER
   */

  const adaptive = await improveAIPlan({
    workspaceId: context.workspaceId,
    projectId: context.projectId,
    plan: actions,
  });

  /*
   * TRANSLATE
   */

  const translated = translateAIPlan(adaptive.improvedPlan);

  /*
   * EXECUTION STEPS
   */

  const executionId = randomUUID();

  const steps: ExecutionStep[] = translated.map((step, index) => ({
    index,

    action: step.action,

    payload: step.payload,

    dependsOn: (step as any).dependsOn,

    retryCount: 0,

    status: AIStepStatus.PENDING,
  }));

  /*
   * EXECUTION
   */

  const results = await runExecutionPlan(
    steps,
    {
      executionId,

      workspaceId: context.workspaceId,

      projectId: context.projectId,

      userId: context.userId,
    },

    context.onToolEvent,
  );

  /*
   * REFLECTION
   */

  const reflection = await analyzeExecution({
    workspaceId: context.workspaceId,

    projectId: context.projectId,

    executionId,
  });

  /*
   * STORE EXECUTION METRICS
   */

  await AIAgentExecution.create({
    workspaceId: context.workspaceId,

    projectId: context.projectId,

    executionId,

    agentType: context.specialization || "general",

    success: reflection.successRate >= 0.5,

    totalSteps: steps.length,

    completedSteps: steps.filter((s) => s.status === AIStepStatus.SUCCESS)
      .length,

    failedSteps: steps.filter((s) => s.status === AIStepStatus.FAILED).length,
  });

  /*
   * RESPONSE
   */

  return formatAIResponse({
    goal,
    steps,
    results,
    reflection,
  });
}
