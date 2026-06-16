// src/middlewares/validate.middleware.ts
import { ZodSchema, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/app-error";

export const validate =
  (schema: ZodSchema) =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        params: req.params,
        query: req.query
      });

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const message = error.issues
          .map((issue) => issue.message)
          .join(", ");

        return next(new AppError(message, 400));
      }

      next(error);
    }
  };

