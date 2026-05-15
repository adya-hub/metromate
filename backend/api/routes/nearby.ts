/**
 * api/routes/nearby.ts
 *
 * GET /api/nearby?lat=28.63&lon=77.22&radius=500&limit=5
 *
 * Returns stops within `radius` meters of a coordinate.
 * WHY: A simple O(n) scan over 10k stops costs ~1ms — acceptable for
 * nearby queries. For 100k+ stops, use a k-d tree or spatial index.
 */

import { Router, Request, Response } from "express";
import { getStore } from "../dataStore";

const router = Router();

/** Haversine distance in meters between two lat/lon points */
function haversineMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6_371_000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get("/", (req: Request, res: Response) => {
  const lat = parseFloat(String(req.query.lat));
  const lon = parseFloat(String(req.query.lon));
  const radius = Math.min(5000, Math.max(100, parseFloat(String(req.query.radius)) || 500));
  const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit)) || 5));

  if (isNaN(lat) || isNaN(lon)) {
    res.status(400).json({ error: "lat and lon are required and must be numbers" });
    return;
  }

  const mode = req.baseUrl.includes("bus") ? "bus" : "metro";
  const { stops } = getStore(mode);

  const nearby = stops
    .map((s) => ({
      ...s,
      distance_m: Math.round(haversineMeters(lat, lon, s.stop_lat, s.stop_lon)),
    }))
    .filter((s) => s.distance_m <= radius)
    .sort((a, b) => a.distance_m - b.distance_m)
    .slice(0, limit);

  res.json({
    center: { lat, lon },
    radius_m: radius,
    count: nearby.length,
    stops: nearby,
  });
});

export default router;
