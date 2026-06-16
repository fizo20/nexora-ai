// frontend/lib/react-query/settings/use-profile-settings.ts

"use client";

import { useQuery } from "@tanstack/react-query";

import { settingsSdk } from "@/lib/sdk/settings-sdk";

export function useProfileSettings() {
  return useQuery({
    queryKey: ["profile-settings"],
    queryFn: settingsSdk.getProfile,
  });
}
