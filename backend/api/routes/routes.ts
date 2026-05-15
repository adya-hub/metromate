/**
 * api/routes/routes.ts
 *
 * GET /api/routes           - paginated list of all bus routes
 * GET /api/routes/:id       - single route details
 * GET /api/routes/:id/stops - all stops on a route
 */

import { Router, Request, Response } from "express";
import { getStore } from "../dataStore";

const router = Router();

// GET /api/routes?page=1&limit=50
router.get("/", (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page)) || 1);
  const limit = Math.min(200, parseInt(String(req.query.limit)) || 50);
  const offset = (page - 1) * limit;

  const mode = req.baseUrl.includes("bus") ? "bus" : "metro";
  const { routes } = getStore(mode);

  res.json({
    total: routes.length,
    page,
    limit,
    routes: routes.slice(offset, offset + limit),
  });
});

// GET /api/routes/:id
router.get("/:id", (req: Request, res: Response) => {
  const mode = req.baseUrl.includes("bus") ? "bus" : "metro";
  const { routesById } = getStore(mode);

  const route = routesById.get(req.params.id);
  if (!route) {
    res.status(404).json({ error: "Route not found" });
    return;
  }
  res.json(route);
});

export default router;
