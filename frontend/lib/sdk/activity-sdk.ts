// frontend/lib/sdk/activity-sdk.ts

import { auditSdk } from "./audit-sdk";

import { ActivityEvent } from "@/types/activity";

export const activitySdk = {
  async getActivityTimeline(): Promise<ActivityEvent[]> {
    const [auditLogs, aiLogs] = await Promise.all([
      auditSdk.getWorkspaceAuditLogs(),
      auditSdk.getAIAuditLogs(),
    ]);

    const workspaceEvents: ActivityEvent[] = Array.isArray(auditLogs)
      ? auditLogs.map((log) => ({
          id: log._id,

          type: "AUDIT",

          title: log.action,

          description: log.entityType,

          createdAt: log.createdAt,

          metadata: log.metadata,
        }))
      : [];

    const aiEvents: ActivityEvent[] = Array.isArray(aiLogs)
      ? aiLogs.map((log) => ({
          id: log._id,

          type: "AI",

          title: log.action,

          description: `${log.aiModel} • $${log.cost.toFixed(4)}`,

          createdAt: log.createdAt,
        }))
      : [];

    return [...workspaceEvents, ...aiEvents].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },
};
