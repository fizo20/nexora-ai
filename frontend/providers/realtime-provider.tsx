// frontend/providers/realtime-provider.tsx
"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
  useEffect,
} from "react";

import { RealtimeEvent, WorkspacePresence } from "@/types/realtime";
import { socket } from "@/lib/socket";

interface RealtimeContextType {
  connected: boolean;

  presence: WorkspacePresence[];

  events: RealtimeEvent[];

  emitEvent: (event: RealtimeEvent) => void;

  setPresence: (users: WorkspacePresence[]) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const [connected, setConnected] = useState(socket.connected);

  const [presence, setPresence] = useState<WorkspacePresence[]>([]);

  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const emitEvent = (event: RealtimeEvent) => {
    setEvents((prev) => [event, ...prev]);
  };

  const value = useMemo(
    () => ({
      connected,
      presence,
      events,
      emitEvent,
      setPresence,
    }),
    [connected, presence, events],
  );

  // Socket Connection Status
  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Presence Updates
  useEffect(() => {
    socket.on("presence:update", setPresence);

    return () => {
      socket.off("presence:update", setPresence);
    };
  }, []);

  
// Distributed Activity Feed
useEffect(() => {
  const pushEvent = (
    type: string,
    payload?: Record<string, unknown>,
  ) => {
    setEvents((prev) => [
      {
        type,
        payload,
        createdAt: new Date().toISOString(),
      },

      ...prev.slice(0, 49),
    ]);
  };

  socket.on("task:created", (data) =>
    pushEvent("task:created", data),
  );

  socket.on("task:updated", (data) =>
    pushEvent("task:updated", data),
  );

  socket.on("task:deleted", (data) =>
    pushEvent("task:deleted", data),
  );

  socket.on("workspace:activity", (data) =>
    pushEvent("workspace:activity", data),
  );

  socket.on("ai:activity", (data) =>
    pushEvent("ai:activity", data),
  );

  socket.on("ai:thinking", (data) =>
    pushEvent("ai:thinking", data),
  );

  socket.on("ai:completed", (data) =>
    pushEvent("ai:completed", data),
  );

  return () => {
    socket.off("task:created");
    socket.off("task:updated");
    socket.off("task:deleted");

    socket.off("workspace:activity");

    socket.off("ai:activity");
    socket.off("ai:thinking");
    socket.off("ai:completed");
  };
}, []);

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const context = useContext(RealtimeContext);

  if (!context) {
    throw new Error("useRealtime must be used inside RealtimeProvider");
  }

  return context;
}
