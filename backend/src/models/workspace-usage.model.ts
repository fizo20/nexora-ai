// src/models/workspace-usage.model.ts
import { Schema, model, Types, Document } from "mongoose";

/**
 * WorkspaceUsage
 * Stores billable usage events for metering & overage billing
 */
export interface IWorkspaceUsage extends Document {
  workspace: Types.ObjectId;
  feature: string;
  units: number;
  createdAt: Date;
}

const workspaceUsageSchema = new Schema<IWorkspaceUsage>(
  {
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    /**
     * Feature key being metered
     * example: api_calls, report_exports, storage_mb
     */
    feature: {
      type: String,
      required: true,
      index: true,
    },

    /**
     * Usage units consumed
     */
    units: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const WorkspaceUsage = model<IWorkspaceUsage>(
  "WorkspaceUsage",
  workspaceUsageSchema,
);
