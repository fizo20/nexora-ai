//backend/src/services/ai-execution-orchestrator.service.ts
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

  // Safety valve: a malformed step graph (e.g. a step that depends
  // on an index that doesn't exist) can make getExecutableSteps()
  // return [] forever without isExecutionComplete() ever becoming
  // true. Cap total loop iterations so this degrades to a clear
  // error instead of an infinite request that times out silently.
  const MAX_LOOP_ITERATIONS = steps.length * (MAX_RETRIES + 2) + 10;
  let loopIterations = 0;

  while (!isExecutionComplete(steps)) {
    loopIterations++;
    if (loopIterations > MAX_LOOP_ITERATIONS) {
      throw new Error(
        `Execution plan did not converge after ${loopIterations} iterations — likely a malformed step graph (bad dependsOn index).`,
      );
    }

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
        // 🔍 Always log the *real* underlying error before any
        // recovery logic runs. Previously this only surfaced as a
        // generic "I ran into a problem..." message on the frontend
        // with no trace of the actual cause in the server logs.
        console.error(
          `❌ Tool execution failed for step "${step.action}" (index ${step.index}):`,
          error,
        );

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
            results.push({ skipped: true });
            break;

          case "generate_tool":
            await generateDynamicTool(step.action);
            step.retryCount++;
            step.status = AIStepStatus.PENDING;
            break;

          // FIX: "abort" was previously falling into `default`,
          // which rethrew the *original* tool error with no context
          // about why the orchestrator gave up. Now it's explicit
          // and the rethrown error carries the decision's reason.
          case "abort":
            step.status = AIStepStatus.FAILED;
            throw new Error(
              `Step "${step.action}" aborted: ${decision.reason || errorMessage}`,
            );

          default:
            step.status = AIStepStatus.FAILED;
            throw new Error(
              `Step "${step.action}" failed with unhandled decision "${decision.decision}": ${errorMessage}`,
            );
        }

        if (step.retryCount > MAX_RETRIES) {
          step.status = AIStepStatus.SKIPPED;
        }
      }
    }
  }

  return results;
}
