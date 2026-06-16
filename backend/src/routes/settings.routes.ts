import { Router } from "express";

import { SettingsController } from "../controllers/settings.controller";

const router = Router();

/* =========================
   WORKSPACE
========================= */

router.patch("/workspace", SettingsController.updateWorkspace);

/* =========================
   AI SETTINGS
========================= */

router.get("/ai", SettingsController.getAISettings);

router.patch("/ai", SettingsController.updateAISettings);

/* =========================
   NOTIFICATIONS
========================= */

router.get("/notifications", SettingsController.getNotifications);

router.patch("/notifications", SettingsController.updateNotifications);

/* =========================
   API KEYS
========================= */

router.post("/api-keys", SettingsController.generateApiKey);

router.get("/api-keys", SettingsController.getApiKeys);

export default router;
