// services/presence.service.ts
import { WorkspacePresence } from "../models/workspace-presence.model";
import { User } from "../models/user.model";

export async function userConnected(
  workspaceId: string,
  userId: string,
  socketId: string,
) {
  await WorkspacePresence.findOneAndUpdate(
    {
      workspaceId,
      userId,
      socketId,
    },
    {
      workspaceId,
      userId,
      socketId,
      lastSeen: new Date(),
    },
    {
      upsert: true,
      new: true,
    },
  );
}

export async function userDisconnected(socketId: string) {
  await WorkspacePresence.deleteOne({
    socketId,
  });
}

export async function getWorkspaceOnlineUsers(workspaceId: string) {
  const users = await WorkspacePresence.find({
    workspaceId,
  }).lean();

  const enriched = await Promise.all(
    users.map(async (presence: any) => {
      const user = await User.findById(presence.userId).lean();

      return {
        userId: presence.userId,

        name: user?.name || "Unknown User",

        email: user?.email || "",

        status: "online",

        lastSeen: presence.lastSeen,
      };
    }),
  );

  return enriched;
}
