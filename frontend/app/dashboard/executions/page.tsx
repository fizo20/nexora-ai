// frontend/app/dashboard/executions/page.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";

type Execution = {
  id: string;
  goal: string;
  status: string;
};

export default function ExecutionsPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);

  useEffect(() => {
    const fetchExecutions = async () => {
      const res = await apiClient("/api/ai/executions");
      setExecutions(res.data || []);
    };

    fetchExecutions();
  }, []);

  return (
    <div>
      <h1 className="text-2xl mb-6 font-semibold">AI Execution History</h1>

      <div className="space-y-4">
        {executions.map((e) => (
          <div
            key={e.id}
            className="bg-zinc-900 border border-zinc-800 p-4 rounded-lg"
          >
            <div className="flex justify-between">
              <p className="font-medium">{e.goal}</p>
              <span className="text-zinc-400">{e.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
