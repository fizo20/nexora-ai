// frontend/lib/rbac/permissions.ts

import { WorkspaceRole } from "@/types/rbac";

export const permissions = {
  manageBilling: ["OWNER"],

  manageWorkspace: ["OWNER", "ADMIN"],

  manageTeam: ["OWNER", "ADMIN"],

  manageApiKeys: ["OWNER", "ADMIN"],

  manageAISettings: ["OWNER", "ADMIN"],

  viewAuditLogs: ["OWNER", "ADMIN"],

  useWorkspace: ["OWNER", "ADMIN", "MEMBER", "VIEWER"],
} satisfies Record<string, WorkspaceRole[]>;
