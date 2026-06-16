// src/routes/workspace-seat-cleanup.routes.ts
import { Router } from "express";
import { cleanupSeatController } from "../controllers/workspace-seat-cleanup.controller";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

/**
 * Only OWNER should be allowed
 * This is downgrade emergency cleanup
 */
router.delete(
  "/cleanup/:memberId",
  requirePermission("workspace.owner"),
  cleanupSeatController,
);

export default router;
