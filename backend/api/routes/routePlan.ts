/**
 * api/routes/routePlan.ts
 *
 * POST /api/route-plan
 * Body: { from_stop_id: string, to_stop_id: string }
 *
 * Runs Dijkstra on the pre-built metro adjacency list.
 */

import { Router, Request, Response } from "express";
import { getStore } from "../dataStore";
import { dijkstra } from "../../utils/graphBuilder";

const router = Router();

router.post("/", (req: Request, res: Response) => {
  const mode = req.baseUrl.includes("bus") ? "bus" : "metro";
  const { stopsById, routesById, graphAdj } = getStore(mode);

  const { from_stop_id, to_stop_id } = req.body as {
    from_stop_id?: string;
    to_stop_id?: string;
  };

  if (!from_stop_id || !to_stop_id) {
    res.status(400).json({ error: "from_stop_id and to_stop_id are required" });
    return;
  }

  if (!stopsById.has(from_stop_id) || !stopsById.has(to_stop_id)) {
    res.status(404).json({ error: "Stop(s) not found" });
    return;
  }

  // Helper to identify the line name for a route (used for interchange detection)
  const getRouteLine = (routeId: string) => {
    if (routeId === "VIRTUAL") return "Transfer";
    return routesById.get(routeId)?.name ?? routeId;
  };

  const result = dijkstra(graphAdj, from_stop_id, to_stop_id, getRouteLine);

  if (!result) {
    res.status(404).json({ error: "No metro route found between these stations" });
    return;
  }

  // Reconstruct path and calculate distance
  const pathWithDetails = [];
  let totalDistance = 0;

  for (let i = 0; i < result.path.length; i++) {
    const step = result.path[i];
    const station = stopsById.get(step.stop_id);
    const route = routesById.get(step.route_id);

    if (i > 0) {
      const prevStation = stopsById.get(result.path[i-1].stop_id);
      if (station && prevStation) {
        const d = calculateDistance(
          prevStation.stop_lat, prevStation.stop_lon,
          station.stop_lat, station.stop_lon
        );
        totalDistance += d;
      }
    }

    pathWithDetails.push({
      stop_id: step.stop_id,
      stop_name: station?.stop_name,
      line_name: route?.name || (step.route_id === "VIRTUAL" ? "Footbridge Transfer" : "Metro"),
      line_color: route?.color || (step.route_id === "VIRTUAL" ? "#9CA3AF" : "#8B5CF6"),
      is_interchange: station?.is_interchange || false,
      coords: [station?.stop_lat || 0, station?.stop_lon || 0]
    });
  }

  const distanceKm = Math.round(totalDistance * 10) / 10;
  
  // DMRC Fare Logic (approximate)
  let fare = 10;
  if (distanceKm > 2) fare = 20;
  if (distanceKm > 5) fare = 30;
  if (distanceKm > 12) fare = 40;
  if (distanceKm > 21) fare = 50;
  if (distanceKm > 32) fare = 60;

  res.json({
    mode,
    from: stopsById.get(from_stop_id)?.stop_name,
    to: stopsById.get(to_stop_id)?.stop_name,
    time_minutes: Math.ceil(result.timeSecs / 60),
    distance_km: distanceKm,
    num_stations: pathWithDetails.length,
    interchange_count: result.interchanges,
    fare,
    geometry: pathWithDetails.map(p => p.coords),
    path: pathWithDetails
  });
});

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default router;
