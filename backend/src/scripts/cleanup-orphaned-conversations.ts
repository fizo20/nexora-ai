// src/scripts/cleanup-orphaned-conversations.ts
import "../config/env";
import { connectDatabase } from "../config/database";
import { AIConversation } from "../models/ai-conversation.model";
import { AIChatMessage } from "../models/ai-chat.model";

async function cleanupOrphanedConversations(workspaceId?: string) {
  const filter = workspaceId ? { workspaceId } : {};
  const conversations = await AIConversation.find(filter);

  let deleted = 0;

  for (const convo of conversations) {
    const hasMessages = await AIChatMessage.exists({
      conversationId: convo._id,
    });

    if (!hasMessages) {
      await AIConversation.deleteOne({ _id: convo._id });
      deleted++;
      console.log(`Deleted orphaned conversation ${convo._id}`);
    }
  }

  console.log(`Done. Deleted ${deleted} orphaned conversation(s).`);
}

async function main() {
  await connectDatabase();

  // Pass a workspaceId as a CLI arg, or omit to clean all workspaces
  const workspaceId = process.argv[2];

  await cleanupOrphanedConversations(workspaceId);

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
