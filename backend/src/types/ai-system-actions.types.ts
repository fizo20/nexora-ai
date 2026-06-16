// src/types/ai-system-actions.types.ts
/* =========================
   Base Step Properties
========================= */

export interface AIBaseStep {
  dependsOn?: number[]; // step indexes this step depends on
}

/* =========================
   AI Action Identifiers
========================= */

export type AIAction =
  | "create_task"
  | "update_task_status"
  | "set_task_priority";

/* =========================
   Action Payloads
========================= */

export interface AICreateTaskAction extends AIBaseStep {
  action: "create_task";
  title: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export interface AIUpdateTaskStatusAction extends AIBaseStep {
  action: "update_task_status";
  taskId: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
}

export interface AISetPriorityAction extends AIBaseStep {
  action: "set_task_priority";
  taskId: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
}

export type AIActionPayload =
  | AICreateTaskAction
  | AIUpdateTaskStatusAction
  | AISetPriorityAction;

/* =========================
   Step Status
========================= */

export enum AIStepStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
  ROLLED_BACK = "ROLLED_BACK",
  SKIPPED = "SKIPPED",
}

/* =========================
   Execution Status
========================= */

export enum ExecutionStatus {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED", // retryable
  TERMINAL = "TERMINAL", // permanent failure
}

/* =========================
   Step State (Stored in DB)
========================= */

export interface AIExecutionStepState {
  index: number;
  action: AIAction;
  status: AIStepStatus;

  retryCount: number;
  error?: string;

  isLocked?: boolean;
  lockedAt?: Date;
}

/* =========================
   Runtime Execution Context
========================= */

export interface AIExecutionContext {
  executionId: string;
  workspaceId: string;
  projectId: string;
  // userId: string;
  steps: AIExecutionStepState[];
  startedAt: Date;
  completedAt?: Date;
}
