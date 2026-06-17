// src/socket/socket.server.ts
//
// BEFORE: cors.origin was set to "*" with credentials: true.
// With credentials, a wildcard origin is rejected by browsers — the browser
// requires an exact reflected origin when credentials are involved.
// This caused the WebSocket handshake to silently fail in some environments.
//
// AFTER: Mirror the same allowed-origin logic used by the Express CORS
// middleware so Socket.IO and HTTP requests behave identically.

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

// Re-use the same origin resolution as app.ts so there is a single source
// of truth. Import the helper if you extract it to a shared config file.
function buildAllowedOrigins(): string[] {
  const rawOrigins = process.env.CLIENT_URL ?? "";
  return [
    "http://localhost:3000",
    ...rawOrigins
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean),
  ];
}

export function initializeSocket(server: HttpServer) {
  const allowedOrigins = buildAllowedOrigins();

  io = new Server(server, {
    cors: {
      origin: (incomingOrigin, callback) => {
        if (!incomingOrigin) return callback(null, true);
        if (allowedOrigins.includes(incomingOrigin))
          return callback(null, true);
        console.warn(`[socket.io CORS] Rejected origin: ${incomingOrigin}`);
        callback(
          new Error(`Socket.IO CORS: origin '${incomingOrigin}' not allowed`),
        );
      },
      credentials: true,
      methods: ["GET", "POST"],
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
      const presence = await WorkspacePresence.findOne({ socketId: socket.id });
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
