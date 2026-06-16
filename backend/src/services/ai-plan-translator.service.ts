// src/services/ai-plan-translator.service.ts

import { AIActionPayload } from "../types/ai-system-actions.types";

interface AgentStep {
  action: string;
  payload: any;
}

type Translator = (
  payload: any,
) => AgentStep;

const translators: Record<
  string,
  Translator
> = {
  create_task: (payload) => ({
    action: "create_task",

    payload: {
      title: payload.title,
      description: payload.description,
      priority: payload.priority,
    },
  }),

  update_task_status: (payload) => ({
    action: "update_task_status",

    payload: {
      taskId: payload.taskId,
      status: payload.status,
    },
  }),

  set_task_priority: (payload) => ({
    action: "set_task_priority",

    payload: {
      taskId: payload.taskId,
      priority: payload.priority,
    },
  }),
};

export function translateAIPlan(
  actions: AIActionPayload[],
): AgentStep[] {
  const steps: AgentStep[] = [];

  for (const action of actions) {
    const payload =
      (action as any).payload || action;

    const translator =
      translators[action.action];

    if (!translator) {
      console.warn(
        "Unknown action:",
        action.action,
      );

      continue;
    }

    steps.push(
      translator(payload),
    );
  }

  console.log(
    "🧪 TRANSLATED PLAN:",
    steps,
  );

  return steps;
}