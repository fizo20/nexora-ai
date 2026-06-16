// frontend/components/ai/AIActivityFeed.tsx
"use client";

import { useAIActivity } from "@/lib/react-query/activity/use-ai-activity";

interface Props {
  projectId: string;
}

export default function AIActivityFeed({ projectId }: Props) {
  const { data, isLoading } = useAIActivity(projectId);

  const activities = data || [];

  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-4">
        <h2 className="font-semibold">AI Activity</h2>

        <p className="text-sm text-muted-foreground">
          Autonomous AI activity stream
        </p>
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Loading AI activity...
          </div>
        )}

        {!isLoading && activities.length === 0 && (
          <div className="text-sm text-muted-foreground">
            No AI activity yet
          </div>
        )}

        {activities.map((activity) => (
          <div
            key={activity._id}
            className={`rounded-lg border p-3 text-sm ${
              activity.type === "ai_summary"
                ? "border-purple-500/20 bg-purple-500/5"
                : ""
            }`}
          >
            <div className="font-medium">{activity.type}</div>

            <p className="mt-1 text-muted-foreground">{activity.message}</p>

            <div className="mt-2 text-xs text-muted-foreground">
              {new Date(activity.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
