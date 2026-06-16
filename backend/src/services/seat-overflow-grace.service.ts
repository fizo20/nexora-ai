//  src/services/seat-overflow-grace.service.ts
import { Workspace } from "../models/workspace.model";

const GRACE_DAYS = 7;

/**
 * Auto-suspend workspaces that ignore overflow cleanup
 */
export const enforceOverflowGraceTimeout = async () => {
  const cutoff = new Date(Date.now() - GRACE_DAYS * 86400000);

  const result = await Workspace.updateMany(
    {
      seatOverflow: true,
      seatOverflowDetectedAt: { $lt: cutoff },
    },
    {
      status: "SUSPENDED",
    },
  );

  if (result.modifiedCount > 0) {
    console.warn(
      `🚨 ${result.modifiedCount} workspaces auto-suspended after grace period`,
    );
  }
};
