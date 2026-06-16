// backend/src/socket/ai.gateway.ts

import { getIO } from "./socket.server";

export function emitAIActivity(workspaceId: string, payload: any) {
  const io = getIO();
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit("ai:activity", payload);
}

export function emitAIThinking(workspaceId: string, message: string) {
  const io = getIO();
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit("ai:thinking", {
    message,
    timestamp: new Date(),
  });
}

export function emitAICompleted(workspaceId: string, payload: any) {
  const io = getIO();
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit("ai:completed", payload);
}
