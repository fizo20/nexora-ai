// src/controllers/ai-multistep.controller.ts
import { Request, Response } from "express";
import { AuthPayload } from "../types/auth.types";
import { executeAIPlanOrchestrator } from "../services/ai-orchestrator.service";

/**
 * Multi-step AI execution controller
 *
 * Controller responsibilities only:
 * - read auth context
 * - read params/body
 * - call service
 * - return response
 */
export const multiStepAIController = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId || req.body.projectId;
  const { plan } = req.body;

  if (!projectId || Array.isArray(projectId)) {
    return res.status(400).json({ message: "Invalid project id" });
  }

  const result = await executeAIPlanOrchestrator(
    auth.workspaceId,
    projectId,
    plan,
  );

  res.json(result);
};
