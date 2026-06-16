// backend/src/socket/presence.gateway.ts
import { getIO } from "./socket.server";

export function emitPresenceUpdate(workspaceId: string, users: any[]) {
  getIO().to(`workspace:${workspaceId}`).emit("presence:update", users);
}

export function emitUserJoined(workspaceId: string, userId: string) {
  getIO().to(`workspace:${workspaceId}`).emit("presence:user-joined", {
    userId,
    timestamp: new Date(),
  });
}

export function emitUserLeft(workspaceId: string, userId: string) {
  getIO().to(`workspace:${workspaceId}`).emit("presence:user-left", {
    userId,
    timestamp: new Date(),
  });
}
