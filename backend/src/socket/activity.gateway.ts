// backend/src/socket/activity.gateway.ts
import { getIO } from "./socket.server";

export function emitActivity(workspaceId: string, activity: any) {
  getIO().to(`workspace:${workspaceId}`).emit("workspace:activity", activity);
}
