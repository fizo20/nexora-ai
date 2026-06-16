// frontend/lib/react-query/settings/use-update-profile.ts
"use client";

import { useMutation } from "@tanstack/react-query";

import { settingsSdk } from "@/lib/sdk/settings-sdk";

export function useUpdateProfile() {
  return useMutation({
    mutationFn: settingsSdk.updateProfile,
  });
}
