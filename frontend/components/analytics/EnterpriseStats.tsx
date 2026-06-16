// frontend/components/analytics/EnterpriseStats.tsx
"use client";

import { useWorkspaceMetrics } from "@/hooks/useWorkspaceMetrics";

export default function EnterpriseStats() {
  const { data, loading } = useWorkspaceMetrics();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl border animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const totalTasks = data.taskStats.reduce((acc, item) => acc + item.count, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="rounded-2xl border p-5">
        <p className="text-sm text-muted-foreground">AI Calls</p>

        <h2 className="text-3xl font-bold mt-2">{data.aiCallsLast30Days}</h2>
      </div>

      <div className="rounded-2xl border p-5">
        <p className="text-sm text-muted-foreground">Workspace Seats</p>

        <h2 className="text-3xl font-bold mt-2">{data.seats.total}</h2>
      </div>

      <div className="rounded-2xl border p-5">
        <p className="text-sm text-muted-foreground">Projects</p>

        <h2 className="text-3xl font-bold mt-2">{data.projects}</h2>
      </div>

      <div className="rounded-2xl border p-5">
        <p className="text-sm text-muted-foreground">Tasks</p>

        <h2 className="text-3xl font-bold mt-2">{totalTasks}</h2>
      </div>
    </div>
  );
}
