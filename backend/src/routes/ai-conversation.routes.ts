// src/routes/ai-conversation.routes.ts
import express from "express";
import {
  getConversations,
  getConversationMessagesController,
  renameConversation,
  deleteConversation,
} from "../controllers/ai-conversation.controller";
import { requireAuth } from "../middlewares/auth.middleware";

const router = express.Router();

router.get("/", requireAuth, getConversations);
router.get("/:id/messages", requireAuth, getConversationMessagesController);

// 🔥 NEW
router.patch("/:id", requireAuth, renameConversation);
router.delete("/:id", requireAuth, deleteConversation);

export default router;
