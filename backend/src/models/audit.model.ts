// src/models/audit.model.ts
import { Schema, model, Types, Document } from "mongoose";

export type AuditAction =
  | "workspace.created"
  | "workspace.updated"
  | "member.invited"
  | "member.removed"
  | "member.role_changed"
  | "project.created"
  | "project.updated"
  | "project.deleted"
  | "task.created"
  | "task.updated"
  | "task.deleted"
  | "billing.plan_changed"
  | "billing.payment_failed"
  | "seat.cleanup"
  | "ai.action";

export interface IAudit extends Document {
  workspaceId: Types.ObjectId;
  userId?: Types.ObjectId;

  action: AuditAction;

  entityType?: string;
  entityId?: Types.ObjectId;

  metadata?: Record<string, any>;

  createdAt: Date;
}

const auditSchema = new Schema<IAudit>(
  {
    workspaceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    entityType: String,
    entityId: Schema.Types.ObjectId,

    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const AuditLog = model<IAudit>("AuditLog", auditSchema);
