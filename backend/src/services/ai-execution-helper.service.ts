import { AIExecutionMemory } from "../models/ai-execution-memory.model";

import {
  recordDecisionMetric,
  recordToolMetrics,
} from "./ai-tool-intelligence.service";

import { decideNextAction } from "./ai-decision-engine.service";

export async function handleSuccessfulExecution(params: {
  context: any;
  step: any;
  duration: number;
}) {
  const { context, step, duration } = params;

  await AIExecutionMemory.create({
    workspaceId: context.workspaceId,
    projectId: context.projectId,
    executionId: context.executionId,

    stepIndex: step.index,

    actionType: step.action,

    outcome: "success",

    duration,
  });

  await recordToolMetrics({
    workspaceId: context.workspaceId,
    toolName: step.action,
    success: true,
    duration,
  });
}

export async function handleFailedExecution(params: {
  context: any;
  step: any;
  errorMessage: string;
  duration: number;
}) {
  const { context, step, errorMessage, duration } = params;

  await recordToolMetrics({
    workspaceId: context.workspaceId,
    toolName: step.action,
    success: false,
    duration,
  });

  const decision = await decideNextAction({
    workspaceId: context.workspaceId,

    action: step.action,

    payload: step.payload,

    error: errorMessage,

    retryCount: step.retryCount,
  });

  await recordDecisionMetric({
    workspaceId: context.workspaceId,

    action: step.action,

    decision: decision.decision,

    success: false,
  });

  await AIExecutionMemory.create({
    workspaceId: context.workspaceId,
    projectId: context.projectId,
    executionId: context.executionId,

    stepIndex: step.index,

    actionType: step.action,

    outcome: "failed",

    duration,

    stepError: errorMessage,

    healingDecision: decision.decision,
  });

  return decision;
}
