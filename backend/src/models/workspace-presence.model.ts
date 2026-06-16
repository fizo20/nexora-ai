import mongoose from "mongoose";

const WorkspacePresenceSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: String,
      required: true,
    },

    userId: {
      type: String,
      required: true,
    },

    socketId: {
      type: String,
      required: true,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

export const WorkspacePresence = mongoose.model(
  "WorkspacePresence",
  WorkspacePresenceSchema,
);
