// src/config/env.ts
import dotenv from "dotenv";
import path from "path";
import Stripe from "stripe";
// 🔥 Force absolute path to backend/.env
dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

console.log("ENV CHECK:", {
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
});

const requiredEnv = [
  "MONGO_URI",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 4000,

  MONGO_URI: process.env.MONGO_URI!,

  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,

  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,

  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,

  STRIPE_METERED_PRICE_ID: process.env.STRIPE_METERED_PRICE_ID!,

  STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO as string,
  STRIPE_PRICE_ENTERPRISE: process.env.STRIPE_PRICE_ENTERPRISE as string,
};

// Optional safety check (recommended)
if (
  !env.ACCESS_TOKEN_SECRET ||
  !env.REFRESH_TOKEN_SECRET ||
  !env.STRIPE_SECRET_KEY ||
  !env.STRIPE_WEBHOOK_SECRET
) {
  throw new Error("Missing required environment variables");
}
