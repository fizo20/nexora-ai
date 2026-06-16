// src/types/express.d.ts

import { Types } from "mongoose";
import { PlanFeatures } from "../config/plan-features";
import { AuthPayload, IdentityPayload } from "../types/auth.types";

declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by auth middleware.
       * Can be:
       * - IdentityPayload (before workspace selected)
       * - AuthPayload (after workspace selected)
       */
      auth?: IdentityPayload | AuthPayload;

      /**
       * Populated by workspace middleware
       */
      workspace?: {
        id: Types.ObjectId;
        plan: "FREE" | "PRO" | "ENTERPRISE";
        features: PlanFeatures;
      };
    }
  }
}
