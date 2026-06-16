// src/types/auth.types.ts
import { WorkspacePlan } from "../models/workspace.model";

/**
 * Identity-level payload (before workspace selection)
 */
export interface IdentityPayload {
  userId: string;
  email: string;
}

/**
 * Workspace-scoped payload (after workspace selection)
 */
export interface AuthPayload extends IdentityPayload {
  workspaceId: string;
  plan: WorkspacePlan;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}
