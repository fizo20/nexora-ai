// src/models/project.model.ts
import { Schema, model, Types, Document } from "mongoose";

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED";

export interface IProject extends Document {
  workspaceId: Types.ObjectId;

  name: string;
  description?: string;

  status: ProjectStatus;

  members: Types.ObjectId[]; // users

  createdBy: Types.ObjectId;

  dueDate?: Date;

  /**
   * AI helpers
   */
  aiSummary?: string;
  aiLastAnalyzedAt?: Date;

  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
      index: true,
    },

    name: { type: String, required: true, trim: true },

    description: { type: String },

    status: {
      type: String,
      enum: ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED"],
      default: "PLANNING",
      index: true,
    },

    members: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    dueDate: Date,

    aiSummary: String,
    aiLastAnalyzedAt: Date,

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Project = model<IProject>("Project", projectSchema);
