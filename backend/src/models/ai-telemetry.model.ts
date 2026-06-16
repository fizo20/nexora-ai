// src/models/ai-telemetry.model.ts
import { Document, Schema, model } from "mongoose";

export interface IAITelemetry extends Document {
  executionId: string;
  workspaceId: string;
  projectId: string;

  totalSteps: number;
  completedSteps: number;
  failedSteps: number;

  averageStepDuration: number;

  validationScore?: number;
  riskScore?: number;

  successRate: number;

  createdAt: Date;
}

const aiTelemetrySchema = new Schema<IAITelemetry>(
  {
    executionId: { type: String, required: true },
    workspaceId: { type: String, required: true },
    projectId: { type: String, required: true },

    totalSteps: Number,
    completedSteps: Number,
    failedSteps: Number,

    averageStepDuration: Number,

    validationScore: Number,
    riskScore: Number,

    successRate: Number,
  },
  { timestamps: true },
);

export const AITelemetry = model<IAITelemetry>(
  "AITelemetry",
  aiTelemetrySchema,
);
