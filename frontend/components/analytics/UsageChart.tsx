// frontend/components/analytics/UsageChart.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import AnalyticsCard from "./AnalyticsCard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

type RangeType = "7d" | "30d" | "90d";

type Props = {
  range: RangeType;
};

type ChartData = {
  date: string;
  total: number;
};

export default function UsageChart({ range }: Props) {
  const [data, setData] = useState<ChartData[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient(`/api/analytics?range=${range}`);

        const formatted =
          res?.usageTrend?.map(
            (item: { _id: { date: string }; total: number }) => ({
              date: item._id.date,
              total: item.total,
            }),
          ) || [];

        setData(formatted);
      } catch {
        setData([]);
      }
    }

    load();
  }, [range]);

  return (
    <AnalyticsCard title="AI Usage Trend">
      <div style={{ width: "100%", height: 250 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="date" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="total"
              stroke="#2563eb"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCard>
  );
}
