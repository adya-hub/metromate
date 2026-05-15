/**
 * scripts/preprocess.ts
 *
 * THE BIG PREPROCESSING PIPELINE (METRO EDITION)
 * ===============================================
 * Migrated from Bus GTFS to Metro GTFS.
 *
 * Processing order:
 *   1. stops.txt         → optimized_stops.json
 *   2. routes.txt        → optimized_routes.json (extracts line colors)
 *   3. trips.txt         → trip→route mapping
 *   4. stop_times.txt    → graph_edges.json + interchange detection
 *   5. fare_attributes   → optimized_fares.json
 */

import fs from "fs";
import path from "path";
import { streamCSV, readAllRows } from "../utils/csvStream";
import { buildGraphEdges } from "../utils/graphBuilder";
import { buildSearchIndex, normalizeName, StopEntry } from "../utils/searchIndex";

// ──────────────────────────────────────────────────────────────────────────────
// PATHS & CONFIG
// ──────────────────────────────────────────────────────────────────────────────
const mode = process.argv.includes("bus") ? "bus" : "metro";

const GTFS_DIR = mode === "bus"
  ? path.resolve(__dirname, "../../gtfs")
  : path.resolve(__dirname, "../../metro-gtfs/DMRC_GTFS");

const OUT_DIR = path.resolve(__dirname, `../generated/${mode}`);

fs.mkdirSync(OUT_DIR, { recursive: true });

function gtfsPath(file: string) {
  return path.join(GTFS_DIR, file);
}

function outPath(file: string) {
  return path.join(OUT_DIR, file);
}

function writeJSON(filename: string, data: unknown) {
  const json = JSON.stringify(data);
  fs.writeFileSync(outPath(filename), json, "utf-8");
  const kb = (json.length / 1024).toFixed(1);
  console.log(`  ✅ Wrote ${filename} (${kb} KB)`);
}

// ──────────────────────────────────────────────────────────────────────────────
// METRO LINE HELPERS
// ──────────────────────────────────────────────────────────────────────────────

const LINE_METADATA: Record<string, { name: string; color: string }> = {
  RED: { name: "Red Line", color: "#EF4444" },
  YELLOW: { name: "Yellow Line", color: "#FACC15" },
  BLUE: { name: "Blue Line", color: "#3B82F6" },
  GREEN: { name: "Green Line", color: "#22C55E" },
  VIOLET: { name: "Violet Line", color: "#8B5CF6" },
  PINK: { name: "Pink Line", color: "#EC4899" },
  MAGENTA: { name: "Magenta Line", color: "#BE185D" },
  ORANGE: { name: "Airport Express", color: "#F97316" },
  GRAY: { name: "Gray Line", color: "#6B7280" },
  RAPID: { name: "Rapid Metro", color: "#06B6D4" },
  AQUA: { name: "Aqua Line", color: "#0891B2" },
};

function getLineInfo(longName: string) {
  const upper = longName.toUpperCase();
  for (const [key, meta] of Object.entries(LINE_METADATA)) {
    if (upper.includes(key)) return meta;
  }
  return { name: "Metro Line", color: "#8B5CF6" };
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP 1: PROCESS STOPS
// ──────────────────────────────────────────────────────────────────────────────
async function processStops(): Promise<Map<string, StopEntry>> {
  console.log("\n[1/5] Processing metro stops.txt...");

  interface RawStop {
    stop_id: string;
    stop_name: string;
    stop_lat: string;
    stop_lon: string;
  }

  const rawStops = await readAllRows<RawStop>(gtfsPath("stops.txt"));
  const stopsMap = new Map<string, StopEntry>();

  for (const s of rawStops) {
    if (!s.stop_id || !s.stop_name) continue;
    const lat = parseFloat(s.stop_lat);
    const lon = parseFloat(s.stop_lon);

    stopsMap.set(s.stop_id, {
      stop_id: s.stop_id,
      stop_name: s.stop_name.trim(),
      stop_lat: lat,
      stop_lon: lon,
      route_ids: [],
      normalized_name: normalizeName(s.stop_name),
    });
  }

  return stopsMap;
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP 2: PROCESS ROUTES
// ──────────────────────────────────────────────────────────────────────────────
async function processRoutes(): Promise<Map<string, { name: string; color: string }>> {
  console.log("\n[2/5] Processing metro routes.txt...");

  interface RawRoute {
    route_id: string;
    route_long_name: string;
    route_short_name: string;
    route_type: string;
  }

  const rawRoutes = await readAllRows<RawRoute>(gtfsPath("routes.txt"));
  const routeMetaMap = new Map<string, { name: string; color: string }>();

  const optimized = rawRoutes.map((r) => {
    const info = getLineInfo(r.route_long_name || r.route_short_name || "");
    routeMetaMap.set(r.route_id, info);
    return {
      route_id: r.route_id,
      name: info.name,
      short_name: r.route_short_name || "",
      color: info.color,
      type: 1, // Subway
    };
  });

  writeJSON("optimized_routes.json", optimized);
  return routeMetaMap;
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP 3: TRIP → ROUTE MAP
// ──────────────────────────────────────────────────────────────────────────────
async function buildTripRouteMap(): Promise<Map<string, string>> {
  console.log("\n[3/5] Building trip→route map...");
  interface RawTrip {
    trip_id: string;
    route_id: string;
  }
  const rawTrips = await readAllRows<RawTrip>(gtfsPath("trips.txt"));
  const tripToRoute = new Map<string, string>();
  for (const t of rawTrips) tripToRoute.set(t.trip_id, t.route_id);
  return tripToRoute;
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP 4: STREAM stop_times.txt → GRAPH + INTERCHANGES
// ──────────────────────────────────────────────────────────────────────────────
async function processStopTimes(
  tripToRoute: Map<string, string>,
  routeMetaMap: Map<string, { name: string; color: string }>,
  stopsMap: Map<string, StopEntry>
): Promise<void> {
  console.log("\n[4/5] Streaming stop_times.txt...");

  interface RawStopTime {
    trip_id: string;
    arrival_time: string;
    stop_id: string;
    stop_sequence: string;
  }

  const tripStops = new Map<string, any[]>();
  const stopRoutes = new Map<string, Set<string>>();

  await streamCSV<RawStopTime>(gtfsPath("stop_times.txt"), (row) => {
    const routeId = tripToRoute.get(row.trip_id);
    if (!routeId || !stopsMap.has(row.stop_id)) return;

    const parts = row.arrival_time.split(":").map(Number);
    const secs = parts[0] * 3600 + parts[1] * 60 + parts[2];

    if (!tripStops.has(row.trip_id)) tripStops.set(row.trip_id, []);
    tripStops.get(row.trip_id)!.push({
      stop_id: row.stop_id,
      arrival_secs: secs,
      route_id: routeId,
      seq: parseInt(row.stop_sequence),
    });

    if (!stopRoutes.has(row.stop_id)) stopRoutes.set(row.stop_id, new Set());
    stopRoutes.get(row.stop_id)!.add(routeId);
  });

  // Build Graph
  const adj = buildGraphEdges(tripStops as any);
  writeJSON("graph_edges.json", adj);

  // Enrich Stops with Metro metadata
  console.log("  Enriching stops with Line Info & Interchanges...");
  for (const [stopId, routeIds] of stopRoutes.entries()) {
    const stop = stopsMap.get(stopId);
    if (!stop) continue;

    stop.route_ids = Array.from(routeIds);
    const lines = stop.route_ids.map(rid => routeMetaMap.get(rid)).filter(Boolean) as any[];
    
    // Deduplicate lines by name
    const uniqueLines = Array.from(new Map(lines.map(l => [l.name, l])).values());
    
    stop.all_lines = uniqueLines;
    stop.line_name = uniqueLines[0]?.name;
    stop.line_color = uniqueLines[0]?.color;
    stop.is_interchange = uniqueLines.length > 1;
  }

  const stopsList = Array.from(stopsMap.values());
  writeJSON("optimized_stops.json", stopsList);

  // Search Index
  const index = buildSearchIndex(stopsList);
  const stopIndex: Record<string, string[]> = {};
  for (const [token, ids] of index.tokenMap.entries()) {
    stopIndex[token] = Array.from(ids);
  }
  writeJSON("stop_index.json", stopIndex);
}

// ──────────────────────────────────────────────────────────────────────────────
// STEP 5: PROCESS FARES
// ──────────────────────────────────────────────────────────────────────────────
async function processFares(): Promise<void> {
  console.log("\n[5/5] Processing fares...");
  // Metro fares are often distance-based, but we'll try to parse fare_attributes.txt
  // if it exists, otherwise use a fallback in the API.
  writeJSON("optimized_fares.json", {}); 
}

async function main() {
  const startTime = Date.now();
  console.log("═══════════════════════════════════════════════════");
  console.log(" Delhi Metro GTFS Preprocessing Pipeline");
  console.log("═══════════════════════════════════════════════════");

  const stopsMap = await processStops();
  const routeMetaMap = await processRoutes();
  const tripToRoute = await buildTripRouteMap();
  await processStopTimes(tripToRoute, routeMetaMap, stopsMap);
  await processFares();

  console.log(`\n✅ Preprocessing complete in ${((Date.now() - startTime)/1000).toFixed(1)}s`);
}

main().catch(console.error);
