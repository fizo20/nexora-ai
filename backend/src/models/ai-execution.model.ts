// src/models/ai-execution.model.ts
import mongoose, { Schema, Document } from "mongoose";
import {
  AIStepStatus,
  AIAction,
  AIActionPayload,
} from "../types/ai-system-actions.types";
import { ExecutionStatus } from "../enums/execution-status.enum";

/* =========================
   Interfaces
========================= */

export interface IAIExecutionStep {
  index: number;
  action: AIAction;
  status: AIStepStatus;
  error?: string;
  retryCount: number;
  lastRetryAt?: Date;

  isLocked: boolean;
  lockedAt?: Date;
}

export interface IAIExecution extends Document {
  executionId: string;
  workspaceId: string;
  projectId: string;
  status: ExecutionStatus;
  plan: AIActionPayload[];
  steps: IAIExecutionStep[];

  validationScore?: number;
  riskScore?: number;

  completedSteps: number;
  failedStep?: number;

  startedAt: Date;
  completedAt?: Date;

  failure?: {
    reason: string;
    stepIndex: number;
    errorMessage: string;
    failedAt: Date;
  };
}

/* =========================
   Step Schema
========================= */

const AIExecutionStepSchema = new Schema<IAIExecutionStep>(
  {
    index: { type: Number, required: true },

    action: {
      type: String,
      enum: ["create_task", "update_task_status", "set_task_priority"],
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(AIStepStatus),
      required: true,
    },

    error: { type: String },

    retryCount: {
      type: Number,
      default: 0,
      required: true,
    },

    lastRetryAt: { type: Date },

    isLocked: {
      type: Boolean,
      default: false,
      required: true,
    },

    lockedAt: { type: Date },
  },
  { _id: false },
);

/* =========================
   Main Schema
========================= */

const AIExecutionSchema = new Schema<IAIExecution>(
  {
    executionId: { type: String, required: true, unique: true },
    workspaceId: { type: String, required: true, index: true },
    projectId: { type: String, required: true },

    status: {
      type: String,
      enum: Object.values(ExecutionStatus),
      default: ExecutionStatus.PENDING,
      required: true,
    },

    plan: {
      type: [Schema.Types.Mixed] as unknown as AIActionPayload[],
      required: true,
      immutable: true,
    },

    validationScore: {
      type: Number,
    },

    riskScore: {
      type: Number,
    },

    steps: {
      type: [AIExecutionStepSchema],
      required: true,
    },

    completedSteps: { type: Number, default: 0 },
    failedStep: { type: Number },
    startedAt: { type: Date, required: true },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

export const AIExecution = mongoose.model<IAIExecution>(
  "AIExecution",
  AIExecutionSchema,
);
