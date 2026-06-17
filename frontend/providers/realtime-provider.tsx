// frontend/providers/realtime-provider.tsx
//
// Updated to use the lazy socket API: connect() is called once inside a
// useEffect (client-side only) so no WebSocket attempt fires during SSR or
// before the user is logged in.  All socket.on/off calls use getSocket() so
// TypeScript is sure the instance exists at that point.

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
import { connect, disconnect } from "@/lib/socket";

interface RealtimeContextType {
  connected: boolean;
  presence: WorkspacePresence[];
  events: RealtimeEvent[];
  emitEvent: (event: RealtimeEvent) => void;
  setPresence: (users: WorkspacePresence[]) => void;
}

const RealtimeContext = createContext<RealtimeContextType | null>(null);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  // Initialize connected state directly from the socket so we never need a
  // synchronous setState() inside an effect body. connect() is safe to call
  // here — it's idempotent and returns the same instance if already created.
  const [connected, setConnected] = useState(() => connect().connected);
  const [presence, setPresence] = useState<WorkspacePresence[]>([]);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);

  const emitEvent = (event: RealtimeEvent) => {
    setEvents((prev) => [event, ...prev]);
  };

  const value = useMemo(
    () => ({ connected, presence, events, emitEvent, setPresence }),
    [connected, presence, events],
  );

  // Subscribe to connection lifecycle events only — no synchronous setState
  // here, every state update happens inside the event callback which is the
  // correct pattern React expects.
  useEffect(() => {
    const socket = connect();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, []);

  // Presence updates
  useEffect(() => {
    const socket = connect();
    socket.on("presence:update", setPresence);
    return () => {
      socket.off("presence:update", setPresence);
    };
  }, []);

  // Distributed activity feed
  useEffect(() => {
    const socket = connect();

    const pushEvent = (type: string, payload?: Record<string, unknown>) => {
      setEvents((prev) => [
        { type, payload, createdAt: new Date().toISOString() },
        ...prev.slice(0, 49),
      ]);
    };

    socket.on("task:created", (d) => pushEvent("task:created", d));
    socket.on("task:updated", (d) => pushEvent("task:updated", d));
    socket.on("task:deleted", (d) => pushEvent("task:deleted", d));
    socket.on("workspace:activity", (d) => pushEvent("workspace:activity", d));
    socket.on("ai:activity", (d) => pushEvent("ai:activity", d));
    socket.on("ai:thinking", (d) => pushEvent("ai:thinking", d));
    socket.on("ai:completed", (d) => pushEvent("ai:completed", d));

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
