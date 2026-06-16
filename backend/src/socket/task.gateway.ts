// backend/src/socket/task.gateway.ts

import { getIO } from "./socket.server";

export function emitTaskCreated(workspaceId: string, task: any) {
  getIO().to(`workspace:${workspaceId}`).emit("task:created", task);
}

export function emitTaskUpdated(workspaceId: string, task: any) {
  getIO().to(`workspace:${workspaceId}`).emit("task:updated", task);
}

export function emitTaskDeleted(workspaceId: string, taskId: string) {
  getIO().to(`workspace:${workspaceId}`).emit("task:deleted", {
    taskId,
  });
}
