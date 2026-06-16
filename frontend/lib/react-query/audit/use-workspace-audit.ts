// frontend/lib/react-query/audit/use-workspace-audit.ts
"use client";

import { useQuery } from "@tanstack/react-query";

import { auditSdk } from "@/lib/sdk/audit-sdk";

export function useWorkspaceAudit() {
  return useQuery({
    queryKey: ["workspace-audit"],
    queryFn: auditSdk.getWorkspaceAuditLogs,
  });
}
