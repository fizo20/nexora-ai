// src/types/ai-execution.types.ts

import { AIStepStatus } from "./ai-system-actions.types";

export interface ToolEvent {
  type: "tool";
  name: string;
  status: "running" | "success" | "error";
}

export interface ExecutionContext {
  executionId: string;
  workspaceId: string;
  projectId: string;
  userId: string;
}

export interface ExecutionStep {
  index: number;

  action: string;

  payload: any;

  status: AIStepStatus;

  retryCount: number;

  dependsOn?: number[];
}

export type AIActionExecResult =
  | {
      success: true;
      result: any;
    }
  | {
      success: false;
      blocked?: boolean;
      reason: string;
    };
