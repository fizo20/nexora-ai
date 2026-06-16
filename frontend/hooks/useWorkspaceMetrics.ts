// frontend/hooks/useWorkspaceMetrics.ts
"use client";

import { useEffect, useState } from "react";

import { apiClient } from "@/lib/api/client";

import { WorkspaceMetricsResponse } from "@/types/analytics";

export function useWorkspaceMetrics() {
  const [data, setData] = useState<WorkspaceMetricsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // FIX: was "/api/workspace" — that route does not exist.
        // The backend mounts workspace-metrics.routes.ts at /api/workspace
        // with a single handler at GET /metrics, making the real path /api/workspace/metrics.
        const res = await apiClient("/api/workspace/metrics");

        // FIX: the backend wraps the payload as { success: true, data: metrics }.
        // apiClient already returns the parsed JSON body, so we unwrap .data here.
        // Previously the hook called res.data on the already-unwrapped object,
        // which was always undefined (there is no .data on the top-level response
        // because apiClient returns the full parsed body, not an Axios response).
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return {
    data,
    loading,
  };
}
