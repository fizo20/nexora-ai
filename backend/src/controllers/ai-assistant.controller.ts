// src/controllers/ai-assistant.controller.ts

import { Request, Response } from "express";
import mongoose from "mongoose";

import { AuthPayload } from "../types/auth.types";
import { Project } from "../models/project.model";
import { AIConversation } from "../models/ai-conversation.model";

import { runAgentSupervisor } from "../services/ai-agent-supervisor.service";
import {
  storeChatTurn,
  getConversationMessages,
} from "../services/ai-chat.service";
import { createConversation } from "../services/ai-conversation.service";
import { logAIAudit } from "../services/ai-audit.service";

import { emitAICompleted } from "../socket/ai.gateway";

type AIMessage = {
  role: "user" | "assistant";
  content: string;
};

const generateSmartTitle = (input: string): string => {
  const cleaned = input.trim();

  if (cleaned.length <= 40) {
    return cleaned;
  }

  return cleaned.slice(0, 40) + "...";
};

export async function handleAIAssistant(req: Request, res: Response) {
  let convoId: string | undefined;

  try {
    const auth = req.auth as AuthPayload;

    if (!auth?.workspaceId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const workspaceId = auth.workspaceId;

    const { projectId, conversationId, messages } = req.body as {
      projectId: string;
      conversationId?: string;
      messages: AIMessage[];
    };

    if (!projectId || !Array.isArray(messages)) {
      return res.status(400).json({
        error: "projectId and messages required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({
        error: "Invalid projectId",
      });
    }

    const project = await Project.findOne({
      _id: projectId,
      workspaceId,
    });

    if (!project) {
      return res.status(404).json({
        error: "Project not found",
      });
    }

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
      return res.status(400).json({
        error: "Last message must be user",
      });
    }

    const goal = lastMessage.content;

    convoId = conversationId;
    let isNewConversation = false;

    // Create conversation
    if (!convoId) {
      const conversation = await createConversation({
        workspaceId,
        projectId,
        userId: auth.userId,
      });

      convoId = conversation._id.toString();
      isNewConversation = true;
    }

    // Save user message
    await storeChatTurn({
      conversationId: convoId,
      workspaceId,
      projectId,
      userId: auth.userId,
      role: "user",
      message: goal,
    });

    await AIConversation.findByIdAndUpdate(convoId, {
      lastMessageAt: new Date(),
    });

    // Auto-title only once
    if (isNewConversation) {
      await AIConversation.findByIdAndUpdate(convoId, {
        title: generateSmartTitle(goal),
      });
    }

    // SSE headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const send = (data: unknown) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const onToolEvent = (event: any) => {
      send({
        type: "tool",
        name: event.name,
        status: event.status,
        data: event.data ?? null,
      });
    };

    send({
      type: "start",
    });

    send({
      type: "thinking",
      message: "Analyzing your request...",
    });

    // Run AI supervisor
    const result = await runAgentSupervisor({
      workspaceId,
      projectId,
      userId: auth.userId,
      goal,
      messages,
      onToolEvent,
    });

    // 🔧 Never let a socket/notification failure break the chat response.
    try {
      emitAICompleted(workspaceId, {
        conversationId: convoId,
        result,
      });
    } catch (err) {
      console.warn("⚠️ emitAICompleted failed (non-fatal):", err);
    }

    const reply: string = result || "Action completed successfully.";

    const [mainResponse, reasoningPart] = reply.split("💡 Reasoning:");

    const cleanReply = mainResponse?.trim() || "Done";

    await logAIAudit({
      workspaceId,
      userId: auth.userId,
      action: "CHAT",
      endpoint: "/api/ai/assistant",
      prompt: goal,
      output: cleanReply,
    });

    // Stream assistant reply
    send({
      type: "chunk",
      content: cleanReply,
    });

    // Optional reasoning
    if (reasoningPart) {
      send({
        type: "reasoning",
        content: reasoningPart.trim(),
      });
    }

    // Save assistant message
    await storeChatTurn({
      conversationId: convoId,
      workspaceId,
      projectId,
      userId: auth.userId,
      role: "assistant",
      message: cleanReply,
    });

    await AIConversation.findByIdAndUpdate(convoId, {
      lastMessageAt: new Date(),
    });

    send({
      type: "done",
      conversationId: convoId,
    });

    res.end();
  } catch (error: any) {
    // 🔍 Log the full error object (stack included) — this is the
    // single most important diagnostic line in this controller.
    // Previously the frontend only ever saw a generic message with
    // zero trace of the actual failure in the server console.
    console.error("❌ AI Assistant Error (full):", error);
    console.error("❌ AI Assistant Error message:", error?.message);
    console.error("❌ AI Assistant Error stack:", error?.stack);

    if (!res.headersSent) {
      return res.status(500).json({
        error: "Internal error",
        // Only leak the raw message outside production so local/staging
        // debugging is fast, without exposing internals to real users.
        ...(process.env.NODE_ENV !== "production" && {
          detail: error?.message,
        }),
      });
    }

    const userFacingMessage =
      process.env.NODE_ENV !== "production"
        ? `I ran into a problem completing that request: ${error?.message || "Unknown error"}`
        : "I ran into a problem completing that request. Please try again.";

    res.write(
      `data: ${JSON.stringify({
        type: "error",
        message: userFacingMessage,
      })}\n\n`,
    );

    // 🔧 NEW: still send `done` with the conversationId so the
    // frontend doesn't lose track of it and spawn a duplicate
    // blank conversation on the next message.
    if (typeof convoId !== "undefined") {
      res.write(
        `data: ${JSON.stringify({
          type: "done",
          conversationId: convoId,
        })}\n\n`,
      );
    }

    res.end();
  }
}

// =======================================
// HISTORY
// =======================================

export async function getAssistantHistory(req: Request, res: Response) {
  try {
    const { conversationId } = req.query;

    if (!conversationId) {
      return res.status(400).json({
        error: "conversationId required",
      });
    }

    const messages = await getConversationMessages(conversationId as string);

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to load history",
    });
  }
}
