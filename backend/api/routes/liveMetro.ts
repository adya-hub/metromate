/**
 * backend/api/routes/liveMetro.ts
 *
 * Secure proxy routes for the DMRC Real-Time API.
 * All external API calls happen server-side only — API keys never reach the browser.
 *
 * Architecture:
 *   Frontend  →  /api/metro/live/*  →  This proxy  →  DMRC API
 *
 * Caching strategy:
 *   - train arrivals  → 15 sec TTL
 *   - line status     → 30 sec TTL
 *   - alerts          → 60 sec TTL
 *   - platform info   → 30 sec TTL
 */

import { Router, Request, Response } from "express";
import path from "path";
import fs from "fs";
import LiveMetroService, { TrainArrival, LineStatus } from "../services/liveMetroService";

const router = Router();
const liveService = LiveMetroService.getInstance();

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/live-status  — All line statuses
// ──────────────────────────────────────────────────────────────────────────────

router.get("/live-status", async (_req: Request, res: Response) => {
  console.log('[LiveMetro] /live-status hit');
  try {
    const lines = await liveService.getLineStatuses();
    
    // Deduplicate lines by name for cleaner UI
    const uniqueLinesMap = new Map<string, LineStatus>();
    lines.forEach(l => {
      if (!uniqueLinesMap.has(l.name) || l.status === 'operational') {
        uniqueLinesMap.set(l.name, l);
      }
    });
    
    const uniqueLines = Array.from(uniqueLinesMap.values());

    res.json({
      success: true,
      source: "live",
      realtime_available: true,
      vehicle_count: liveService.getRawFeedInfo().cachedVehicleCount,
      lines: uniqueLines.length > 0 ? uniqueLines : FALLBACK_LINE_STATUS,
    });
  } catch (err) {
    res.json({
      success: false,
      source: "fallback",
      realtime_available: false,
      lines: FALLBACK_LINE_STATUS,
    });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/arrivals/:stationId  — Next trains at a station
// ──────────────────────────────────────────────────────────────────────────────

router.get("/arrivals/:stationId", async (req: Request, res: Response) => {
  const { stationId } = req.params;
  console.log(`[LiveMetro] /arrivals/${stationId} hit`);
  
  try {
    const arrivals = await liveService.getArrivals(stationId);
    
    res.json({
      success: true,
      source: arrivals.length > 0 ? "live" : "fallback",
      realtime_available: arrivals.length > 0,
      station_id: stationId,
      arrivals: arrivals.length > 0 ? arrivals : generateFallbackArrivals(stationId),
    });
  } catch (err) {
    res.json({
      success: false,
      source: "fallback",
      realtime_available: false,
      station_id: stationId,
      arrivals: generateFallbackArrivals(stationId),
    });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/vehicles — Current train positions
// ──────────────────────────────────────────────────────────────────────────────

router.get("/vehicles", async (_req: Request, res: Response) => {
  console.log('[LiveMetro] /vehicles hit');
  try {
    const vehicles = await (liveService as any).fetchFeed(); 
    if (!vehicles) return res.json({ source: "live", count: 0, vehicles: [] });

    // Enrich vehicles with route info (colors, names)
    const enriched = vehicles.map((v: any) => {
      const vehicle = v.vehicle;
      const route = (liveService as any).routes.find((r: any) => r.route_id.toString() === vehicle.trip.routeId.toString());
      
      return {
        id: vehicle.vehicle.id,
        trip_id: vehicle.trip.tripId,
        route_id: vehicle.trip.routeId,
        line_name: route?.name || "Metro",
        color: route?.color || "#8B5CF6",
        latitude: vehicle.position.latitude,
        longitude: vehicle.position.longitude,
        speed: vehicle.position.speed,
        heading: vehicle.position.bearing || 0,
        timestamp: new Date(parseInt(vehicle.timestamp) * 1000).toISOString(),
        label: vehicle.vehicle.label || vehicle.vehicle.id
      };
    });

    res.json({
      success: true,
      source: "live",
      count: enriched.length,
      vehicles: enriched
    });
  } catch (err) {
    console.error('[LiveMetro] Vehicles fetch failed:', err);
    res.status(500).json({ success: false, error: "Failed to fetch vehicles" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/debug — System health
// ──────────────────────────────────────────────────────────────────────────────

router.get("/debug", async (_req: Request, res: Response) => {
  console.log('[LiveMetro] /debug hit');
  res.json({
    service: "LiveMetroService",
    status: "active",
    last_update: (liveService as any).lastUpdate,
    cache_size: (liveService as any).cachedVehicles.length,
    timestamp: new Date().toISOString()
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/alerts — System-wide alerts
// ──────────────────────────────────────────────────────────────────────────────

router.get("/alerts", async (_req: Request, res: Response) => {
  console.log('[LiveMetro] /alerts hit');
  res.json({
    source: "static",
    realtime_available: false,
    alerts: FALLBACK_ALERTS,
  });
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/vehicle-stats — Vehicle classification stats
// ──────────────────────────────────────────────────────────────────────────────

router.get("/vehicle-stats", async (_req: Request, res: Response) => {
  console.log('[LiveMetro] /vehicle-stats hit');
  res.json(liveService.getVehicleStats());
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/raw-feed-info — Raw GTFS-RT telemetry
// ──────────────────────────────────────────────────────────────────────────────

router.get("/raw-feed-info", async (_req: Request, res: Response) => {
  console.log('[LiveMetro] /raw-feed-info hit');
  res.json(liveService.getRawFeedInfo());
});

router.get("/stops", async (_req: Request, res: Response) => {
  try {
    const stopsPath = path.resolve(__dirname, "../../generated/metro/optimized_stops.json");
    if (fs.existsSync(stopsPath)) {
      const data = fs.readFileSync(stopsPath, "utf-8");
      res.json({
        success: true,
        stops: JSON.parse(data)
      });
    } else {
      res.status(404).json({ success: false, error: "Stops not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load stops" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/geometry — Full network geometry
// ──────────────────────────────────────────────────────────────────────────────

router.get("/geometry", async (_req: Request, res: Response) => {
  try {
    const geoPath = path.resolve(__dirname, "../../generated/metro/network_geometry.json");
    if (fs.existsSync(geoPath)) {
      const data = fs.readFileSync(geoPath, "utf-8");
      res.json({
        success: true,
        geometry: JSON.parse(data)
      });
    } else {
      res.status(404).json({ success: false, error: "Geometry not found" });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: "Failed to load geometry" });
  }
});

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/metro/platform/:stationId  — Platform information
// ──────────────────────────────────────────────────────────────────────────────

router.get("/platform/:stationId", async (req: Request, res: Response) => {
  const { stationId } = req.params;
  console.log(`[LiveMetro] /platform/${stationId} hit`);
  const data = { 
    platforms: [
      { number: 1, direction: "Platform 1" }, 
      { number: 2, direction: "Platform 2" }
    ] 
  };
  res.json({ source: "static", realtime_available: false, station_id: stationId, ...data });
});

// ──────────────────────────────────────────────────────────────────────────────
// Fallback data — shown when the API is unavailable
// ──────────────────────────────────────────────────────────────────────────────

const FALLBACK_LINE_STATUS: LineStatus[] = [
  { line_id: "red",     name: "Red Line",     color: "#EF4444", status: "operational", message: "Good Service", frequency_mins: 6 },
  { line_id: "yellow",  name: "Yellow Line",  color: "#FACC15", status: "operational", message: "Good Service", frequency_mins: 4 },
  { line_id: "blue",    name: "Blue Line",    color: "#3B82F6", status: "operational", message: "Good Service", frequency_mins: 4 },
  { line_id: "green",   name: "Green Line",   color: "#22C55E", status: "operational", message: "Good Service", frequency_mins: 7 },
  { line_id: "violet",  name: "Violet Line",  color: "#8B5CF6", status: "operational", message: "Good Service", frequency_mins: 6 },
  { line_id: "pink",    name: "Pink Line",    color: "#EC4899", status: "operational", message: "Good Service", frequency_mins: 5 },
  { line_id: "magenta", name: "Magenta Line", color: "#BE185D", status: "operational", message: "Good Service", frequency_mins: 5 },
  { line_id: "gray",    name: "Gray Line",    color: "#9CA3AF", status: "operational", message: "Good Service", frequency_mins: 10 },
  { line_id: "orange",  name: "Airport Line", color: "#F97316", status: "operational", message: "Good Service", frequency_mins: 15 },
];

const FALLBACK_ALERTS: any[] = [];

function generateFallbackArrivals(stationId: string): TrainArrival[] {
  const seed = parseInt(stationId) || 1;
  const lines = [
    { name: "Yellow Line", color: "#FACC15", destinations: ["Samaypur Badli", "HUDA City Centre"] },
    { name: "Blue Line",   color: "#3B82F6", destinations: ["Dwarka Sector 21", "Noida Electronic City"] },
    { name: "Red Line",    color: "#EF4444", destinations: ["Rithala", "Shaheed Sthal"] },
  ];
  const line = lines[seed % lines.length];
  return [
    {
      station_id: stationId,
      station_name: "Station",
      line_name: line.name,
      line_color: line.color,
      platform: 1,
      direction: "Towards " + line.destinations[0],
      destination: line.destinations[0],
      eta_minutes: 3 + (seed % 5),
      is_last_train: false,
    },
    {
      station_id: stationId,
      station_name: "Station",
      line_name: line.name,
      line_color: line.color,
      platform: 2,
      direction: "Towards " + line.destinations[1],
      destination: line.destinations[1],
      eta_minutes: 8 + (seed % 5),
      is_last_train: false,
    },
  ];
}

export default router;
