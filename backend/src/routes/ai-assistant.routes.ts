// src/routes/ai-assistant.routes.ts
import { Router } from "express";
import { handleAIAssistant } from "../controllers/ai-assistant.controller";
import { authenticateWorkspace } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticateWorkspace, handleAIAssistant);

export default router;
