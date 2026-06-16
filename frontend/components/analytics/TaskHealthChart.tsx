// frontend/components/analytics/TaskHealthChart.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import AnalyticsCard from "./AnalyticsCard";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Same CSS fix as TaskChart — explicit minHeight on the wrapper eliminates
// the Recharts dimension warning without any effect-based state.
//
// The data fetch useEffect is kept as-is: setState is called inside the
// async callback (not synchronously in the effect body), which is the
// correct pattern the linter is looking for.

type ChartData = {
  name: string;
  value: number;
};

export default function TaskHealthChart() {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient("/api/analytics");

        // FIX (from previous session): was res?.tasks — tasks lives inside res.workspace
        const stats = res?.workspace?.tasks;

        if (!stats) return;

        setData([
          { name: "Total", value: stats.total || 0 },
          { name: "Completed", value: stats.completed || 0 },
          { name: "Overdue", value: stats.overdue || 0 },
        ]);
      } catch {
        setData([]);
      }
    }

    load();
  }, []);

  return (
    <AnalyticsCard title="Task Breakdown">
      {/* minHeight guarantees Recharts always measures a positive dimension */}
      <div style={{ width: "100%", minHeight: 250, height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
