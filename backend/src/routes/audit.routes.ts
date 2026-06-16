// src/routes/audit.routes.ts

import { Router } from "express";
import { authenticateWorkspace } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { requireFeature } from "../middlewares/feature-gate.middleware";
import { listWorkspaceAuditLogs } from "../controllers/audit.controller";

const router = Router();

router.get(
  "/audit/logs",
  authenticateWorkspace,
  requirePermission("audit.read"),
  requireFeature("auditLogsEnabled"),
  listWorkspaceAuditLogs,
);

export default router;
