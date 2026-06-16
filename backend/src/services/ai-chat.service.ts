// src/services/ai-chat.service.ts
import { AIChatMessage } from "../models/ai-chat.model";
import { AIConversation } from "../models/ai-conversation.model";

export const getConversationMessages = async (
  conversationId: string,
  limit = 50,
) => {
  return AIChatMessage.find({ conversationId })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
};

export const getRecentChatHistory = async (
  workspaceId: string,
  projectId?: string,
  limit = 10,
) => {
  const filter: any = { workspaceId };

  if (projectId) {
    filter.projectId = projectId;
  }

  const messages = await AIChatMessage.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return messages.reverse();
};

export const buildChatHistoryBlock = (
  messages: { role: string; message: string }[],
) => {
  if (!messages.length) return "";

  const lines = messages.map(
    (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.message}`,
  );

  return `Conversation so far:\n${lines.join("\n")}\n\n`;
};

export const storeChatTurn = async (data: {
  conversationId: string;
  workspaceId: string;
  projectId?: string;
  userId: string;
  role: "user" | "assistant";
  message: string;
  metadata?: any;
}) => {
  await AIChatMessage.create(data);

  // 🔥 update conversation timestamp
  await AIConversation.findByIdAndUpdate(data.conversationId, {
    lastMessageAt: new Date(),
  });
};
