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
// FIX: GET /api/users/me and PATCH /api/users/me were called by the profile
// page but were never registered in the backend — causing persistent 404s.
import usersRoutes from "./routes/users.routes";
// FIX: GET /api/security/sessions, DELETE /api/security/sessions/:id,
// GET /api/security/login-history — same missing-routes issue.
import securityRoutes from "./routes/security.routes";

const app: Application = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
/**
 * 🚨 Stripe webhook must be mounted BEFORE express.json()
 */

app.use("/webhooks", stripeRoutes);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes); // GET /me, PATCH /me
app.use("/api/security", securityRoutes); // sessions + login-history
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

// Global error handler (must be last)
app.use(globalErrorHandler);

// Health check endpoint
app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "nexora-backend",
  });
});

export default app;
