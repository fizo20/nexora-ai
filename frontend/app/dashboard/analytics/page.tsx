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

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function AnalyticsPage() {
  const [range, setRange] = useState<RangeType>("7d");

  const handleExport = () => {
    window.open(`${API_URL}/api/analytics/export?range=${range}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Enterprise Analytics
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Workspace intelligence, AI telemetry, and operational insights
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(["7d", "30d", "90d"] as RangeType[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                range === r
                  ? "bg-primary text-primary-foreground"
                  : "border bg-background text-foreground hover:bg-muted"
              }`}
            >
              {r}
            </button>
          ))}
          <button
            onClick={handleExport}
            className="rounded-lg border bg-background px-3 py-1.5 text-[13px] font-medium text-foreground hover:bg-muted transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Metrics */}
      <WorkspaceMetricsGrid />
      <AIAnalyticsOverview />

      {/* Charts */}
      <EnterpriseStats />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <UsageChart range={range} />
          <TaskHealthChart />
        </div>
        <div className="space-y-5">
          <UpgradeInsights />
          <UsageBreakdown />
          <SeatAnalytics />
        </div>
      </div>
    </div>
  );
}
