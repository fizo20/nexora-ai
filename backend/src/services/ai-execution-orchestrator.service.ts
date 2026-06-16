import { aiToolRegistry } from "./ai-tool-registry.service";
import { AIExecutionMemory } from "../models/ai-execution-memory.model";

import {
  getExecutableSteps,
  isExecutionComplete,
} from "./ai-step-graph-engine.service";

import { generateDynamicTool } from "./ai-dynamic-tool-generator.service";

import { validateToolExecution } from "./ai-tool-safety.service";

import { decideNextAction } from "./ai-decision-engine.service";
import { emitToolEvent } from "./ai-tool-event.service";
import {
  recordDecisionMetric,
  recordToolMetrics,
} from "./ai-tool-intelligence.service";

import {
  ExecutionContext,
  ExecutionStep,
  ToolEvent,
} from "../types/ai-execution.types";

import { AIStepStatus } from "../types/ai-system-actions.types";

const MAX_RETRIES = 2;

export async function runExecutionPlan(
  steps: ExecutionStep[],
  context: ExecutionContext,
  onToolEvent?: (event: ToolEvent) => void,
) {
  const results: any[] = [];

  while (!isExecutionComplete(steps)) {
    const executableSteps = getExecutableSteps(steps);

    if (executableSteps.length === 0) {
      throw new Error("Deadlock detected in execution graph");
    }

    for (const step of executableSteps) {
      let tool = aiToolRegistry.getTool(step.action);

      if (!tool) {
        tool = await generateDynamicTool(step.action);

        if (!tool) {
          throw new Error(`Cannot generate tool ${step.action}`);
        }
      }

      step.status = AIStepStatus.RUNNING;

      emitToolEvent(onToolEvent, step.action, "running");

      const started = Date.now();

      try {
        validateToolExecution(tool, step.payload, context);

        const result = await tool.execute(step.payload, context);

        step.status = AIStepStatus.SUCCESS;

        onToolEvent?.({
          type: "tool",

          name: step.action,

          status: "success",
        });

        const duration = Date.now() - started;

        await recordToolMetrics({
          workspaceId: context.workspaceId,

          toolName: step.action,

          success: true,

          duration,
        });

        await AIExecutionMemory.create({
          workspaceId: context.workspaceId,

          projectId: context.projectId,

          executionId: context.executionId,

          stepIndex: step.index,

          actionType: step.action,

          outcome: "success",

          duration,
        });

        results.push(result);
      } catch (error: any) {
        onToolEvent?.({
          type: "tool",

          name: step.action,

          status: "error",
        });

        const errorMessage = error?.message || "Unknown error";

        await recordToolMetrics({
          workspaceId: context.workspaceId,

          toolName: step.action,

          success: false,

          duration: Date.now() - started,
        });

        const decision = await decideNextAction({
          action: step.action,

          payload: step.payload,

          error: errorMessage,

          retryCount: step.retryCount,

          workspaceId: context.workspaceId,
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

          duration: Date.now() - started,

          stepError: errorMessage,

          healingDecision: decision.decision,
        });

        switch (decision.decision) {
          case "retry":
            step.retryCount++;

            step.status = AIStepStatus.PENDING;

            break;

          case "modify_payload":
            step.payload = {
              ...step.payload,
              ...decision.newPayload,
            };

            step.retryCount++;

            step.status = AIStepStatus.PENDING;

            break;

          case "skip":
            step.status = AIStepStatus.SKIPPED;

            results.push({
              skipped: true,
            });

            break;

          case "generate_tool":
            await generateDynamicTool(step.action);

            step.retryCount++;

            step.status = AIStepStatus.PENDING;

            break;

          default:
            step.status = AIStepStatus.FAILED;

            throw error;
        }

        if (step.retryCount > MAX_RETRIES) {
          step.status = AIStepStatus.SKIPPED;
        }
      }
    }
  }

  return results;
}
