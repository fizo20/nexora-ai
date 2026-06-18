// frontend/app/dashboard/executions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { Bot } from "lucide-react";

type Execution = {
  id: string;
  goal: string;
  status: string;
};

const statusClass = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "success" || s === "completed")
    return "text-[11px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wide bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (s === "failed" || s === "error")
    return "text-[11px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wide bg-destructive/10 text-destructive border-destructive/20";
  return "text-[11px] font-medium px-2 py-0.5 rounded-full border uppercase tracking-wide bg-muted text-muted-foreground";
};

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        const res = await apiClient("/api/ai/executions");
        setExecutions(res.data || []);
      } catch (err) {
        console.error("Executions fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchExecutions();
  }, []);

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          AI Execution History
        </h1>
        <p className="text-[13px] text-muted-foreground mt-0.5">
          Review all AI agent runs and their outcomes
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : executions.length === 0 ? (
        <div className="rounded-lg border bg-card p-8 text-center">
          <Bot size={24} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-[14px] text-muted-foreground">No executions yet</p>
          <p className="text-[13px] text-muted-foreground mt-1">
            Run an AI command to see results here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {executions.map((e) => (
            <div
              key={e.id}
              className="flex items-start sm:items-center justify-between gap-3 rounded-lg border bg-card p-4 flex-col sm:flex-row"
            >
              <p className="text-[14px] text-foreground font-medium truncate min-w-0">
                {e.goal}
              </p>
              <span className={statusClass(e.status)}>{e.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
