//
export const rolePermissionsMap: Record<string, string[]> = {
  OWNER: ["*"], // ✅ FIXED
  ADMIN: [
    "workspace.read",
    "member.invite",
    "member.remove",
    "project.*",
    "task.*",
    "audit.read",
    "billing.manage",
    "billing.view",
    "analytics.view",
  ],
  MEMBER: [
    "project.read",
    "task.create",
    "task.update",
    "comment.create",
    "analytics.view",
  ],
  VIEWER: ["project.read", "task.read", "analytics.view"],
};

export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string,
): boolean => {
  if (userPermissions.includes("*")) return true;

  return userPermissions.some((permission) => {
    if (permission.endsWith(".*")) {
      return requiredPermission.startsWith(permission.replace(".*", ""));
    }
    return permission === requiredPermission;
  });
};
