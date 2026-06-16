// src/routes/ai-audit.routes.ts
import { Router } from "express";
import { authenticateWorkspace } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { requireFeature } from "../middlewares/feature-gate.middleware";
import { listAIAuditLogs } from "../controllers/ai-audit.controller";

const router = Router();

router.get(
  "/audit/ai",
  authenticateWorkspace,
  requirePermission("audit.read"),
  requireFeature("auditLogsEnabled"),
  listAIAuditLogs,
);

export default router;
