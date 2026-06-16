// src/services/ai-step-graph-engine.service.ts

import { AIStepStatus } from "../types/ai-system-actions.types";

export interface GraphStep {
  index: number;
  action: string;
  payload: any;

  status: AIStepStatus;
  retryCount: number;

  dependsOn?: number[];
}

/* =====================================================
   GET EXECUTABLE STEPS
===================================================== */

export function getExecutableSteps(steps: GraphStep[]): GraphStep[] {
  return steps.filter((step) => {
    // only pending steps can execute
    if (step.status !== AIStepStatus.PENDING) {
      return false;
    }

    // no dependencies
    if (!step.dependsOn?.length) {
      return true;
    }

    // all dependencies must succeed
    return step.dependsOn.every((dependencyIndex) => {
      const dependency = steps.find((s) => s.index === dependencyIndex);

      return dependency?.status === AIStepStatus.SUCCESS;
    });
  });
}

/* =====================================================
   EXECUTION COMPLETION
===================================================== */

export function isExecutionComplete(steps: GraphStep[]): boolean {
  return steps.every(
    (step) =>
      step.status === AIStepStatus.SUCCESS ||
      step.status === AIStepStatus.SKIPPED,
  );
}
