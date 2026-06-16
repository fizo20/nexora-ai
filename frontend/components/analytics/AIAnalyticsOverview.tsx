// frontend/components/analytics/AIAnalyticsOverview.tsx
"use client";

import { useAIAnalytics } from "@/hooks/useAIAnalytics";

export default function AIAnalyticsOverview() {
  const { data, isLoading } = useAIAnalytics();

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6">
        Loading AI analytics...
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard title="AI Executions" value={data.totals.totalExecutions} />

      <MetricCard
        title="Success Rate"
        value={`${data.performance.successRate}%`}
      />

      <MetricCard
        title="Failure Rate"
        value={`${data.performance.failureRate}%`}
      />

      <MetricCard
        title="Productivity Score"
        value={`${data.performance.productivityScore}`}
      />
    </div>
  );
}

function MetricCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="text-sm text-muted-foreground">{title}</div>

      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}
