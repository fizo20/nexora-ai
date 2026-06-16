// src/server.ts
import "./config/env";
import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import "./tools";
import { startAutonomousRunner } from "./services/ai-autonomous-runner.service";
import http from "http";
import { initializeSocket } from "./socket/socket.server";

const startServer = async () => {
  try {
    await connectDatabase();

    const server = http.createServer(app);

    initializeSocket(server);

    server.listen(env.PORT, () => {
      console.log(`Nexora backend running on port ${env.PORT}`);

      startAutonomousRunner(120000);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
  }
};

startServer();

console.log("Stripe key loaded:", !!process.env.STRIPE_SECRET_KEY);
