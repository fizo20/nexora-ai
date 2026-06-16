// src/models/ai-usage-window.model.ts
import { Schema, model, Types } from "mongoose";

export interface IAIUsageWindow {
  workspaceId: Types.ObjectId;
  windowStart: Date;

  plans: number;
  executions: number;
  simulations: number;
}

const schema = new Schema<IAIUsageWindow>({
  workspaceId: { type: Schema.Types.ObjectId, index: true },
  windowStart: { type: Date, index: true },

  plans: { type: Number, default: 0 },
  executions: { type: Number, default: 0 },
  simulations: { type: Number, default: 0 },
});

schema.index({ workspaceId: 1, windowStart: 1 });

export const AIUsageWindow = model<IAIUsageWindow>("AIUsageWindow", schema);
