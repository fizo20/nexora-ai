// controllers/presence.controller.ts
import { Request, Response } from "express";
import { AuthPayload } from "../types/auth.types";
import { getWorkspaceOnlineUsers } from "../services/presence.service";

export async function getPresence(req: Request, res: Response) {
  const auth = req.auth;

  if (!auth || !("workspaceId" in auth)) {
    return res.status(401).json({
      error: "Workspace context required",
    });
  }

  const workspaceId = auth.workspaceId;
  const users = await getWorkspaceOnlineUsers(workspaceId);

  res.json({
    onlineUsers: users,
    count: users.length,
  });
}
