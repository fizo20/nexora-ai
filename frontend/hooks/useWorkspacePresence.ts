// frontend/hooks/useWorkspacePresence.ts
//
// Updated to use the lazy socket API (connect()) instead of the old
// module-level `socket` named export which no longer exists.
// connect() is idempotent — calling it multiple times returns the same
// instance, so this hook is safe to use in multiple components.

import { useEffect, useState } from "react";
import { connect } from "@/lib/socket";

import { WorkspacePresence } from "@/types/realtime";

export function useWorkspacePresence(workspaceId: string, userId: string) {
  const [users, setUsers] = useState<WorkspacePresence[]>([]);

  useEffect(() => {
    const socket = connect();

    socket.emit("workspace:join", { workspaceId, userId });
    socket.on("presence:update", setUsers);

    return () => {
      socket.emit("workspace:leave", { workspaceId, userId });
      socket.off("presence:update", setUsers);
    };
  }, [workspaceId, userId]);

  return users;
}
