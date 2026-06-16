// src/routes/workspace-seat.routes.ts
import { Router } from "express";
import { getSeatUsageController } from "../controllers/workspace-seat.controller";
import { requirePermission } from "../middlewares/rbac.middleware";

const router = Router();

// any workspace member with read access can view usage
router.get(
  "/usage",
  requirePermission("workspace.read"),
  getSeatUsageController,
);

export default router;
