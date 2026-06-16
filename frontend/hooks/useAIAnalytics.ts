// frontend/hooks/useAIAnalytics.ts
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import { AIAnalyticsResponse } from "@/types/ai-analytics";

// FIX: The original hook used `api.get("/ai/analytics")` where `api` is the
// axios instance from @/lib/api.ts (baseURL: .../api). This bypasses all the
// shared apiClient logic: the 401→redirect, the upgrade_required event dispatch,
// and the consistent error handling that every other hook in the app relies on.
// It also introduces an implicit dependency on axios being installed and configured,
// while the rest of the client layer uses native fetch via apiClient.
//
// The correct backend path is GET /api/ai/analytics (mounted as /analytics inside
// ai.routes.ts which is registered at /api/ai in app.ts).
// apiClient prepends API_BASE (http://localhost:4000), so the call becomes
// http://localhost:4000/api/ai/analytics — matching the backend exactly.
//
// NOTE: If you need react-query caching, replace useEffect with useQuery and
// keep the queryFn body below. The fetch logic itself is the fix that matters.

export function useAIAnalytics() {
  const [data, setData] = useState<AIAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function load() {
      try {
        // apiClient returns the parsed JSON body.
        // The backend ai-analytics controller responds with { success: true, data: analytics }
        const res = await apiClient("/api/ai/analytics");
        setData(res.data ?? res); // handle both wrapped { data } and flat responses
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to load AI analytics"),
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { data, loading, error };
}
