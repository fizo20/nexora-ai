// src/models/ai-execution-memory.model.ts
import { Schema, model } from "mongoose";
import { error } from "node:console";

const AIExecutionMemorySchema = new Schema({
  workspaceId: {
    type: String,
    required: true,
  },

  projectId: {
    type: String,
    required: true,
  },

  executionId: {
    type: String,
    required: true,
  },

  errorMessage: {
    type: String,
  },

  stepIndex: {
    type: Number,
    required: true,
  },

  actionType: {
    type: String,
    required: true,
  },

  stepError: {
    type: String,
  },

  payload: {
    type: Schema.Types.Mixed,
  },

  healingDecision: {
    type: String,
  },

  outcome: {
    type: String, // "success" | "failed" | "skipped"
  },

  duration: {
    type: Number,
  },

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export const AIExecutionMemory = model(
  "AIExecutionMemory",
  AIExecutionMemorySchema,
);
