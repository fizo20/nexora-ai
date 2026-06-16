// src/controllers/ai-conversation.controller.ts
import { Request, Response } from "express";
import { getUserConversations } from "../services/ai-conversation.service";
import { getConversationMessages } from "../services/ai-chat.service";
import { AIConversation } from "../models/ai-conversation.model";

export async function getConversations(req: Request, res: Response) {
  try {
    const auth = req.auth as any;
    console.log("AUTH DEBUG:", req.auth);

    // ✅ SAFETY CHECK (PREVENT 500)
    if (!auth || !auth.workspaceId || !auth.userId) {
      return res.status(401).json({
        success: false,
        error: "Unauthorized: Missing auth context",
      });
    }

    const data = await getUserConversations(auth.workspaceId, auth.userId);

    /*    return res.json({
      success: true,
      data,
    }); */

    return res.json(data);
  } catch (error: any) {
    console.error("GET CONVERSATIONS ERROR:", error);

    return res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch conversations",
    });
  }
}

export async function getConversationMessagesController(
  req: Request,
  res: Response,
) {
  try {
    const auth = req.auth as any;

    // ✅ SAFETY
    if (!auth || !auth.workspaceId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { id } = req.params;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({
        error: "Invalid conversationId",
      });
    }

    const messages = await getConversationMessages(id);

    return res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("GET MESSAGES ERROR:", error);

    return res.status(500).json({
      error: "Failed to load messages",
    });
  }
}

/* ===============================
   RENAME CONVERSATION
================================ */
export async function renameConversation(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        error: "Title is required",
      });
    }

    const updated = await AIConversation.findByIdAndUpdate(
      id,
      { title: title.trim() },
      { new: true },
    );

    return res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to rename conversation",
    });
  }
}

/* ===============================
   DELETE CONVERSATION (SOFT)
================================ */
export async function deleteConversation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await AIConversation.findByIdAndUpdate(id, {
      status: "archived",
    });

    return res.json({
      success: true,
    });
  } catch (error) {
    return res.status(500).json({
      error: "Failed to delete conversation",
    });
  }
}
