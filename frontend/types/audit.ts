// frontend/types/audit.ts

export interface AuditLog {
  _id: string;

  action: string;

  entityType?: string;

  entityId?: string;

  metadata?: Record<string, unknown>;

  createdAt: string;

  userId?: {
    _id: string;
    name?: string;
    email?: string;
  };
}

export interface AIAuditLog {
  _id: string;

  action: string;

  endpoint: string;

  aiModel: string;

  cost: number;

  inputSize: number;

  outputSize: number;

  createdAt: string;

  userId?: {
    _id: string;
    name?: string;
    email?: string;
  };
}
