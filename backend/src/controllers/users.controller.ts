// backend/src/controllers/users.controller.ts
import { Request, Response, NextFunction } from "express";
import { User } from "../models/user.model";
import { AuthPayload } from "../types/auth.types";
import { AppError } from "../errors/app-error";

/**
 * GET /api/users/me
 *
 * Returns the authenticated user's profile.
 * Uses the userId from the identity token (authenticateUser middleware),
 * NOT authenticateWorkspace — profile is user-level, not workspace-scoped.
 */
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.auth as AuthPayload;

    if (!auth?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    // `password` has `select: false` on the schema so it is never returned
    const user = await User.findById(auth.userId).lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return res.json({
      success: true,
      data: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/users/me
 *
 * Updates the authenticated user's name and/or email.
 */
export const updateMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const auth = req.auth as AuthPayload;

    if (!auth?.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { name, email } = req.body as { name?: string; email?: string };

    // Only allow safe fields — never let clients patch password or role here
    const update: Partial<{ name: string; email: string }> = {};
    if (name !== undefined) update.name = name.trim();
    if (email !== undefined) update.email = email.trim().toLowerCase();

    if (Object.keys(update).length === 0) {
      throw new AppError("No valid fields provided", 400);
    }

    const updated = await User.findByIdAndUpdate(
      auth.userId,
      { $set: update },
      { new: true, runValidators: true },
    ).lean();

    if (!updated) {
      throw new AppError("User not found", 404);
    }

    return res.json({
      success: true,
      data: {
        id: updated._id.toString(),
        name: updated.name,
        email: updated.email,
      },
    });
  } catch (err) {
    next(err);
  }
};
