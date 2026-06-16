// src/routes/projects.routes.ts
import { Router } from "express";
import * as ctrl from "../controllers/projects.controller";
import { authenticateWorkspace } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateWorkspace);

router.post("/", ctrl.createProjectController);
router.get("/", ctrl.listProjectsController);
router.get("/:id", ctrl.getProjectController);
router.patch("/:id", ctrl.updateProjectController);
router.delete("/:id", ctrl.deleteProjectController);

export default router;
