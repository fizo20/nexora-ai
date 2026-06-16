// backend/src/services/tasks.service.ts
import { Task } from "../models/task.model";
import { AppError } from "../errors/app-error";
import {
  emitTaskCreated,
  emitTaskUpdated,
  emitTaskDeleted,
} from "../socket/task.gateway";
/**
 * Create task
 */
export const createTask = async (
  workspaceId: string,
  projectId: string,
  data: {
    title: string;
    description?: string;
    assignee?: string;
    dueDate?: Date;
    priority?: "LOW" | "MEDIUM" | "HIGH";
  },
) => {
  if (!data.title) {
    throw new AppError("Task title required", 400);
  }

  const task = await Task.create({
    workspaceId,
    projectId,
    title: data.title,
    description: data.description,
    assignee: data.assignee,
    dueDate: data.dueDate,
    priority: data.priority ?? "MEDIUM",
  });

  emitTaskCreated(workspaceId, task);

  return task;
};

/**
 * List tasks
 */
export const listTasks = async (workspaceId: string, projectId: string) => {
  return Task.find({
    workspaceId,
    projectId,
    deletedAt: null,
  }).sort({ createdAt: -1 });
};

/**
 * Get one
 */
export const getTask = async (workspaceId: string, taskId: string) => {
  const task = await Task.findOne({
    _id: taskId,
    workspaceId,
    deletedAt: null,
  });

  if (!task) throw new AppError("Task not found", 404);

  return task;
};

/**
 * Update
 */
export const updateTask = async (
  workspaceId: string,
  taskId: string,
  update: any,
) => {
  const task = await Task.findOneAndUpdate(
    {
      _id: taskId,
      workspaceId,
      deletedAt: null,
    },
    update,
    { new: true },
  );

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  emitTaskUpdated(workspaceId, task);

  return task;
};

/**
 * Soft delete
 */
export const deleteTask = async (workspaceId: string, taskId: string) => {
  const task = await Task.findOneAndUpdate(
    {
      _id: taskId,
      workspaceId,
      deletedAt: null,
    },
    {
      deletedAt: new Date(),
    },
    {
      new: true,
    },
  );

  if (!task) {
    throw new AppError("Task not found", 404);
  }

  emitTaskDeleted(workspaceId, taskId);

  return task;
};
