// src/types/token.ts
export interface AccessTokenPayload {
  userId: string;
  workspaceId: string;
  role: string;
}

export interface RefreshTokenPayload {
  userId: string;
}
