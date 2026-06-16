// frontend/components/analytics/UsageBreakdown.tsx
"use client";

import { useWorkspaceMetrics } from "@/hooks/useWorkspaceMetrics";

import AnalyticsCard from "./AnalyticsCard";

export default function UsageBreakdown() {
  const { data } = useWorkspaceMetrics();

  if (!data) return null;

  return (
    <AnalyticsCard title="Usage By Feature">
      <div className="space-y-4">
        {data.usageByFeature.map((item) => (
          <div key={item._id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{item._id}</span>

              <span>{item.totalUnits}</span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-blue-600"
                style={{
                  width: `${Math.min(item.totalUnits, 100)}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}
