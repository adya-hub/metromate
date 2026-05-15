/**
 * src/services/api/transitAPI.ts
 *
 * Frontend API client (Metro Edition).
 */

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "";

// ------------------------------------------------------------------------------
// Types (mirrors backend responses)
// ------------------------------------------------------------------------------

export interface ApiStop {
  stop_id: string;
  name: string;
  lat: number;
  lon: number;
  routes?: string[];
  distance_m?: number;
  line_name?: string;
  line_color?: string;
  is_interchange?: boolean;
  all_lines?: Array<{ name: string; color: string }>;
}

export interface ApiRoute {
  route_id: string;
  name: string;
  short_name: string;
  color?: string;
  type: number;
}

export interface RoutePlanResult {
  from: string;
  to: string;
  num_stations: number;
  time_minutes: number;
  interchange_count: number;
  distance_km: number;
  fare: number;
  geometry: [number, number][];
  path: Array<{ 
    stop_id: string; 
    stop_name: string; 
    coords: [number, number];
    line_name?: string;
    line_color?: string;
    is_interchange?: boolean;
  }>;
}

// ------------------------------------------------------------------------------
// Generic fetch helper with error handling
// ------------------------------------------------------------------------------

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as any).error ?? `API error ${res.status} at ${endpoint}`);
  }

  return res.json() as Promise<T>;
}

// ------------------------------------------------------------------------------
// Public API functions
// ------------------------------------------------------------------------------

export async function searchStops(
  query: string,
  limit = 8,
  mode: "metro" | "bus" = "metro"
): Promise<ApiStop[]> {
  if (!query || query.trim().length < 2) return [];
  const data = await apiFetch<{ success: boolean; results: ApiStop[] }>(
    `/api/${mode}/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`
  );
  return data.results ?? [];
}

export async function planRoute(
  fromStopId: string,
  toStopId: string,
  mode: "metro" | "bus" = "metro"
): Promise<RoutePlanResult> {
  return apiFetch<RoutePlanResult>(`/api/${mode}/route-plan`, {
    method: "POST",
    body: JSON.stringify({ from_stop_id: fromStopId, to_stop_id: toStopId }),
  });
}

export async function getNearbyStops(
  lat: number,
  lon: number,
  radiusMeters = 500,
  limit = 5,
  mode: "metro" | "bus" = "metro"
): Promise<{ success: boolean; stops: (ApiStop & { distance_m: number })[] }> {
  const data = await apiFetch<{ success: boolean; stops: (ApiStop & { distance_m: number })[] }>(
    `/api/${mode}/nearby?lat=${lat}&lon=${lon}&radius=${radiusMeters}&limit=${limit}`
  );
  return {
    success: data.success ?? false,
    stops: data.stops ?? []
  };
}

export async function checkHealth(): Promise<boolean> {
  try {
    await apiFetch("/health");
    return true;
  } catch {
    return false;
  }
}
