// socket/socket.server.ts
import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import {
  userConnected,
  userDisconnected,
  getWorkspaceOnlineUsers,
} from "../services/presence.service";

import {
  emitPresenceUpdate,
  emitUserJoined,
  emitUserLeft,
} from "./presence.gateway";
import { WorkspacePresence } from "../models/workspace-presence.model";

let io: Server;

export function initializeSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "*",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("🔌 Socket Connected:", socket.id);

    socket.on("workspace:join", async ({ workspaceId, userId }) => {
      socket.join(`workspace:${workspaceId}`);

      await userConnected(workspaceId, userId, socket.id);

      emitUserJoined(workspaceId, userId);

      const users = await getWorkspaceOnlineUsers(workspaceId);

      emitPresenceUpdate(workspaceId, users);
    });

    socket.on("workspace:leave", async ({ workspaceId, userId }) => {
      socket.leave(`workspace:${workspaceId}`);

      emitUserLeft(workspaceId, userId);
    });

    socket.on("disconnect", async () => {
      const presence = await WorkspacePresence.findOne({
        socketId: socket.id,
      });

      if (presence) {
        await userDisconnected(socket.id);

        emitUserLeft(presence.workspaceId, presence.userId);

        const users = await getWorkspaceOnlineUsers(presence.workspaceId);

        emitPresenceUpdate(presence.workspaceId, users);
      }

      console.log("❌ Socket Disconnected:", socket.id);
    });
  });

  return io;
}

export function getIO(): Server | null {
  if (!io) {
    console.warn("⚠️ Socket server not initialized — skipping emit");
    return null;
  }

  return io;
}
