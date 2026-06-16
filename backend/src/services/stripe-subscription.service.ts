// src/services/stripe-subscription.service.ts
import { stripe } from "../config/stripe";
import { env } from "../config/env";

/**
 * Creates subscription with:
 * - PRO base plan
 * - Metered api_calls price
 */
export const createStripeSubscription = async (
  stripeCustomerId: string,
  workspaceId: string,
) => {
  return await stripe.subscriptions.create({
    customer: stripeCustomerId,

    metadata: {
      workspaceId, // 🔥 CRITICAL LINK
    },

    items: [
      {
        price: env.STRIPE_PRICE_PRO,
      },
      {
        price: env.STRIPE_METERED_PRICE_ID,
      },
    ],
  });
};
