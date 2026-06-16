// frontend/lib/api/analytics.ts
import { apiClient } from "@/lib/api/client";

import {
  AnalyticsResponse,
  WorkspaceMetricsResponse,
  RangeType,
} from "@/types/analytics";

export async function getAnalytics(
  range: RangeType = "7d",
): Promise<AnalyticsResponse> {
  return apiClient(`/api/analytics?range=${range}`);
}

export async function getWorkspaceMetrics(): Promise<WorkspaceMetricsResponse> {
  const response = await apiClient("/api/workspace/metrics");

  return response.data;
}
