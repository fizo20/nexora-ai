// frontend/hooks/useWorkspacePresence.ts
import { useEffect, useState } from "react";
import { socket } from "@/lib/socket";

import { WorkspacePresence } from "@/types/realtime";

export function useWorkspacePresence(workspaceId: string, userId: string) {
  const [users, setUsers] = useState<WorkspacePresence[]>([]);

  useEffect(() => {
    socket.emit("workspace:join", {
      workspaceId,
      userId,
    });

    socket.on("presence:update", setUsers);

    return () => {
      socket.emit("workspace:leave", {
        workspaceId,
        userId,
      });

      socket.off("presence:update", setUsers);
    };
  }, [workspaceId, userId]);

  return users;
}
