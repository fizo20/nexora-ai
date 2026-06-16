// src/routes/tasks.routes.ts
import { Router } from "express";
import { authenticateWorkspace } from "../middlewares/auth.middleware";
import * as tasksController from "../controllers/tasks.controller";

const router = Router();

/**
 * All routes require auth
 */
router.use(authenticateWorkspace);

/**
 * Project → Tasks
 */
router.post("/projects/:projectId/tasks", tasksController.createTask);
router.get("/projects/:projectId/tasks", tasksController.listTasks);

/**
 * Single task
 */
router.get("/tasks/:id", tasksController.getTask);
router.patch("/tasks/:id", tasksController.updateTask);
router.delete("/tasks/:id", tasksController.deleteTask);

export default router;
