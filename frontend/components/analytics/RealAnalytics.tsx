// frontend/components/analytics/RealAnalytics.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

type AnalyticsData = {
  usage?: {
    total: number;
    limit: number;
    percentage: number;
  };
  tasks?: {
    total: number;
    completed: number;
    overdue: number;
  };
  plan: "FREE" | "PRO" | "ENTERPRISE";
};

export default function RealAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient("/api/analytics");
        setData(res);
      } catch {
        setData(null);
      }
    }
    load();
  }, []);

  if (!data) return null;

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-semibold text-foreground">Analytics Overview</h3>
        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground border uppercase tracking-wider">
          {data.plan}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-0.5">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Usage</p>
          <p className="text-xl font-semibold tabular-nums text-foreground">{data.usage?.percentage ?? 0}%</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Tasks</p>
          <p className="text-xl font-semibold tabular-nums text-foreground">{data.tasks?.total ?? 0}</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">Completed</p>
          <p className="text-xl font-semibold tabular-nums text-foreground">{data.tasks?.completed ?? 0}</p>
        </div>
      </div>

      {data.plan === "FREE" && (
        <div className="mt-4 pt-4 border-t flex items-center justify-between">
          <p className="text-[12px] text-muted-foreground">
            Unlock full analytics on Pro
          </p>
          <Link
            href="/dashboard/billing"
            className="text-[12px] font-medium text-primary flex items-center gap-1 hover:underline"
          >
            Upgrade <ArrowUpRight size={12} />
          </Link>
        </div>
      )}
    </div>
  );
}
