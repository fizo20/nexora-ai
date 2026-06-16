// src/models/workspace-rate-limit.model.ts
import { Schema, model, Types, Document } from "mongoose";

export interface IWorkspaceRateLimit extends Document {
  workspace: Types.ObjectId;
  key: string;
  count: number;
  windowStart: Date;
}

const schema = new Schema<IWorkspaceRateLimit>({
  workspace: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
    required: true,
    index: true,
  },

  key: {
    type: String,
    required: true,
    index: true,
  },

  count: {
    type: Number,
    default: 0,
  },

  windowStart: {
    type: Date,
    required: true,
  },
});

schema.index({ workspace: 1, key: 1 });

export const WorkspaceRateLimit = model<IWorkspaceRateLimit>(
  "WorkspaceRateLimit",
  schema,
);
