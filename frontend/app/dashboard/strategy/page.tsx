// frontend/app/dashboard/strategy/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

type Strategy = {
  efficiency?: number;
  risk?: string;
  recommendations?: number;
};

export default function StrategyPage() {
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const res = await apiClient("/api/ai/strategy");
        setStrategy(res.data);
      } catch (err) {
        console.error("Strategy fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStrategy();
  }, []);

  const cards = [
    { label: "Efficiency Score", value: strategy?.efficiency ?? "--" },
    { label: "Risk Level", value: strategy?.risk ?? "--" },
    { label: "AI Recommendations", value: strategy?.recommendations ?? "--" },
  ];

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          AI Strategy Insights
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Workspace intelligence and risk analysis
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map(({ label, value }) => (
          <div key={label} className="rounded-lg border bg-card p-5">
            <p className="text-[12px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
              {label}
            </p>
            {loading ? (
              <div className="h-8 bg-muted rounded animate-pulse" />
            ) : (
              <p className="text-2xl font-semibold text-foreground tabular-nums">
                {value}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
