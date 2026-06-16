// frontend/lib/react-query/security/use-sessions.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { securitySdk } from "@/lib/sdk/security-sdk";

export function useSessions() {
  return useQuery({
    queryKey: ["security-sessions"],

    queryFn: securitySdk.getSessions,
  });
}
