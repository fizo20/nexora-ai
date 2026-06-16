// src/models/ai-activity.model.ts
// AIActivity model to log all AI interactions in the system for auditing and analytics purposes.
import { Schema, model, Types, Document } from "mongoose";

export interface IAIActivity extends Document {
  workspaceId: Types.ObjectId;
  projectId: Types.ObjectId;

  type: string; // create_task, update_status, etc
  message: string;

  metadata?: any;

  createdAt: Date;
}

const aiActivitySchema = new Schema<IAIActivity>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  { timestamps: true },
);

export const AIActivity = model<IAIActivity>("AIActivity", aiActivitySchema);
