// frontend/app/dashboard/settings/audit/page.tsx
"use client";

import AuditCard from "@/components/audit/AuditCard";

import { useWorkspaceAudit } from "@/lib/react-query/audit/use-workspace-audit";

import { AuditLog } from "@/types/audit";

export default function AuditPage() {
  const { data, isLoading } = useWorkspaceAudit();

  const logs: AuditLog[] = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Workspace Audit Logs</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Monitor all workspace activity
        </p>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Loading audit logs...
          </div>
        )}

        {!isLoading && logs.length === 0 && (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            No audit logs found
          </div>
        )}

        {logs.map((log) => (
          <AuditCard
            key={log._id}
            title={log.action}
            description={log.entityType}
            timestamp={log.createdAt}
            metadata={log.metadata}
          />
        ))}
      </div>
    </div>
  );
}
