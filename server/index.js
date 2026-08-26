import "dotenv/config";
import express from "express";
import { toNodeHandler } from "better-auth/node";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { auth } from "./auth.js";
import productsRouter from "./routes/products.js";
import ordersRouter from "./routes/orders.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Better Auth needs the raw request body, so it must be mounted before
// express.json(). app.use() prefix-matches every sub-path under /api/auth.
app.use("/api/auth", toNodeHandler(auth));

app.use(express.json());

app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);

// Serve the built frontend (present after `npm run build`), so this one
// process is the whole deployable app in production.
const distPath = path.join(__dirname, "..", "dist");
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  app.use((req, res, next) => {
    if (req.method !== "GET" || req.path.startsWith("/api")) return next();
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
