// src/services/ai-conversation.service.ts
import { AIConversation } from "../models/ai-conversation.model";

export const createConversation = async (data: {
  workspaceId: string;
  projectId?: string;
  userId: string;
}) => {
  return AIConversation.create({
    workspaceId: data.workspaceId,
    projectId: data.projectId,
    userId: data.userId,
  });
};

export const getUserConversations = async (
  workspaceId: string,
  userId: string,
) => {
  return AIConversation.find({
    workspaceId,
    userId,
    status: "active",
  })
    .sort({ lastMessageAt: -1 })
    .lean();
};
