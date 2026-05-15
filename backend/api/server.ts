/**
 * api/server.ts
 *
 * The Express HTTP server.
 *
 * WHY this architecture:
 *   - All pre-processed JSON is loaded ONCE into RAM at startup.
 *   - Every API request is answered from memory — no disk I/O per request.
 *   - CORS is enabled so the Next.js frontend (localhost:3000) can call
 *     this API server (localhost:3001) during development.
 *   - Gzip compression via `compression` middleware halves response sizes.
 *   - Cache-Control headers let the CDN/browser cache static lists.
 */

import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { initDataStore } from "./dataStore";

// Route handlers
import stopsRouter from "./routes/stops";
import searchRouter from "./routes/search";
import routesRouter from "./routes/routes";
import routePlanRouter from "./routes/routePlan";
import nearbyRouter from "./routes/nearby";
import liveMetroRouter from "./routes/liveMetro";

const app = express();
const PORT = parseInt(process.env.PORT ?? "3001", 10);

// ──────────────────────────────────────────────────────────────────────────────
// Middleware
// ──────────────────────────────────────────────────────────────────────────────

app.use(helmet()); // Security headers
app.use(morgan("combined")); // Request logging

// Rate limiting for production stability
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

app.use(compression()); // Gzip all responses

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002", // Next.js fallback port
      /\.vercel\.app$/,
      process.env.FRONTEND_URL ?? "",
    ].filter(Boolean),
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "1mb" }));

// ──────────────────────────────────────────────────────────────────────────────
// Cache helpers
// ──────────────────────────────────────────────────────────────────────────────

/** Cache static list endpoints for 5 minutes */
function cachePublic(maxAgeSeconds = 300) {
  return (_req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.setHeader("Cache-Control", `public, max-age=${maxAgeSeconds}, stale-while-revalidate=60`);
    next();
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Routes
// ──────────────────────────────────────────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Legacy / Default (Metro)
app.use("/api/stops",      cachePublic(300), stopsRouter);
app.use("/api/search",     cachePublic(60),  searchRouter);
app.use("/api/routes",     cachePublic(300), routesRouter);
app.use("/api/route-plan", routePlanRouter);
app.use("/api/nearby",     nearbyRouter);

// Explicit Metro APIs
app.use("/api/metro/stops",      cachePublic(300), stopsRouter);
app.use("/api/metro/search",     cachePublic(60),  searchRouter);
app.use("/api/metro/routes",     cachePublic(300), routesRouter);
app.use("/api/metro/route-plan", routePlanRouter);
app.use("/api/metro/nearby",      nearbyRouter);
app.use("/api/metro",             liveMetroRouter);
console.log('[Server] Metro realtime routes mounted at /api/metro');

// Explicit Bus APIs
app.use("/api/bus/stops",      cachePublic(300), stopsRouter);
app.use("/api/bus/search",     cachePublic(60),  searchRouter);
app.use("/api/bus/routes",     cachePublic(300), routesRouter);
app.use("/api/bus/route-plan", routePlanRouter);
app.use("/api/bus/nearby",     nearbyRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[server] Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ──────────────────────────────────────────────────────────────────────────────
// Startup
// ──────────────────────────────────────────────────────────────────────────────

try {
  initDataStore();
} catch (err) {
  console.error(err);
  console.error("\n⚠️  Run 'cd backend && npm run preprocess' first to generate data files.\n");
  process.exit(1);
}

app.listen(PORT, () => {
  console.log(`\n🚌 Delhi Bus API running at http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Search: http://localhost:${PORT}/api/search?q=rajiv`);
  console.log(`   Nearby: http://localhost:${PORT}/api/nearby?lat=28.63&lon=77.22\n`);
});

export default app;
