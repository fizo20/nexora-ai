// src/services/refresh-token.service.ts
import crypto from "crypto";
import { RefreshToken } from "../models/refresh-token.model";
import { verifyRefreshToken } from "../utils/jwt";
import { AppError } from "../utils/app-error";

const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

export const saveRefreshToken = async (
  userId: string,
  token: string,
  expiresAt: Date,
) => {
  return RefreshToken.create({
    user: userId, // mongoose will cast string → ObjectId
    tokenHash: hashToken(token),
    expiresAt,
    revoked: false,
  });
};

export const rotateRefreshToken = async (token: string) => {
  const payload = verifyRefreshToken(token);
  const tokenHash = hashToken(token);

  const storedToken = await RefreshToken.findOne({ tokenHash });

  if (!storedToken || storedToken.revoked) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (storedToken.expiresAt < new Date()) {
    throw new AppError("Refresh token expired", 401);
  }

  // Invalidate old token
  storedToken.revoked = true;
  await storedToken.save();

  return {
    userId: payload.userId,
    email: payload.email,
  };
};

export const revokeRefreshToken = async (token: string) => {
  const tokenHash = hashToken(token);

  await RefreshToken.findOneAndUpdate({ tokenHash }, { revoked: true });
};
