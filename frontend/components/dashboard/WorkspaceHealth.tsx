// frontend/components/dashboard/WorkspaceHealth.tsx
"use client";

import { useEffect, useState } from "react";
import StatsCard from "./StatsCard";
import { apiClient } from "@/lib/api/client";
import { Sparkles } from "lucide-react";

interface StrategyData {
  riskLevel: string;
  blockedTasks: number;
  overdueTasks: number;
  recommendations: string[];
}

export default function WorkspaceHealth() {
  const [data, setData] = useState<StrategyData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient("/api/ai/strategy");
        if (!res) return;
        setData(res);
      } catch {
        setData(null);
      }
    }
    load();
  }, []);

  if (!data) {
    return (
      <div className="p-5 border rounded-lg bg-card text-center">
        <p className="text-[13px] text-muted-foreground">
          AI workspace insights are available on the <span className="text-foreground font-medium">Pro plan</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-[15px] font-semibold text-foreground">AI Workspace Intelligence</h2>

      <div className="grid grid-cols-3 gap-3">
        <StatsCard title="Risk Level" value={data.riskLevel} />
        <StatsCard title="Blocked" value={data.blockedTasks} />
        <StatsCard title="Overdue" value={data.overdueTasks} />
      </div>

      <div className="rounded-lg border bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={14} className="text-primary" />
          <span className="text-[13px] font-medium text-foreground">AI Recommendations</span>
        </div>
        <ul className="space-y-2">
          {data.recommendations.map((rec, index) => (
            <li key={index} className="flex items-start gap-2 text-[13px] text-muted-foreground">
              <span className="text-primary mt-0.5 shrink-0">→</span>
              {rec}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
