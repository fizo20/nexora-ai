// src/services/billing.service.ts
import Stripe from "stripe";
import { env } from "../config/env";
import { Workspace } from "../models/workspace.model";
import { AppError } from "../errors/app-error";

/**
 * Stripe client
 * Uses same API version as your webhook controller
 */
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

/**
 * Plan → Stripe price mapping
 * Central place so pricing is not scattered in code
 */
const PLAN_PRICE_MAP = {
  PRO: env.STRIPE_PRICE_PRO,
  ENTERPRISE: env.STRIPE_PRICE_ENTERPRISE,
};

/**
 * Create Stripe Checkout Session for workspace upgrade
 */
export const createUpgradeCheckoutSession = async (
  workspaceId: string,
  targetPlan: "PRO" | "ENTERPRISE",
) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  const priceId = PLAN_PRICE_MAP[targetPlan];

  if (!priceId) {
    throw new AppError("Stripe price not configured for plan", 500);
  }

  /* =======================================
     🔥 ENSURE CUSTOMER EXISTS HERE TOO
  ======================================= */
  let customerId = workspace.billing?.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: {
        workspaceId: workspace.id,
      },
    });

    workspace.billing = {
      ...workspace.billing,
      stripeCustomerId: customer.id,
    };

    await workspace.save();

    customerId = customer.id;
  }

  /* ---------- Create checkout session ---------- */
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",

    customer: customerId, // 🔥 IMPORTANT

    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],

    success_url: "http://localhost:3000/billing/success",
    cancel_url: "http://localhost:3000/billing/cancel",

    metadata: {
      workspaceId: workspace.id,
    },

    subscription_data: {
      metadata: {
        workspaceId: workspace.id,
      },
    },
  });

  return session.url;
};

/**
 * Create Stripe Customer Portal Session
 */
export const createCustomerPortalSession = async (workspaceId: string) => {
  const workspace = await Workspace.findById(workspaceId);

  if (!workspace) {
    throw new AppError("Workspace not found", 404);
  }

  let customerId = workspace.billing?.stripeCustomerId;

  /* =======================================
     🔥 FIX: AUTO-CREATE STRIPE CUSTOMER
  ======================================= */
  if (!customerId) {
    const customer = await stripe.customers.create({
      metadata: {
        workspaceId: workspace.id,
      },
    });

    // Save to DB
    workspace.billing = {
      ...workspace.billing,
      stripeCustomerId: customer.id,
    };

    await workspace.save();

    customerId = customer.id;
  }

  /* ---------- Create portal session ---------- */
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: "http://localhost:3000/dashboard/billing",
  });

  return session.url;
};
