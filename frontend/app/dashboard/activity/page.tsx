// frontend/app/dashboard/activity/page.tsx

"use client";

import ActivityItem from "@/components/activity/ActivityItem";

import { useActivityTimeline } from "@/lib/react-query/activity/use-activity-timeline";

export default function ActivityPage() {
  const { data, isLoading } = useActivityTimeline();

  const events = data || [];

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold">Activity Timeline</h1>

        <p className="text-sm text-muted-foreground mt-1">
          Monitor workspace activity in real time
        </p>
      </div>

      <div className="space-y-4">
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Loading activity timeline...
          </div>
        )}

        {!isLoading && events.length === 0 && (
          <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
            No activity found
          </div>
        )}

        {events.map((event) => (
          <ActivityItem key={`${event.type}-${event.id}`} event={event} />
        ))}
      </div>
    </div>
  );
}
