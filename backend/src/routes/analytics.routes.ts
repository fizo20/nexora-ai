// src/routes/analytics.routes.ts
import { Router } from "express";
import { authenticateWorkspace } from "../middlewares/auth.middleware";
import { requirePermission } from "../middlewares/rbac.middleware";
import { getAnalyticsController } from "../controllers/analytics.controller";
import { getWorkspaceAnalytics } from "../services/analytics.service";

const router = Router();

/* =========================
   RANGE TYPE + PARSER
========================= */
type RangeType = "7d" | "30d" | "90d";

const parseRange = (value: any): RangeType => {
  if (value === "30d" || value === "90d") return value;
  return "7d";
};

router.use(authenticateWorkspace);

/* =========================
   ANALYTICS (ALL PLANS)
========================= */
router.get("/", requirePermission("analytics.view"), getAnalyticsController);

/* =========================
   CSV EXPORT (ALL PLANS)
========================= */
router.get("/export", async (req, res) => {
  try {
    const workspaceId = (req as any).auth.workspaceId;

    const range = parseRange(req.query.range);

    const data = await getWorkspaceAnalytics(workspaceId, range);

    const rows = [
      ["Metric", "Value"],
      ["Plan", data.plan],
      ["Total Usage", data.usage?.total ?? 0],
      ["Limit", data.usage?.limit ?? 0],
      ["Usage %", data.usage?.percentage ?? 0],
      ["Total Tasks", data.tasks?.total ?? 0],
      ["Completed Tasks", data.tasks?.completed ?? 0],
      ["Overdue Tasks", data.tasks?.overdue ?? 0],
      ["Completion Rate", data.tasks?.completionRate ?? 0],
    ];

    const csv = rows.map((r) => r.join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=analytics.csv");

    res.send(csv);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).send("Export failed");
  }
});

export default router;
