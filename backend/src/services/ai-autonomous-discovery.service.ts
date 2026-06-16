// src/services/ai-autonomous-discovery.service.ts
import { Workspace } from "../models/workspace.model";
import { Project } from "../models/project.model";

/**
 * Discover all workspaces and projects for autonomous AI
 */
export async function discoverWorkspacesAndProjects() {
  const workspaces = await Workspace.find({});

  const results: {
    workspaceId: string;
    projectId: string;
  }[] = [];

  for (const ws of workspaces) {
    const projects = await Project.find({
      workspaceId: ws._id,
    });

    for (const project of projects) {
      results.push({
        workspaceId: ws._id.toString(),
        projectId: project._id.toString(),
      });
    }
  }

  return results;
}
