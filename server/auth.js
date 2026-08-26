import "dotenv/config";
import { betterAuth } from "better-auth";
import { pool } from "./db.js";

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error(
    "BETTER_AUTH_SECRET is not set. Copy .env.example to .env and add a generated secret."
  );
}

// Render injects RENDER_EXTERNAL_URL with the service's public https URL,
// so a fresh deploy gets a working baseURL/trustedOrigins without a manual
// post-deploy env var round trip.
const publicURL =
  process.env.BETTER_AUTH_URL || process.env.RENDER_EXTERNAL_URL;

export const auth = betterAuth({
  database: pool,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: publicURL || `http://localhost:${process.env.PORT || 3001}`,
  // In dev, the browser's page origin is the Vite server (:5173), which proxies
  // /api to Express (:3001) — so browser requests carry Origin: :5173 even
  // though they land here. In prod both are served from the same origin.
  trustedOrigins: [process.env.CLIENT_ORIGIN || publicURL || "http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
  },
});
