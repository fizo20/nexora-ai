// frontend/lib/sdk/audit-sdk.ts

import { apiClient } from "@/lib/api/client";

export const auditSdk = {
  async getWorkspaceAuditLogs() {
    return apiClient("/api/audit/logs");
  },

  async getAIAuditLogs() {
    return apiClient("/api/audit/ai");
  },
};
