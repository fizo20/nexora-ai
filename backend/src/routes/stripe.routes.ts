//  src/routes/stripe.routes.ts
import { Router } from "express";
import { stripeWebhookHandler } from "../controllers/stripe.controller";
import bodyParser from "body-parser";

const router = Router();

/**
 * Stripe Webhook Route
 * IMPORTANT: Must use raw body parser
 * and must be registered BEFORE express.json() middleware
 */
router.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  stripeWebhookHandler,
);

export default router;
