import { Router } from "express";
import { getPresence } from "../controllers/presence.controller";
import { authenticateWorkspace } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateWorkspace, getPresence);

export default router;
