// frontend/lib/react-query/audit/use-ai-audit-logs.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { auditSdk } from "@/lib/sdk/audit-sdk";

export function useAIAuditLogs() {
  return useQuery({
    queryKey: ["ai-audit-logs"],

    queryFn: auditSdk.getAIAuditLogs,
  });
}
