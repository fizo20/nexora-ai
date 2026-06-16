// frontend/lib/react-query/audit/use-ai-audit.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { auditSdk } from "@/lib/sdk/audit-sdk";

export function useAIAudit() {
  return useQuery({
    queryKey: ["ai-audit"],
    queryFn: auditSdk.getAIAuditLogs,
  });
}
