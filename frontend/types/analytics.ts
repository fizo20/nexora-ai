// frontend/types/analytics.ts
export type RangeType = "7d" | "30d" | "90d";

export interface UsageMetric {
  _id: {
    date: string;
  };

  total: number;
}

export interface TaskAnalytics {
  total: number;
  completed: number;
  overdue: number;
  completionRate?: number;
}

export interface UsageAnalytics {
  total: number;
  limit: number;
  percentage: number;
}

export interface SeatAnalytics {
  members: number;
  pendingInvites: number;
  total: number;
}

export interface WorkspaceMetric {
  _id: string;

  totalUnits: number;
}

export interface RateLimitMetric {
  feature: string;

  count: number;

  windowStart: string;
}

export interface TaskStat {
  _id: string;

  count: number;
}

export interface WorkspaceMetricsResponse {
  usageByFeature: WorkspaceMetric[];

  aiCallsLast30Days: number;

  seats: SeatAnalytics;

  rateLimits: RateLimitMetric[];

  projects: number;

  taskStats: TaskStat[];
}

export interface AnalyticsResponse {
  plan: "FREE" | "PRO" | "ENTERPRISE";

  usage?: UsageAnalytics;

  tasks?: TaskAnalytics;

  usageTrend?: UsageMetric[];

  insights: string[];
}
