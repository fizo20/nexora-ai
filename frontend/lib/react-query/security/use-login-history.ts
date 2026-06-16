// frontend/lib/react-query/security/use-login-history.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { securitySdk } from "@/lib/sdk/security-sdk";

export function useLoginHistory() {
  return useQuery({
    queryKey: ["login-history"],

    queryFn: securitySdk.getLoginHistory,
  });
}
