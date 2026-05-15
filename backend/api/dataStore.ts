/**
 * api/dataStore.ts
 *
 * WHY: We load the pre-processed JSON files ONCE at startup
 * and keep them in memory. They total ~15MB — trivial for a Node.js server.
 * Every API request then answers from RAM in <1ms.
 *
 * This is the fundamental pattern that makes the backend fast:
 *   disk → RAM (once at startup) → API responses (instant)
 */

import fs from "fs";
import path from "path";
import { buildSearchIndex, SearchIndex, StopEntry } from "../utils/searchIndex";
import { AdjacencyList } from "../utils/graphBuilder";

export interface OptimizedRoute {
  route_id: string;
  name: string;
  short_name: string;
  type: number;
  agency_id: string;
  color?: string;
}

export interface TransportStore {
  stops: StopEntry[];
  stopsById: Map<string, StopEntry>;
  routes: OptimizedRoute[];
  routesById: Map<string, OptimizedRoute>;
  graphAdj: AdjacencyList;
  searchIdx: SearchIndex | null;
  fares: Record<string, number>;
}

const stores: Record<string, TransportStore> = {
  metro: null as any,
  bus: null as any
};

let initialized = false;

function loadJSON<T>(mode: string, filename: string): T {
  const filePath = path.resolve(__dirname, `../generated/${mode}/${filename}`);
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Generated file not found: ${filePath}\n` +
      `Run "cd backend && npm run preprocess ${mode}" first.`
    );
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

function loadStoreForMode(mode: "metro" | "bus"): TransportStore | null {
  try {
    const stops = loadJSON<StopEntry[]>(mode, "optimized_stops.json");
    const routes = loadJSON<OptimizedRoute[]>(mode, "optimized_routes.json");
    const graphAdj = loadJSON<AdjacencyList>(mode, "graph_edges.json");
    const fares = loadJSON<Record<string, number>>(mode, "optimized_fares.json");

    const stopsById = new Map<string, StopEntry>();
    for (const s of stops) stopsById.set(s.stop_id, s);

    const routesById = new Map<string, OptimizedRoute>();
    for (const r of routes) routesById.set(r.route_id, r);

    const searchIdx = buildSearchIndex(stops);

    console.log(
      `[dataStore:${mode}] Ready: ${stops.length} stops, ${routes.length} routes, ` +
      `${Object.keys(graphAdj).length} graph nodes.`
    );

    return { stops, stopsById, routes, routesById, graphAdj, searchIdx, fares };
  } catch (err: any) {
    console.error(`[dataStore:${mode}] Failed to load: ${err.message}`);
    return null; // Gracefully fail if mode data is not generated yet
  }
}

export function initDataStore() {
  if (initialized) return;
  console.log("[dataStore] Loading pre-processed data into memory...");
  
  const metroStore = loadStoreForMode("metro");
  if (metroStore) stores.metro = metroStore;

  const busStore = loadStoreForMode("bus");
  if (busStore) stores.bus = busStore;

  initialized = true;
}

export function getStore(mode: "metro" | "bus"): TransportStore {
  if (!initialized) initDataStore();
  const store = stores[mode];
  if (!store) {
    throw new Error(`Data store for ${mode} is not loaded or missing generated files.`);
  }
  return store;
}

