// frontend/components/analytics/WorkspaceMetricsGrid.tsx
"use client";

import { useEffect, useState } from "react";

import MetricCard from "./MetricCard";

import { getWorkspaceMetrics } from "@/lib/api/analytics";

import { WorkspaceMetricsResponse } from "@/types/analytics";

export default function WorkspaceMetricsGrid() {
  const [data, setData] = useState<WorkspaceMetricsResponse | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const metrics = await getWorkspaceMetrics();

        setData(metrics);
      } catch {
        setData(null);
      }
    }

    load();
  }, []);

  if (!data) return null;

  const completedTasks =
    data.taskStats.find((task) => task._id === "DONE")?.count || 0;

  const totalTasks = data.taskStats.reduce((acc, task) => acc + task.count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard
        title="AI Calls (30d)"
        value={data.aiCallsLast30Days}
        description="AI executions in last 30 days"
      />

      <MetricCard
        title="Workspace Members"
        value={data.seats.total}
        description={`${data.seats.pendingInvites} pending invites`}
      />

      <MetricCard
        title="Projects"
        value={data.projects}
        description="Active workspace projects"
      />

      <MetricCard
        title="Completed Tasks"
        value={`${completedTasks}/${totalTasks}`}
        description="Workspace task completion"
      />
    </div>
  );
}
