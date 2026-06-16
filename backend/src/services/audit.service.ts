// src/services/audit.service.ts
import { Types } from "mongoose";
import { AuditLog, AuditAction } from "../models/audit.model";

type LogAuditInput = {
  workspaceId: string;
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, any>;
};

export const logAuditEvent = async (input: LogAuditInput) => {
  await AuditLog.create({
    workspaceId: new Types.ObjectId(input.workspaceId),
    userId: input.userId ? new Types.ObjectId(input.userId) : undefined,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ? new Types.ObjectId(input.entityId) : undefined,
    metadata: input.metadata,
  });
};
