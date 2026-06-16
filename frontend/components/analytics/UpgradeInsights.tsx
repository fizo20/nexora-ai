// frontend/components/analytics/UpgradeInsights.tsx
"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api/client";
import AnalyticsCard from "./AnalyticsCard";

// FIX: The component previously typed Data as { insights: string[] } and
// called apiClient("/api/analytics") expecting that shape directly.
// But getAnalyticsController returns { workspace: WorkspaceAnalytics, ai: AIAnalytics }.
// The insights array lives at response.workspace.insights.
// Accessing data.insights on the real response gives `undefined`,
// and calling .map() on undefined throws:
//   "Cannot read properties of undefined (reading 'map')"
// The guard `if (!data) return null` only catches null — not a truthy object
// with a missing nested property.

type AnalyticsAPIResponse = {
  workspace: {
    insights: string[];
    [key: string]: unknown;
  };
  ai: Record<string, unknown>;
};

export default function UpgradeInsights() {
  const [insights, setInsights] = useState<string[] | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res: AnalyticsAPIResponse = await apiClient("/api/analytics");
        // Safely drill into the correct nested path
        setInsights(res?.workspace?.insights ?? []);
      } catch {
        setInsights(null);
      }
    }

    load();
  }, []);

  // Guard covers both null (fetch failed) and empty array edge cases
  if (!insights || insights.length === 0) return null;

  return (
    <AnalyticsCard title="AI Insights">
      <ul className="space-y-2 text-sm">
        {insights.map((insight, i) => (
          <li key={i}>• {insight}</li>
        ))}
      </ul>
    </AnalyticsCard>
  );
}
