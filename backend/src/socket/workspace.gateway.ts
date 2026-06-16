// backend/src/socket/workspace.gateway.ts

import { getIO } from "./socket.server";

export function joinWorkspace(socketId: string, workspaceId: string) {
  const io = getIO();

  const socket = io.sockets.sockets.get(socketId);

  if (!socket) return;

  socket.join(`workspace:${workspaceId}`);
}

export function leaveWorkspace(socketId: string, workspaceId: string) {
  const io = getIO();

  const socket = io.sockets.sockets.get(socketId);

  if (!socket) return;

  socket.leave(`workspace:${workspaceId}`);
}
