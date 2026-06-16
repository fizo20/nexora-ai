// backend/src/routes/users.routes.ts
import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import { getMe, updateMe } from "../controllers/users.controller";

const router = Router();

// Both routes require identity-level auth only (not workspace-scoped)
router.get("/me", authenticateUser, getMe);
router.patch("/me", authenticateUser, updateMe);

export default router;
