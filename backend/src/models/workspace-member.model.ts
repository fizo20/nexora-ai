// src/models/workspace-member.model.ts
import { Schema, model, Types, Document } from "mongoose";

/**
 * WorkspaceMember document interface
 * This defines a user's participation inside a workspace
 */
export interface IWorkspaceMember extends Document {
  user: Types.ObjectId;
  workspace: Types.ObjectId;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
  status: "INVITED" | "ACTIVE" | "REMOVED";
  invitedBy?: Types.ObjectId;
  joinedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * WorkspaceMember schema
 * This is the CORE authorization table in Nexora
 */
const workspaceMemberSchema = new Schema<IWorkspaceMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    role: {
      type: String,
      enum: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
      required: true,
    },

    status: {
      type: String,
      enum: ["INVITED", "ACTIVE", "REMOVED"],
      default: "INVITED",
    },

    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    joinedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

/**
 * Prevent the same user from joining the same workspace twice
 */
workspaceMemberSchema.index({ user: 1, workspace: 1 }, { unique: true });

/**
 * WorkspaceMember model
 */
export const WorkspaceMember = model<IWorkspaceMember>(
  "WorkspaceMember",
  workspaceMemberSchema,
);
