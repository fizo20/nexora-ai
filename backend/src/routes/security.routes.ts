// backend/src/routes/security.routes.ts
import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import {
  getSessions,
  revokeSession,
  getLoginHistory,
} from "../controllers/security.controller";

const router = Router();

// All security routes require identity-level auth (not workspace-scoped)
router.get("/sessions", authenticateUser, getSessions);
router.delete("/sessions/:sessionId", authenticateUser, revokeSession);
router.get("/login-history", authenticateUser, getLoginHistory);

export default router;
