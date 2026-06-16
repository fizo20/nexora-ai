// src/scripts/migrate-chat.ts
// This script migrates existing AIChatMessage documents to link them to a new AIConversation document.
import mongoose from "mongoose";
import { AIChatMessage } from "../models/ai-chat.model";
import { AIConversation } from "../models/ai-conversation.model";

async function migrate() {
  await mongoose.connect(process.env.MONGO_URI!);

  const messages = await AIChatMessage.find();

  const map = new Map<string, any>();

  for (const msg of messages) {
    const key = `${msg.workspaceId}-${msg.projectId}-${msg.userId}`;

    if (!map.has(key)) {
      const convo = await AIConversation.create({
        workspaceId: msg.workspaceId,
        projectId: msg.projectId,
        userId: msg.userId,
      });

      map.set(key, convo._id);
    }

    msg.conversationId = map.get(key);
    await msg.save();
  }

  console.log("✅ Migration complete");
  process.exit(0);
}

migrate();
