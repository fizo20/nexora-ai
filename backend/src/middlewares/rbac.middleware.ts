// src/middlewares/rbac.middleware.ts
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";
import { rolePermissionsMap, hasPermission } from "../utils/permissions";
import { AuthPayload } from "../types/auth.types";

export const requirePermission = (permission: string) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new AppError("Unauthorized", 401));
    }

    /**
     * At this point, authenticateWorkspace MUST have run.
     * So req.auth should be AuthPayload.
     */
    const auth = req.auth as AuthPayload;

    if (!auth.workspaceId || !auth.role) {
      return next(
        new AppError("Workspace context required for this action", 403),
      );
    }
    const role = auth.role.toUpperCase();
    const permissions = rolePermissionsMap[role] ?? [];

    if (!hasPermission(permissions, permission)) {
      return next(new AppError("Forbidden", 403));
    }

    next();
  };
};
