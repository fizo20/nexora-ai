"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { WorkspaceRole } from "@/types/rbac";

interface Workspace {
  id: string;
  name: string;
  slug: string;
  role: WorkspaceRole;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  setWorkspace: (workspace: Workspace | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);

  const value = useMemo(
    () => ({
      workspace,
      setWorkspace,
    }),
    [workspace],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}
