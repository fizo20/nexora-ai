// frontend/types/realtime.ts

export type PresenceStatus = "online" | "offline" | "away";

export interface WorkspacePresence {
  userId: string;

  name: string;

  avatar?: string;

  status: PresenceStatus;

  lastSeen?: string;
}

export interface RealtimeEvent<T = unknown> {
  type: string;

  payload?: T;

  createdAt: string;
}
