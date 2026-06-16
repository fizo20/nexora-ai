// backend/src/models/ai-agent-execution.model.ts
import mongoose from "mongoose";

const aiAgentExecutionSchema = new mongoose.Schema(
  {
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

    agentType: {
      type: String,
      required: true,
      enum: ["planning", "tasks", "analytics", "notifications", "general"],
    },

    success: {
      type: Boolean,
      default: false,
    },

    totalSteps: {
      type: Number,
      default: 0,
    },

    completedSteps: {
      type: Number,
      default: 0,
    },

    failedSteps: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export const AIAgentExecution =
  mongoose.models.AIAgentExecution ||
  mongoose.model("AIAgentExecution", aiAgentExecutionSchema);
