// src/routes/ai-activity.routes.ts
// This file defines the routes for fetching AI activity data related to a specific project.
import { Router } from "express";
import { AIActivity } from "../models/ai-activity.model";

const router = Router();

router.get("/ai/activity", async (req, res) => {
  const { projectId } = req.query;

  const activities = await AIActivity.find({ projectId })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    data: activities,
  });
});

export default router;
