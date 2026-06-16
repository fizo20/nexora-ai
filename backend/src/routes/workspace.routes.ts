// src/routes/workspace.routes.ts
import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware";
import {
  createWorkspaceHandler,
  listUserWorkspacesHandler,
  switchWorkspaceHandler,
} from "../controllers/workspace.controller";

const router = Router();

/**
 * Create workspace
 */
router.post("/", authenticateUser, createWorkspaceHandler);

/**
 * List user workspaces
 */
router.get("/", authenticateUser, listUserWorkspacesHandler);

/**
 * Switch workspace → returns workspace token
 */
router.post("/switch/:workspaceId", authenticateUser, switchWorkspaceHandler);

export default router;
