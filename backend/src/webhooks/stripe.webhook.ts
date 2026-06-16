// src/webhooks/stripe.webhook.ts
import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "../config/stripe";
import { Workspace } from "../models/workspace.model";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  let event: Stripe.Event;

  try {
    const signature = req.headers["stripe-signature"];

    if (!signature || typeof signature !== "string") {
      return res.status(400).send("Missing Stripe signature");
    }

    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;

        const workspaceId = session.metadata?.workspaceId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!workspaceId) break;

        await Workspace.findByIdAndUpdate(workspaceId, {
          "billing.stripeCustomerId": customerId,
          "billing.stripeSubscriptionId": subscriptionId,
          "billing.status": "ACTIVE",
        });

        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const subscription = event.data.object as Stripe.Subscription;

        await Workspace.findOneAndUpdate(
          { "billing.stripeSubscriptionId": subscription.id },
          {
            "billing.status":
              subscription.status === "active" ? "ACTIVE" : "PAST_DUE",
          },
        );

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;

        await Workspace.findOneAndUpdate(
          { "billing.stripeSubscriptionId": subscription.id },
          {
            "billing.status": "CANCELED",
            "billing.plan": "FREE",
            "billing.stripeSubscriptionId": null,
          },
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
          { "billing.status": "PAST_DUE" },
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
          { "billing.status": "ACTIVE" },
        );

        break;
      }

      default:
        break;
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook processing error:", error);
    return res.status(500).json({ error: "Webhook handler failed" });
  }
};
