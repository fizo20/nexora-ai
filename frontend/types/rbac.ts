// frontend/types/rbac.ts

export type WorkspaceRole = "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";

export interface WorkspaceMember {
  id: string;

  name: string;

  email: string;

  role: WorkspaceRole;
}
