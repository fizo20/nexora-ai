// src/services/ai-adaptive-planner.service.ts
import { AIExecutionMemory } from "../models/ai-execution-memory.model";
import { AIActionPayload } from "../types/ai-system-actions.types";

const FAILURE_THRESHOLD = 3;
const HISTORY_LIMIT = 200;

/**
 * Adaptive Planner Input
 */
interface AdaptiveInput {
  workspaceId: string;
  projectId: string;
  plan: AIActionPayload[];
}

/**
 * Adaptive Planner Output
 */
interface AdaptiveResult {
  improvedPlan: AIActionPayload[];
  modifications: string[];
}

/**
 * AI Adaptive Planner
 * Uses past failures to flag/skip historically unreliable actions.
 *
 * FIX: previously this appended a malformed extra `set_task_priority`
 * step (referencing `action.taskId`, which doesn't exist on most
 * action shapes, e.g. create_task) alongside the original failing
 * action — guaranteeing a translation/execution error downstream.
 *
 * New behaviour: if an action type has failed more than
 * FAILURE_THRESHOLD times recently, it is SKIPPED entirely (not
 * executed) and recorded in `modifications` so the reflection
 * engine / response formatter can surface this to the user.
 */
export async function improveAIPlan(
  input: AdaptiveInput,
): Promise<AdaptiveResult> {
  const { workspaceId, projectId, plan } = input;

  const history = await AIExecutionMemory.find({
    workspaceId,
    projectId,
  })
    .sort({ timestamp: -1 })
    .limit(HISTORY_LIMIT)
    .lean();

  const failureMap: Record<string, number> = {};

  for (const record of history) {
    if (record.outcome === "failed") {
      failureMap[record.actionType] = (failureMap[record.actionType] || 0) + 1;
    }
  }

  const improvedPlan: AIActionPayload[] = [];
  const modifications: string[] = [];

  for (const action of plan) {
    const failures = failureMap[action.action] || 0;

    if (failures > FAILURE_THRESHOLD) {
      modifications.push(
        `Action "${action.action}" has failed ${failures} times recently — skipped for safety.`,
      );

      // Skip this action entirely; do not push it to improvedPlan.
      continue;
    }

    improvedPlan.push(action);
  }

  // Never return an empty plan — fall back to the original plan
  // untouched if everything got filtered out, so the agent still
  // attempts something rather than doing nothing.
  if (improvedPlan.length === 0) {
    return {
      improvedPlan: plan,
      modifications: [
        ...modifications,
        "All actions were flagged as unreliable — proceeding with original plan as fallback.",
      ],
    };
  }

  return {
    improvedPlan,
    modifications,
  };
}
