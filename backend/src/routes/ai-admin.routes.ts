// src/routes/ai-admin.routes.ts
import { Router } from "express";
import {
  listExecutionLogsController,
  listRollbackLogsController,
  failureExplorerController,
  planTimelineController,
} from "../controllers/ai-admin.controller";

const router = Router();

router.get("/ai/admin/execution-logs", listExecutionLogsController);
router.get("/ai/admin/rollback-logs", listRollbackLogsController);
router.get("/ai/admin/failures", failureExplorerController);
router.get("/ai/admin/plan/:planId/timeline", planTimelineController);

export default router;
