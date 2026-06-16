// frontend/types/activity.ts

export type ActivityType = "AUDIT" | "AI" | "SECURITY" | "BILLING" | "TEAM";

export interface ActivityEvent {
  id: string;

  type: ActivityType;

  title: string;

  description?: string;

  createdAt: string;

  metadata?: Record<string, unknown>;
}
