// frontend/components/rbac/PermissionGuard.tsx
"use client";

import { ReactNode } from "react";

import { hasPermission, Permission } from "@/lib/rbac/has-permission";

import { WorkspaceRole } from "@/types/rbac";

interface Props {
  role: WorkspaceRole;

  permission: Permission;

  children: ReactNode;

  fallback?: ReactNode;
}

export default function PermissionGuard({
  role,
  permission,
  children,
  fallback = null,
}: Props) {
  const allowed = hasPermission(role, permission);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
