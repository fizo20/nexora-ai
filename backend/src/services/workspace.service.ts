// src/services/workspace.service.ts
import { Workspace } from "../models/workspace.model";
import { WorkspaceMember } from "../models/workspace-member.model";
import { AppError } from "../utils/app-error";
import { AIPolicy } from "../models/ai-policy.model";

/**
 * Create a new workspace and assign creator as OWNER
 */
export const createWorkspace = async (userId: string, name: string) => {
  if (!name || name.trim().length < 2) {
    throw new AppError("Workspace name is required", 400);
  }

  const normalizedName = name.trim();

  /**
   * Generate slug from name
   * Example: "My Workspace" → "my-workspace"
   */
  let slug = normalizedName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  /**
   * Ensure slug is unique
   */
  const existing = await Workspace.findOne({ slug });

  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  /**
   * 1. Create workspace
   */
  const workspace = await Workspace.create({
    name: normalizedName,
    slug, // ✅ FIXED
    owner: userId,
  });

  /**
   * 2. Add creator as OWNER
   */
  await WorkspaceMember.create({
    workspace: workspace._id,
    user: userId,
    role: "OWNER",
  });

  /**
   * 3. Create AI policy
   */
  await AIPolicy.create({
    workspaceId: workspace._id,
  });

  return workspace;
};

/**
 * Get all workspaces a user belongs to
 */
export const getUserWorkspaces = async (userId: string) => {
  const memberships = await WorkspaceMember.find({ user: userId })
    .populate("workspace")
    .lean();

  /**
   * Normalize response
   */
  return memberships
    .filter((member) => member.workspace !== null) // 🔥 REMOVE BROKEN ONES

    .map((member) => ({
      workspace: member.workspace,
      role: member.role,
    }));
};

export const switchWorkspace = async (userId: string, workspaceId: string) => {
  const membership = await WorkspaceMember.findOne({
    user: userId,
    workspace: workspaceId,
  });

  if (!membership) {
    throw new AppError("Access to workspace denied", 403);
  }

  return {
    workspaceId,
    role: membership.role,
  };
};
