// src/models/aiUsage.model.ts
import mongoose from "mongoose";

const aiUsageSchema = new mongoose.Schema(
  {
    workspaceId: { type: String, required: true },
    userId: { type: String, required: true },
    model: { type: String, required: true },
    endpoint: { type: String, required: true },
    promptLength: Number,
    responseLength: Number,
  },
  { timestamps: true },
);

export const AIUsage = mongoose.model("AIUsage", aiUsageSchema);
