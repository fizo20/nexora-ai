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

  useEffect(() => {
    const fetchStrategy = async () => {
      const res = await apiClient("/api/ai/strategy");
      setStrategy(res.data);
    };

    fetchStrategy();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">AI Strategy Insights</h1>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm text-zinc-400">Efficiency Score</h3>
          <p className="text-2xl mt-2">{strategy?.efficiency ?? "--"}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm text-zinc-400">Risk Level</h3>
          <p className="text-2xl mt-2">{strategy?.risk ?? "--"}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">
          <h3 className="text-sm text-zinc-400">AI Recommendations</h3>
          <p className="text-2xl mt-2">{strategy?.recommendations ?? "--"}</p>
        </div>
      </div>
    </div>
  );
}
