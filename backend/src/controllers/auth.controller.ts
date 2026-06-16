// src/controllers/auth.controller.ts
import { Request, Response, NextFunction } from "express";
import { sendResponse } from "../utils/sendResponse";
import { AppError } from "../utils/app-error";
import { registerUser, loginUser } from "../services/auth.service";
import { signIdentityAccessToken, signRefreshToken } from "../utils/jwt";
import {
  saveRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/refresh-token.service";

/* -------------------------------------------------------------------------- */
/*                                   REGISTER                                 */
/* -------------------------------------------------------------------------- */

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("REGISTER BODY:", req.body);
    const user = await registerUser(req.body);

    const userId = user._id.toString();
    const email = user.email;

    const accessToken = signIdentityAccessToken({ userId, email });
    const refreshToken = signRefreshToken({ userId, email });

    await saveRefreshToken(
      userId,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return sendResponse({
      res,
      statusCode: 201,
      message: "Account created successfully",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                                     LOGIN                                  */
/* -------------------------------------------------------------------------- */

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await loginUser(req.body);

    const userId = user._id.toString();
    const email = user.email;

    const accessToken = signIdentityAccessToken({ userId, email });
    const refreshToken = signRefreshToken({ userId, email });

    await saveRefreshToken(
      userId,
      refreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return sendResponse({
      res,
      message: "Login successful",
      data: { accessToken, refreshToken },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                                REFRESH TOKEN                               */
/* -------------------------------------------------------------------------- */

export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token required", 400));
    }

    /**
     * rotateRefreshToken:
     * - verifies token
     * - invalidates old token
     * - returns { userId, email }
     */
    const { userId, email } = await rotateRefreshToken(refreshToken);

    const newAccessToken = signIdentityAccessToken({ userId, email });
    const newRefreshToken = signRefreshToken({ userId, email });

    await saveRefreshToken(
      userId,
      newRefreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return sendResponse({
      res,
      message: "Token refreshed",
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/* -------------------------------------------------------------------------- */
/*                                     LOGOUT                                 */
/* -------------------------------------------------------------------------- */

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token required", 400));
    }

    await revokeRefreshToken(refreshToken);

    return sendResponse({
      res,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
