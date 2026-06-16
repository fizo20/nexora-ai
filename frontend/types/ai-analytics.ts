// frontend/types/ai-analytics.ts

// ROOT CAUSE OF THE CRASH:
// The old type declared `timeline` as a top-level field, but the backend
// getAIAnalytics() service never returns a field called `timeline`.
// The real activity data is returned as `activityFeed` (an array of AIActivity
// documents). The controller wraps it as { success: true, data: analytics },
// and useAIAnalytics unwraps it to res.data, so the correct field is
// data.activityFeed — not data.timeline.
//
// Also added `aiCalls` and `agentAnalytics` to totals, and `executionChart`,
// `failures`, and `rateLimits` which the service always returns but the old
// type omitted entirely — causing silent `undefined` access in any component
// that tried to use those fields.

export interface AIActivityFeedItem {
  _id: string;
  type: string;
  message: string;
  createdAt: string;
}

export interface AIAnalyticsResponse {
  totals: {
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    autonomousActions: number;
    aiCalls: number;
    agentAnalytics: unknown;
  };

  performance: {
    successRate: number;
    failureRate: number;
    productivityScore: number;
  };

  failures: {
    failure: string;
    count: number;
  }[];

  rateLimits: unknown[];

  executionChart: {
    date: string;
    total: number;
  }[];

  // FIX: was `timeline` — the correct field name from the backend is `activityFeed`
  activityFeed: AIActivityFeedItem[];
}
