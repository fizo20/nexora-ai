// frontend/types/security.ts

export interface SessionDevice {
  id: string;

  ipAddress: string;

  userAgent: string;

  createdAt: string;

  lastActiveAt: string;

  current: boolean;
}

export interface LoginHistory {
  id: string;

  ipAddress: string;

  userAgent: string;

  createdAt: string;

  success: boolean;
}
