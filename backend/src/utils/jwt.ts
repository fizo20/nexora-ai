//  src/utils/jwt.ts
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";
import { AuthPayload, IdentityPayload } from "../types/auth.types";
import { AppError } from "../errors/app-error";

/* -------------------------------------------------------------------------- */
/*                                   CONFIG                                   */
/* -------------------------------------------------------------------------- */

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET as string;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET as string;

if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error("JWT secrets are not defined");
}

const ACCESS_TOKEN_OPTIONS: SignOptions = {
  expiresIn: "1d",
};

const REFRESH_TOKEN_OPTIONS: SignOptions = {
  expiresIn: "7d",
};

/* -------------------------------------------------------------------------- */
/*                             TYPE GUARDS                                    */
/* -------------------------------------------------------------------------- */

const isWorkspacePayload = (payload: any): payload is AuthPayload => {
  return (
    payload.workspaceId !== undefined &&
    payload.plan !== undefined &&
    payload.role !== undefined
  );
};

/* -------------------------------------------------------------------------- */
/*                             ACCESS TOKENS                                  */
/* -------------------------------------------------------------------------- */

export const signIdentityAccessToken = (payload: IdentityPayload): string => {
  try {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
      },
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_OPTIONS,
    );
  } catch (err) {
    console.error("SIGN IDENTITY TOKEN ERROR:", err);
    throw new AppError("Failed to sign identity access token", 500);
  }
};

export const signWorkspaceAccessToken = (payload: AuthPayload): string => {
  try {
    return jwt.sign(
      {
        userId: payload.userId,
        workspaceId: payload.workspaceId,
        plan: payload.plan,
        role: payload.role,
      },
      ACCESS_TOKEN_SECRET,
      ACCESS_TOKEN_OPTIONS,
    );
  } catch (err) {
    console.error("SIGN WORKSPACE TOKEN ERROR:", err);
    throw new AppError("Failed to sign workspace access token", 500);
  }
};

export const verifyAccessToken = (
  token: string,
): IdentityPayload | AuthPayload => {
  try {
    console.log("🔐 VERIFYING TOKEN:", token.slice(0, 20), "...");

    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as JwtPayload;

    console.log("✅ DECODED TOKEN:", decoded);

    if (!decoded.userId) {
      throw new AppError("Invalid token payload", 401);
    }

    if (isWorkspacePayload(decoded)) {
      return decoded as AuthPayload;
    }

    return decoded as IdentityPayload;
  } catch (err) {
    console.error("❌ TOKEN VERIFY ERROR:", err);
    throw new AppError("Invalid or expired access token", 401);
  }
};

/* -------------------------------------------------------------------------- */
/*                             REFRESH TOKENS                                 */
/* -------------------------------------------------------------------------- */

export const signRefreshToken = (payload: IdentityPayload): string => {
  try {
    return jwt.sign(
      {
        userId: payload.userId,
        email: payload.email,
      },
      REFRESH_TOKEN_SECRET,
      REFRESH_TOKEN_OPTIONS,
    );
  } catch (err) {
    console.error("SIGN REFRESH TOKEN ERROR:", err);
    throw new AppError("Failed to sign refresh token", 500);
  }
};

export const verifyRefreshToken = (token: string): IdentityPayload => {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as JwtPayload;

    if (!decoded.userId || !decoded.email) {
      throw new AppError("Invalid refresh token payload", 401);
    }

    return {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (err) {
    console.error("REFRESH TOKEN ERROR:", err);
    throw new AppError("Invalid or expired refresh token", 401);
  }
};
