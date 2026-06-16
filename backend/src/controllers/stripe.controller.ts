// src/controllers/stripe.controller.ts
import Stripe from "stripe";
import { env } from "../config/env";
import { Request, Response } from "express";
import { AppError } from "../errors/app-error";
import { Workspace } from "../models/workspace.model";
import { stripePriceToWorkspacePlan } from "../utils/stripe-plan-map";
import { updateSeatOverflowState } from "../services/workspace-seat.service";
import { enforceSeatLimitAfterPlanChange } from "../services/billing-enforcement.service";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined");
}

// controllers/stripe.controller.ts

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).send("Missing Stripe signature");
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const workspaceId = session.metadata?.workspaceId;

        if (!workspaceId) break;

        await Workspace.findByIdAndUpdate(workspaceId, {
          "billing.stripeCustomerId": session.customer,
          "billing.stripeSubscriptionId": session.subscription,
          billingStatus: "ACTIVE",
        });

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;

        const workspace = await Workspace.findOne({
          "billing.stripeSubscriptionId": subscription.id,
        });

        if (!workspace) break;

        const priceNickname = subscription.items.data[0]?.price.nickname;

        await Workspace.findByIdAndUpdate(workspace._id, {
          plan: stripePriceToWorkspacePlan(priceNickname),
          billingStatus:
            subscription.status === "active"
              ? "ACTIVE"
              : subscription.status === "trialing"
                ? "TRIALING"
                : "PAST_DUE",
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await Workspace.findOneAndUpdate(
          { "billing.stripeSubscriptionId": subscription.id },
          {
            plan: "FREE",
            billingStatus: "CANCELED",
            "billing.stripeSubscriptionId": null,
          },
        );

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;

        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (!customerId) break;

        await Workspace.findOneAndUpdate(
          { "billing.stripeCustomerId": customerId },
          { billingStatus: "ACTIVE" },
        );

        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;

        const customerId =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;

        if (!customerId) break;

        await Workspace.findOneAndUpdate(
          { "billing.stripeCustomerId": customerId },
          { billingStatus: "PAST_DUE" },
        );

        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error("❌ Webhook processing error:", error);
    res.status(500).json({ error: "Webhook failed" });
  }
};
