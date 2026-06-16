// src/models/task.model.ts
import { Schema, model, Types, Document } from "mongoose";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";

export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface ITask extends Document {
  workspaceId: Types.ObjectId;
  projectId: Types.ObjectId;

  title: string;
  description?: string;

  status: TaskStatus;
  priority: TaskPriority;

  assignee?: Types.ObjectId;

  dueDate?: Date;

  estimatedHours?: number;
  actualHours?: number;

  tags?: string[];

  /**
   * AI metadata (future use)
   */
  aiTags?: string[];
  aiSummary?: string;

  /**
   * AI helpers
   */
  aiRiskScore?: number;
  aiSuggestedPriority?: TaskPriority;

  createdBy: Types.ObjectId;

  deletedAt?: Date | null;

  createdAt: Date;
  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
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

    title: { type: String, required: true, trim: true },

    description: { type: String },

    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"],
      default: "TODO",
      required: true,
      index: true,
    },

    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
      default: "MEDIUM",
      index: true,
    },

    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },

    dueDate: {
      type: Date,
      index: true,
    },

    /**
     * AI support fields
     */
    aiTags: [String],
    aiSummary: String,

    estimatedHours: Number,
    actualHours: Number,

    tags: [String],

    aiRiskScore: Number,
    aiSuggestedPriority: String,

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Task = model<ITask>("Task", taskSchema);
