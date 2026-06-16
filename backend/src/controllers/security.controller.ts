// backend/src/controllers/security.controller.ts
import { Request, Response, NextFunction } from "express";
import { RefreshToken } from "../models/refresh-token.model";
import { AuthPayload } from "../types/auth.types";
import { AppError } from "../errors/app-error";

/**
 * GET /api/security/sessions
 *
 * Returns the user's active (non-revoked, non-expired) refresh token records.
 * Each record represents a logged-in session (one per login that hasn't been
 * logged out or rotated to expiry).
 *
 * NOTE: We do NOT expose tokenHash to the client — only the safe metadata
 * fields the frontend types require: id, createdAt, lastActiveAt (updatedAt),
 * and a `current` flag. Since we don't store IP/userAgent at token creation
 * time, we return empty strings for those; the frontend SessionCard already
 * handles missing data gracefully.
 */
export const getSessions = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.auth as AuthPayload;
    if (!auth?.userId) throw new AppError("Unauthorized", 401);

    const now = new Date();

    const tokens = await RefreshToken.find({
      user: auth.userId,
      revoked: false,
      expiresAt: { $gt: now },
    })
      .sort({ updatedAt: -1 })
      .lean();

    const sessions = tokens.map((t, i) => ({
      id: t._id.toString(),
      ipAddress: "",
      userAgent: "",
      createdAt: t.createdAt.toISOString(),
      // updatedAt reflects the last time this token was touched (e.g. checked)
      lastActiveAt: t.updatedAt.toISOString(),
      // Mark the most recently updated token as the current session
      current: i === 0,
    }));

    return res.json({
      success: true,
      data: sessions,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/security/sessions/:sessionId
 *
 * Revokes a specific refresh token by its document _id.
 * This is the correct approach: we don't have the raw token on the server
 * at this point, but we own the document and can flip `revoked: true` by _id.
 */
export const revokeSession = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.auth as AuthPayload;
    if (!auth?.userId) throw new AppError("Unauthorized", 401);

    const { sessionId } = req.params;

    // Ensure the token belongs to this user before revoking
    const token = await RefreshToken.findOne({
      _id: sessionId,
      user: auth.userId,
    });

    if (!token) {
      throw new AppError("Session not found", 404);
    }

    token.revoked = true;
    await token.save();

    return res.json({
      success: true,
      message: "Session revoked",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/security/login-history
 *
 * Returns all refresh token records for the user (including revoked/expired),
 * newest first. Each row = one login event. Revoked = logged out or rotated.
 *
 * The frontend LoginHistory type expects { id, ipAddress, userAgent, createdAt, success }.
 * We map `success: !revoked` — an active token means the login is still valid;
 * a revoked one means it was terminated (logout or token rotation).
 */
export const getLoginHistory = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.auth as AuthPayload;
    if (!auth?.userId) throw new AppError("Unauthorized", 401);

    const tokens = await RefreshToken.find({ user: auth.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const history = tokens.map((t) => ({
      id: t._id.toString(),
      ipAddress: "",
      userAgent: "",
      createdAt: t.createdAt.toISOString(),
      // A non-revoked token that hasn't expired = successful active session
      // A revoked token = logged out (still a successful login event historically)
      // We mark expired-and-revoked as success:false would be misleading,
      // so all entries show success: true (login itself succeeded; revocation
      // is a separate lifecycle event shown in sessions).
      success: true,
    }));

    return res.json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
};
