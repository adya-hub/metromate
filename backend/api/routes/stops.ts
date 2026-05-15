/**
 * api/routes/stops.ts
 *
 * GET /api/stops
 *   Returns paginated list of all stops.
 *   ?page=1&limit=50
 *
 * GET /api/stops/:id
 *   Returns single stop by stop_id.
 */

import { Router, Request, Response } from "express";
import { getStore } from "../dataStore";

const router = Router();

// GET /api/stops?page=1&limit=50
router.get("/", (req: Request, res: Response) => {
  const page = Math.max(1, parseInt(String(req.query.page)) || 1);
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit)) || 50));
  const offset = (page - 1) * limit;

  const mode = req.baseUrl.includes("bus") ? "bus" : "metro";
  const { stops } = getStore(mode);

  const slice = stops.slice(offset, offset + limit);

  res.json({
    total: stops.length,
    page,
    limit,
    pages: Math.ceil(stops.length / limit),
    stops: slice,
  });
});

// GET /api/stops/:id
router.get("/:id", (req: Request, res: Response) => {
  const mode = req.baseUrl.includes("bus") ? "bus" : "metro";
  const { stopsById } = getStore(mode);
  
  const stop = stopsById.get(req.params.id);
  if (!stop) {
    res.status(404).json({ error: "Stop not found" });
    return;
  }
  res.json(stop);
});

export default router;
