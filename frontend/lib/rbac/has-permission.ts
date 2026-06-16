import { permissions } from "./permissions";

import { WorkspaceRole } from "@/types/rbac";

export type Permission = keyof typeof permissions;

export function hasPermission(role: WorkspaceRole, permission: Permission) {
  const allowedRoles = permissions[permission] as WorkspaceRole[];

  return allowedRoles.includes(role);
}
