// src/models/ai-conversation.model.ts
import { Schema, model, Types, Document } from "mongoose";

export interface IAIConversation extends Document {
  workspaceId: Types.ObjectId;
  projectId?: Types.ObjectId;

  userId: Types.ObjectId;

  title?: string;

  status: "active" | "archived";

  lastMessageAt: Date;

  createdAt: Date;
  updatedAt: Date;
}

const aiConversationSchema = new Schema<IAIConversation>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    projectId: {
      type: Schema.Types.ObjectId,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },

    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "archived"],
      default: "active",
    },

    lastMessageAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const AIConversation = model<IAIConversation>(
  "AIConversation",
  aiConversationSchema,
);
