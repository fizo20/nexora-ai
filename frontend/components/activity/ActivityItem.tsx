// frontend/components/activity/ActivityItem.tsx

import ActivityBadge from "./ActivityBadge";

import { ActivityEvent } from "@/types/activity";

interface Props {
  event: ActivityEvent;
}

export default function ActivityItem({ event }: Props) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <ActivityBadge type={event.type} />

          <div>
            <h3 className="font-medium">{event.title}</h3>

            {event.description && (
              <p className="text-sm text-muted-foreground">
                {event.description}
              </p>
            )}
          </div>
        </div>

        <span className="text-xs text-muted-foreground whitespace-nowrap">
          {new Date(event.createdAt).toLocaleString()}
        </span>
      </div>

      {event.metadata && (
        <pre className="mt-4 overflow-auto rounded-md bg-muted p-3 text-xs">
          {JSON.stringify(event.metadata, null, 2)}
        </pre>
      )}
    </div>
  );
}
