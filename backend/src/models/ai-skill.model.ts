// src/models/ai-skill.model.ts
import { Schema, model } from "mongoose";

const AISkillSchema = new Schema({
  name: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    default: "No description",
  },

  workspaceId: {
    type: String,
    required: true,
  },

  triggers: {
    type: [String],
    default: [],
  },

  steps: {
    type: [Schema.Types.Mixed],
    required: true,
  },

  successRate: {
    type: Number,
    default: 1,
  },

  usageCount: {
    type: Number,
    default: 0,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const AISkillModel = model("AISkill", AISkillSchema);
