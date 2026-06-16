// src/services/projects.service.ts
import { Types } from "mongoose";
import { Project } from "../models/project.model";

export const createProject = async (data: {
  workspaceId: string;
  name: string;
  description?: string;
  createdBy: string;
  members?: string[];
  dueDate?: Date;
}) => {
  return Project.create({
    workspaceId: new Types.ObjectId(data.workspaceId),
    name: data.name,
    description: data.description,
    createdBy: new Types.ObjectId(data.createdBy),
    members: data.members?.map((m) => new Types.ObjectId(m)) || [],
    dueDate: data.dueDate,
  });
};

export const listProjects = async (workspaceId: string) => {
  return Project.find({
    workspaceId,
    deletedAt: null,
  }).sort({ createdAt: -1 });
};

export const getProjectById = async (
  workspaceId: string,
  projectId: string,
) => {
  return Project.findOne({
    _id: projectId,
    workspaceId,
    deletedAt: null,
  });
};

export const updateProject = async (
  workspaceId: string,
  projectId: string,
  update: any,
) => {
  return Project.findOneAndUpdate(
    { _id: projectId, workspaceId, deletedAt: null },
    update,
    { new: true },
  );
};

export const softDeleteProject = async (
  workspaceId: string,
  projectId: string,
) => {
  return Project.findOneAndUpdate(
    { _id: projectId, workspaceId },
    { deletedAt: new Date() },
    { new: true },
  );
};
