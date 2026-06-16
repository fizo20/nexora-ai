// frontend/lib/react-query/activity/use-ai-activity.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { aiActivitySdk } from "@/lib/sdk/ai-activity-sdk";

export function useAIActivity(projectId: string) {
  return useQuery({
    queryKey: ["ai-activity", projectId],

    queryFn: () => aiActivitySdk.getProjectActivity(projectId),

    enabled: !!projectId,

    refetchInterval: 5000,
  });
}
