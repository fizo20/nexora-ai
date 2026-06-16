// src/models/ai-chat.model.ts
import { Schema, model, Types, Document } from "mongoose";

export interface IAIChatMessage extends Document {
  conversationId: Types.ObjectId;

  workspaceId: Types.ObjectId;
  projectId?: Types.ObjectId;

  userId: Types.ObjectId;

  role: "user" | "assistant";

  message: string;

  metadata?: {
    toolName?: string;
    status?: "pending" | "done" | "error";
  };

  createdAt: Date;
}

const aiChatSchema = new Schema<IAIChatMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "AIConversation",
      required: true,
      index: true,
    },

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

    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    metadata: {
      toolName: String,
      status: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const AIChatMessage = model<IAIChatMessage>(
  "AIChatMessage",
  aiChatSchema,
);
