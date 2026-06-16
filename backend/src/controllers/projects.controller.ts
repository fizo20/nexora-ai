// src/controllers/projects.controller.ts
import { Request, Response } from "express";
import * as projectService from "../services/projects.service";
import { AuthPayload } from "../types/auth.types";
import { logAuditEvent } from "../services/audit.service";

/**
 * Create Project
 */
export const createProjectController = async (req: Request, res: Response) => {
  const { name, description, members, dueDate } = req.body;
  const auth = (req as any).auth;

  if (!name) {
    return res.status(400).json({ message: "Project name is required" });
  }

  const project = await projectService.createProject({
    workspaceId: auth.workspaceId,
    name,
    description,
    createdBy: auth.userId,
    members,
    dueDate,
  });

  await logAuditEvent({
    workspaceId: auth.workspaceId,
    userId: auth.userId,
    action: "project.created",
    entityType: "Project",
    entityId: project._id.toString(),
  });

  return res.status(201).json(project);
};

/**
 * List Projects (workspace-scoped)
 */
export const listProjectsController = async (req: Request, res: Response) => {
  const auth = (req as any).auth;

  const projects = await projectService.listProjects(auth.workspaceId);

  return res.json(projects);
};

/**
 * Get Single Project
 */
export const getProjectController = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;

  const idParam = req.params.id;
  if (Array.isArray(idParam)) {
    return res.status(400).json({ message: "Invalid id param" });
  }

  const project = await projectService.getProjectById(
    auth.workspaceId,
    idParam,
  );

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
};

/**
 * Update Project
 */
export const updateProjectController = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;

  const idParam = req.params.id;
  if (Array.isArray(idParam)) {
    return res.status(400).json({ message: "Invalid id param" });
  }

  const update: any = {};
  const allowed = ["name", "description", "status", "members", "dueDate"];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      update[key] = req.body[key];
    }
  }

  const project = await projectService.updateProject(
    auth.workspaceId,
    idParam,
    update,
  );

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json(project);
};

/**
 * Soft Delete Project
 */
export const deleteProjectController = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;

  const idParam = req.params.id;
  if (Array.isArray(idParam)) {
    return res.status(400).json({ message: "Invalid id param" });
  }

  const project = await projectService.softDeleteProject(
    auth.workspaceId,
    idParam,
  );

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  res.json({ message: "Project deleted" });
};
