// src/models/ai-rollback-log.model.ts
import { Schema, model, Types } from "mongoose";

const schema = new Schema(
  {
    workspaceId: { type: Schema.Types.ObjectId, required: true },
    projectId: { type: Schema.Types.ObjectId, required: true },
    planId: { type: Schema.Types.ObjectId },

    stepId: String,
    undoType: String,

    success: Boolean,
    error: String,
  },
  { timestamps: true },
);

export const AIRollbackLog = model("AIRollbackLog", schema);
