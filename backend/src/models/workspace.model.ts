// src/models/workspace.model.ts
import { Schema, model, Types, Document } from "mongoose";

export type WorkspacePlan = "FREE" | "PRO" | "ENTERPRISE";
export type WorkspaceStatus = "ACTIVE" | "SUSPENDED";
export type BillingStatus = "ACTIVE" | "TRIALING" | "PAST_DUE" | "CANCELED";

export interface IWorkspace extends Document {
  name: string;
  slug: string;
  owner: Types.ObjectId;

  /**
   * Product plan (feature tier)
   * This is your app-level plan
   */
  plan: WorkspacePlan;

  /**
   * Workspace operational state
   */
  status: WorkspaceStatus;

  /**
   * Billing lifecycle (high-level, app-facing)
   */
  billingStatus: BillingStatus;

  /**
   * Legacy / convenience fields
   */
  trialStartedAt?: Date;

  trialEndsAt?: Date;
  subscriptionId?: string;

  /**
   * Stripe billing persistence (source of truth)
   */
  billing?: {
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;

    status?: BillingStatus;

    priceId?: string;
    planCode?: WorkspacePlan;

    currentPeriodEnd?: Date | null;
    cancelAtPeriodEnd?: boolean;
    trialEndsAt?: Date | null;
  };

  seatOverflow?: boolean;

  seatOverflowDetectedAt?: Date;

  aiEnabled?: boolean;
  aiSuspendedAt?: Date | null;

  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<IWorkspace>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },

    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /**
     * Product plan (feature tier)
     */
    plan: {
      type: String,
      enum: ["FREE", "PRO", "ENTERPRISE"],
      default: "FREE",
      required: true,
    },

    /**
     * Workspace operational state
     */
    status: {
      type: String,
      enum: ["ACTIVE", "SUSPENDED"],
      default: "ACTIVE",
      required: true,
    },

    /**
     * Billing lifecycle (app-level)
     */
    billingStatus: {
      type: String,
      enum: ["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED"],
      default: "ACTIVE",
      required: true,
    },

    /**
     * Legacy / convenience fields
     */
    trialStartedAt: {
      type: Date,
      default: Date.now,
    },

    trialEndsAt: {
      type: Date,
    },

    subscriptionId: {
      type: String,
    },

    /**
     * Stripe billing persistence
     */

    billing: {
      stripeCustomerId: {
        type: String,
        index: true,
      },

      stripeSubscriptionId: {
        type: String,
        index: true,
      },

      status: {
        type: String,
        enum: ["ACTIVE", "TRIALING", "PAST_DUE", "CANCELED"],
      },

      priceId: {
        type: String,
      },

      planCode: {
        type: String,
        enum: ["FREE", "PRO", "ENTERPRISE"],
      },

      currentPeriodEnd: {
        type: Date,
      },

      cancelAtPeriodEnd: {
        type: Boolean,
        default: false,
      },

      trialEndsAt: {
        type: Date,
      },
    },

    seatOverflow: {
      type: Boolean,
      default: false,
    },
    seatOverflowDetectedAt: {
      type: Date,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
    aiEnabled: { type: Boolean, default: true },
    aiSuspendedAt: { type: Date },
  },
  {
    timestamps: true,
  },
);

export const Workspace = model<IWorkspace>("Workspace", workspaceSchema);
