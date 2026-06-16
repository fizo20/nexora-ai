// frontend/components/realtime/RealtimeFeed.tsx
"use client";

import { useRealtime } from "@/providers/realtime-provider";
import { RealtimeEvent } from "@/types/realtime";

export default function RealtimeFeed() {
  const { events } = useRealtime();

  const realtimeEvents = events as RealtimeEvent[];

  return (
    <div className="rounded-xl border bg-card p-4">
      <div>
        <h3 className="font-semibold">Live Activity Feed</h3>

        <p className="text-sm text-muted-foreground">
          Real-time workspace events
        </p>
      </div>

      <div className="mt-4 space-y-3 max-h-125 overflow-auto">
        {realtimeEvents.length === 0 && (
          <div className="text-sm text-muted-foreground">No live activity</div>
        )}

        {realtimeEvents.map((event, index) => (
          <div key={`${event.type}-${index}`} className="rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{event.type}</span>

              <span className="text-xs text-muted-foreground">
                {new Date(event.createdAt).toLocaleTimeString()}
              </span>
            </div>

            {event.payload && (
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                {JSON.stringify(event.payload, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
