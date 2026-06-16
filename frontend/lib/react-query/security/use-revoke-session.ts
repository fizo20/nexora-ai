// frontend/lib/react-query/security/use-revoke-session.ts
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { securitySdk } from "@/lib/sdk/security-sdk";

export function useRevokeSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: securitySdk.revokeSession,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["security-sessions"],
      });
    },
  });
}
