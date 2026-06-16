// src/routes/billing.routes.ts
import { Router } from "express";
import { authenticateWorkspace } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { getUsageStatsController } from "../controllers/billing.controller";
import {
  createUpgradeCheckoutSession,
  createCustomerPortalSession,
} from "../services/billing.service";

const router = Router();

router.use(authenticateWorkspace);

/* =========================
   USAGE
========================= */
router.get(
  "/usage",
  requirePermission("billing.view"),
  getUsageStatsController,
);

/* =========================
   UPGRADE (RESTORED ✅)
========================= */
router.post(
  "/upgrade",
  requirePermission("billing.manage"),
  async (req, res) => {
    const workspaceId = (req as any).auth.workspaceId;
    const { targetPlan } = req.body;

    const url = await createUpgradeCheckoutSession(workspaceId, targetPlan);

    res.json({ checkoutUrl: url });
  },
);

/* =========================
   CUSTOMER PORTAL (RESTORED ✅)
========================= */
router.post(
  "/portal",
  requirePermission("billing.manage"),
  async (req, res) => {
    const workspaceId = (req as any).auth.workspaceId;

    const url = await createCustomerPortalSession(workspaceId);

    res.json({ url });
  },
);

export default router;
