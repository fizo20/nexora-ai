// frontend/lib/react-query/activity/use-activity-timeline.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { activitySdk } from "@/lib/sdk/activity-sdk";

export function useActivityTimeline() {
  return useQuery({
    queryKey: ["activity-timeline"],

    queryFn: activitySdk.getActivityTimeline,
  });
}
