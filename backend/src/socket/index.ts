// backend/src/socket/index.ts
import { Server } from "socket.io";

export function registerSocketHandlers(io: Server) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("workspace:join", (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
    });

    socket.on("project:join", (projectId: string) => {
      socket.join(`project:${projectId}`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
}
