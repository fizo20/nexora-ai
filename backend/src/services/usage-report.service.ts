// src/services/usage-report.service.ts
import mongoose from "mongoose";
import Stripe from "stripe";
import { env } from "../config/env";
import { Workspace } from "../models/workspace.model";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

/**
 * Record internal usage (Mongo)
 */
export const recordUsage = async (
  workspaceId: string,
  metric: string,
  quantity: number,
) => {
  await mongoose.connection.collection("usage_events").insertOne({
    workspaceId: new mongoose.Types.ObjectId(workspaceId),
    metric,
    quantity,
    createdAt: new Date(),
  });
};

/**
 * Report usage to Stripe Meter (PRO billing)
 */
export const reportUsageToStripe = async (
  workspaceId: string,
  quantity: number,
): Promise<void> => {
  try {
    if (quantity <= 0) return;

    const workspace = await Workspace.findById(workspaceId);

    const stripeCustomerId = workspace?.billing?.stripeCustomerId;

    // 🔥 CRITICAL: Skip for FREE users (no Stripe yet)
    if (!stripeCustomerId) {
      console.warn("⚠️ Stripe usage skipped (no customer)");
      return;
    }

    await stripe.billing.meterEvents.create({
      event_name: "api_calls",
      payload: {
        stripe_customer_id: stripeCustomerId,
        value: quantity.toString(),
      },
    });
  } catch (error) {
    console.error("❌ Stripe usage error:", error);
  }
};
