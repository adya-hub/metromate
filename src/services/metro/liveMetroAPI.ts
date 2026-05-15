/**
 * src/services/metro/liveMetroAPI.ts
 *
 * Frontend client for the live metro data proxy.
 * Calls our OWN backend — never the external API directly.
 *
 * Failsafe: every method returns null / empty arrays on failure.
 * The UI must handle null gracefully and fall back to GTFS data.
 */

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

// ------------------------------------------------------------------------------
// Types (mirrors backend responses)
// ------------------------------------------------------------------------------

export interface LineStatus {
  line_id: string;
  name: string;
  color: string;
  status: "operational" | "delayed" | "disrupted" | "maintenance";
  message: string;
  frequency_mins: number;
}

export interface TrainArrival {
  station_id: string;
  station_name: string;
  line_name: string;
  line_color: string;
  platform: number;
  direction: string;
  destination: string;
  eta_minutes: number;
  is_last_train: boolean;
}

export interface MetroAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  body: string;
  lines_affected: string[];
  timestamp: string;
}

export interface Vehicle {
  id: string;
  trip_id: string;
  route_id: string;
  line_name?: string;
  color?: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading?: number;
  timestamp: string;
  label: string;
}

export interface VehicleStats {
  totalEntities: number;
  metroVehicles: number;
  busVehicles: number;
  unknownVehicles: number;
  lastClassification: string;
}

export interface LiveStatusResponse {
  success: boolean;
  source: "live" | "cache" | "fallback";
  realtime_available: boolean;
  vehicle_count?: number;
  lines: LineStatus[];
}

export interface ArrivalsResponse {
  success: boolean;
  source: "live" | "cache" | "fallback";
  realtime_available: boolean;
  station_id: string;
  arrivals: TrainArrival[];
}

// ------------------------------------------------------------------------------
// Generic fetch with error boundary
// ------------------------------------------------------------------------------

async function liveApiFetch<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND}/api/metro${path}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } catch (err: any) {
    console.warn(`[MetroAPI] Fetch failed for ${path}:`, err.message);
    return null;
  }
}

// ------------------------------------------------------------------------------
// Public API methods
// ------------------------------------------------------------------------------

/** All line statuses — operational / delayed / disrupted / maintenance */
export async function getLiveStatus(): Promise<LiveStatusResponse | null> {
  return liveApiFetch<LiveStatusResponse>("/live-status");
}

/** Next train arrivals at a given stop ID */
export async function getTrainArrivals(stationId: string): Promise<ArrivalsResponse | null> {
  if (!stationId) return null;
  return liveApiFetch<ArrivalsResponse>(`/arrivals/${encodeURIComponent(stationId)}`);
}

/** System-wide service alerts */
export async function getMetroAlerts(): Promise<MetroAlert[]> {
  const data = await liveApiFetch<{ alerts: MetroAlert[] }>("/alerts");
  return data?.alerts ?? [];
}

export interface Station {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  is_interchange: boolean;
  line_name: string;
  line_color: string;
  all_lines: { name: string; color: string }[];
}

/** All metro stations */
export async function getStops(): Promise<Station[]> {
  const data = await liveApiFetch<{ success: boolean; stops: Station[] }>("/stops");
  return data?.stops ?? [];
}

export interface RouteGeometry {
  route_id: string;
  name: string;
  color: string;
  coordinates: [number, number][];
}

/** Full network geometry */
export async function getGeometry(): Promise<RouteGeometry[]> {
  const data = await liveApiFetch<{ success: boolean; geometry: RouteGeometry[] }>("/geometry");
  return data?.geometry ?? [];
}

/** Platform info at a station */
export async function getPlatformInfo(stationId: string) {
  return liveApiFetch(`/platform/${encodeURIComponent(stationId)}`);
}

/** Current vehicle positions */
export async function getVehicles(): Promise<Vehicle[]> {
  const data = await liveApiFetch<{ success: boolean; vehicles: Vehicle[] }>("/vehicles");
  return data?.vehicles ?? [];
}

/** Vehicle classification statistics */
export async function getVehicleStats(): Promise<VehicleStats | null> {
  return liveApiFetch<VehicleStats>("/vehicle-stats");
}
