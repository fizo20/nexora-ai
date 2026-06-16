// src/models/ai-tool-metrics.model.ts
import { Schema, model } from "mongoose";

const AIToolMetricsSchema = new Schema({
  toolName: {
    type: String,
    required: true,
  },

  workspaceId: {
    type: String,
    required: true,
  },

  usageCount: {
    type: Number,
    default: 0,
  },

  successCount: {
    type: Number,
    default: 0,
  },

  failureCount: {
    type: Number,
    default: 0,
  },

  totalDuration: {
    type: Number,
    default: 0,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const AIToolMetrics = model("AIToolMetrics", AIToolMetricsSchema);
