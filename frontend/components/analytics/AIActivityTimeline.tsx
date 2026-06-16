// frontend/components/analytics/AIActivityTimeline.tsx
"use client";

import { useAIAnalytics } from "@/hooks/useAIAnalytics";

// ROOT CAUSE:
// This component accessed `data.timeline` but the backend ai-analytics service
// returns the field as `activityFeed`, not `timeline`. `data.timeline` was
// always `undefined`, so `.map()` threw:
//   "Cannot read properties of undefined (reading 'map')"
//
// The `if (!data) return null` guard only protects against a null data state.
// Once the API responds (data becomes a truthy object), the guard passes and
// the crash happens immediately on the next line.
//
// Two-layer fix:
// 1. Access the correct field: `data.activityFeed` (matches backend)
// 2. Add a fallback `?? []` so that even if the field is absent in a future
//    API change, the component renders an empty list instead of crashing.

export default function AIActivityTimeline() {
  const { data } = useAIAnalytics();

  if (!data) return null;

  // FIX: was data.timeline — correct field from backend is activityFeed
  const items = data.activityFeed ?? [];

  if (items.length === 0) {
    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-5">
          <h2 className="font-semibold">AI Activity Timeline</h2>
          <p className="text-sm text-muted-foreground">
            Autonomous AI execution history
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          No activity recorded yet.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="mb-5">
        <h2 className="font-semibold">AI Activity Timeline</h2>
        <p className="text-sm text-muted-foreground">
          Autonomous AI execution history
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item._id} className="border-l pl-4">
            <div className="text-sm font-medium">{item.type}</div>
            <div className="text-sm text-muted-foreground">{item.message}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
