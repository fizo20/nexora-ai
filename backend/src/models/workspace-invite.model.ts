// src/models/workspace-invite.model.ts
import { Schema, model, Types } from "mongoose";

export type InviteStatus = "pending" | "accepted" | "expired";

const workspaceInviteSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    workspaceId: {
      type: Types.ObjectId,
      ref: "Workspace",
      required: true,
    },

    role: {
      type: String,
      required: true,
    },

    invitedBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true },
);

export const WorkspaceInvite = model("WorkspaceInvite", workspaceInviteSchema);
