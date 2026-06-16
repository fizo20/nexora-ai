// frontend/lib/react-query/audit/use-audit-logs.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { auditSdk } from "@/lib/sdk/audit-sdk";

export function useAuditLogs() {
  return useQuery({
    queryKey: ["audit-logs"],

    queryFn: auditSdk.getWorkspaceAuditLogs,
  });
}
