/* // types/express.types.ts
import { Request } from "express";
import { AuthPayload } from "./auth.types";

export interface WorkspaceRequest extends Request {
  auth: {
    userId: string;
    workspaceId: string;
  };
}
 */

import { Request } from "express";
import { AuthPayload } from "./auth.types";

export interface WorkspaceRequest extends Request {
  auth: AuthPayload & {
    workspaceId: string;
  };
}
