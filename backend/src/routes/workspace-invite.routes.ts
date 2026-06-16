// src/routes/workspace-invite.routes.ts
import { Router } from "express";
import { acceptInvite } from "../controllers/workspace-invite.controller";
import { authenticateWorkspace } from "../middlewares/auth.middleware";

const router = Router();

router.post("/invites/accept", authenticateWorkspace, acceptInvite);

export default router;
