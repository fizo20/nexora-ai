// src/app.ts
import express, { Application } from "express";
import stripeRoutes from "./routes/stripe.routes";
import { globalErrorHandler } from "./middlewares/error.middleware";

import presenceRoutes from "./routes/presence.routes";

import bodyParser from "body-parser";
import { stripeWebhookHandler } from "./webhooks/stripe.webhook";
import workspaceSeatRoutes from "./routes/workspace-seat.routes";
import billingRoutes from "./routes/billing.routes";
import workspaceSeatCleanupRoutes from "./routes/workspace-seat-cleanup.routes";
import tasksRoutes from "./routes/tasks.routes";
import aiRoutes from "./routes/ai.routes";
import aiAuditRoutes from "./routes/ai-audit.routes";
import auditRoutes from "./routes/audit.routes";
import workspaceMetricsRoutes from "./routes/workspace-metrics.routes";
import aiAssistantRoutes from "./routes/ai-assistant.routes";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
import workspaceRoutes from "./routes/workspace.routes";
import projectRoutes from "./routes/projects.routes";
import router from "./routes/ai-conversation.routes";
import aiActivityRoutes from "./routes/ai-activity.routes";
import analyticsRoutes from "./routes/analytics.routes";
import settingsRoutes from "./routes/settings.routes";
import usersRoutes from "./routes/users.routes";
import securityRoutes from "./routes/security.routes";

const app: Application = express();

// ---------------------------------------------------------------------------
// CORS — supports multiple allowed origins from the CLIENT_URL env variable.
//
// On Render, set CLIENT_URL to a comma-separated list of every Vercel URL
// that should be allowed, e.g.:
//
//   CLIENT_URL=https://nexora-ai-rho-ashy.vercel.app,https://nexora-n68v0m13z-fizo20s-projects.vercel.app
//
// http://localhost:3000 is always permitted in all environments so local dev
// works without touching .env.
// ---------------------------------------------------------------------------
const rawOrigins = process.env.CLIENT_URL ?? "";
const allowedOrigins: string[] = [
  "http://localhost:3000",
  ...rawOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

app.use(
  cors({
    origin: (incomingOrigin, callback) => {
      // Server-to-server / curl requests have no Origin header — allow them.
      if (!incomingOrigin) return callback(null, true);

      if (allowedOrigins.includes(incomingOrigin)) {
        return callback(null, true);
      }

      console.warn(`[CORS] Rejected origin: ${incomingOrigin}`);
      callback(
        new Error(`CORS policy: origin '${incomingOrigin}' is not allowed`),
      );
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/**
 * Stripe webhook must be mounted BEFORE express.json() so the raw body
 * is available for signature verification.
 */
app.use("/webhooks", stripeRoutes);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/conversations", router);
app.use("/api", aiActivityRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/presence", presenceRoutes);

app.use("/api/workspace-seats", workspaceSeatRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/workspace/seats", workspaceSeatCleanupRoutes);
app.use("/api", tasksRoutes);

app.use("/api", aiAuditRoutes);
app.use("/api", auditRoutes);
app.use("/api/workspace", workspaceMetricsRoutes);
app.use("/api/ai/assistant", aiAssistantRoutes);
app.use("/api/ai", aiRoutes);

// Global error handler — must remain last
app.use(globalErrorHandler);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "nexora-backend" });
});

export default app;
