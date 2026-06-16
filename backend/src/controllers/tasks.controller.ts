// backend/src/controllers/tasks.controller.ts
import { Request, Response } from "express";
import * as taskService from "../services/tasks.service";
import { AuthPayload } from "../types/auth.types";
import {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
} from "../socket/task.gateway";

/**
 * Create
 */
export const createTask = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    throw new Error("Invalid project id");
  }

  const task = await taskService.createTask(
    auth.workspaceId,
    projectId,
    req.body,
  );

  emitTaskCreated(auth.workspaceId, task);
  res.status(201).json(task);
};

/**
 * List
 */
export const listTasks = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    throw new Error("Invalid project id");
  }

  const tasks = await taskService.listTasks(auth.workspaceId, projectId);

  res.json(tasks);
};

/**
 * Get
 */
export const getTask = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new Error("Invalid id");
  }

  const task = await taskService.getTask(auth.workspaceId, id);

  res.json(task);
};

/**
 * Update
 */
export const updateTask = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new Error("Invalid id");
  }

  const task = await taskService.updateTask(auth.workspaceId, id, req.body);

  emitTaskUpdated(auth.workspaceId, task);
  res.json(task);
};

/**
 * Delete
 */
export const deleteTask = async (req: Request, res: Response) => {
  const auth = req.auth as AuthPayload;
  const id = req.params.id;

  if (!id || Array.isArray(id)) {
    throw new Error("Invalid id");
  }

  await taskService.deleteTask(auth.workspaceId, id);

  emitTaskDeleted(auth.workspaceId, id);
  res.status(204).send();
};
