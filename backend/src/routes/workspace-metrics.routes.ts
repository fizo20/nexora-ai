// src/routes/workspace-metrics.routes.ts
import { Router } from "express";
import { authenticateWorkspace } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { getWorkspaceMetricsController } from "../controllers/workspace-metrics.controller";

const router = Router();

/**
 * Owner/Admin only — metrics are sensitive
 */
router.get(
  "/metrics",
  authenticateWorkspace,
  requirePermission("workspace.read"),
  getWorkspaceMetricsController,
);

export default router;
