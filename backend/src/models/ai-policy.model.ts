// src/models/ai-policy.model.ts
import { Schema, model, Types } from "mongoose";

export interface IAIPolicy {
  workspaceId: Types.ObjectId;

  allowTaskCreate: boolean;
  allowTaskStatusUpdate: boolean;
  allowPriorityChange: boolean;

  allowHighPriorityCreate: boolean;

  maxActionsPerRequest: number;

  maxPlansPerHour: number;
  maxExecutionsPerHour: number;
  maxSimulationsPerHour: number;

  maxConcurrentSteps?: number;

  createdAt: Date;
}

const schema = new Schema<IAIPolicy>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      unique: true,
      index: true,
      required: true,
    },

    allowTaskCreate: { type: Boolean, default: true },
    allowTaskStatusUpdate: { type: Boolean, default: true },
    allowPriorityChange: { type: Boolean, default: true },

    allowHighPriorityCreate: { type: Boolean, default: false },

    maxActionsPerRequest: { type: Number, default: 3 },

    maxPlansPerHour: { type: Number, default: 30 },
    maxExecutionsPerHour: { type: Number, default: 20 },
    maxSimulationsPerHour: { type: Number, default: 40 },
    maxConcurrentSteps: { type: Number, default: 3 },
  },

  {
    timestamps: true,
  },
);

export const AIPolicy = model<IAIPolicy>("AIPolicy", schema);
