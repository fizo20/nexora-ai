// frontend/app/dashboard/analytics/page.tsx
"use client";

import { useState } from "react";

import UsageChart from "@/components/analytics/UsageChart";
import TaskHealthChart from "@/components/analytics/TaskHealthChart";
import UpgradeInsights from "@/components/analytics/UpgradeInsights";
import WorkspaceMetricsGrid from "@/components/analytics/WorkspaceMetricsGrid";
import { RangeType } from "@/types/analytics";
import AIAnalyticsOverview from "@/components/analytics/AIAnalyticsOverview";
import EnterpriseStats from "@/components/analytics/EnterpriseStats";
import UsageBreakdown from "@/components/analytics/UsageBreakdown";
import SeatAnalytics from "@/components/analytics/SeatAnalytics";

// Removed: AIActivityTimeline — moved to its own page at /dashboard/ai-activity

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeType>("7d");

  const handleExport = () => {
    window.open(
      `http://localhost:4000/api/analytics/export?range=${range}`,
      "_blank",
    );
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Analytics</h1>

          <p className="text-sm text-muted-foreground">
            Workspace intelligence, AI telemetry, and operational insights
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {["7d", "30d", "90d"].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r as RangeType)}
              className={`rounded-lg px-4 py-2 text-sm transition ${
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background hover:bg-muted"
              }`}
            >
              {r}
            </button>
          ))}

          <button
            onClick={handleExport}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm text-white"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* METRICS */}
      <WorkspaceMetricsGrid />

      <AIAnalyticsOverview />

      {/* CHARTS */}
      <>
        <EnterpriseStats />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <UsageChart range={range} />

            <TaskHealthChart />
          </div>

          <div className="space-y-6">
            <UpgradeInsights />

            <UsageBreakdown />

            <SeatAnalytics />
          </div>
        </div>
      </>
    </div>
  );
}
