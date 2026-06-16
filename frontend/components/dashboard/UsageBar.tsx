// frontend/components/dashboard/UsageBar.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

export default function UsageBar() {
  const [data, setData] = useState<{
    usage: number;
    limit: number;
    percentage: number;
    plan: string;
  } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient("/api/billing/usage");
        setData(res);
      } catch {
        setData(null);
      }
    }
    load();
  }, []);

  if (!data) return null;

  const isWarning = data.percentage > 60 && data.percentage <= 80;
  const isDanger = data.percentage > 80;

  return (
    <div className="p-4 rounded-lg border bg-card">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[13px] font-medium text-foreground">
          {data.plan === "FREE" ? "Free Trial" : data.plan} Usage
        </span>
        <span className="text-[13px] text-muted-foreground tabular-nums">
          {data.usage} / {data.limit}
        </span>
      </div>

      {/* Track */}
      <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isDanger
              ? "bg-destructive"
              : isWarning
              ? "bg-warning"
              : "bg-primary"
          }`}
          style={{ width: `${Math.min(data.percentage, 100)}%` }}
        />
      </div>

      {isWarning && (
        <p className="text-[12px] text-warning mt-2">
          Approaching your limit — {data.percentage}% used
        </p>
      )}

      {isDanger && (
        <p className="text-[12px] text-destructive mt-2">
          {data.percentage}% used — upgrade to avoid interruptions
        </p>
      )}
    </div>
  );
}
