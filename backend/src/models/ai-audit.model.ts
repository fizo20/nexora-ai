// src/models/ai-audit.model.ts
import { Schema, model, Types } from "mongoose";
import { AIAuditAction } from "../types/ai-audit.types";

export interface IAIAudit {
  workspaceId: Types.ObjectId;
  userId: Types.ObjectId;
  projectId?: Types.ObjectId;
  action: AIAuditAction;
  endpoint: string;

  promptHash: string;

  cost: number;

  inputSize: number;
  outputSize: number;

  aiModel: string;

  createdAt: Date;
}

const schema = new Schema<IAIAudit>(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true, index: true },
    userId: { type: Schema.Types.ObjectId, required: true },

    action: {
      type: String,
      required: true,
      enum: [
        "SUMMARY",
        "RISK",
        "SUGGESTION",
        "QA",
        "TASK_GENERATION",
        "CHAT",
        "PLAN",
        "PLAN_SIMULATION",
        "ACTION_EXECUTION",
        "ACTION_DRY_RUN",
        "AI_DISABLED",
        "AI_ENABLED",
        "GLOBAL_AI_DISABLED",
      ],
    },

    endpoint: { type: String, required: true },

    promptHash: { type: String, required: true },

    cost: {
      type: Number,
      default: 0,
    },

    inputSize: Number,
    outputSize: Number,

    aiModel: String,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

schema.index({ workspaceId: 1, createdAt: -1 });

export const AIAudit = model<IAIAudit>("AIAudit", schema);
