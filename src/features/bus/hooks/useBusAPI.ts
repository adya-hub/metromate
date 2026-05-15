"use client";

/**
 * hooks/useTransitAPI.ts
 *
 * THE SINGLE source of truth for all transit data in the frontend.
 * Replaces: TransitLoader, useTransit, useRouting, TransitDataEngine, mock graph.
 *
 * All it does is call the Express backend. No local parsing. No graph building.
 * The frontend is now a thin UI layer over the API.
 */

import { useState, useCallback, useRef } from "react";
import {
  searchStops,
  planRoute,
  getNearbyStops,
  type ApiStop,
  type RoutePlanResult,
} from "@/services/api/transitAPI";

// --- SEARCH HOOK -------------------------------------------------------------

export interface StopOption {
  stop_id: string;
  name: string;
  lat: number;
  lon: number;
  routes: string[];
}

export function useBusSearch() {
  const [results, setResults] = useState<StopOption[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      console.log(`[useStopSearch] 🔍 Searching backend: "${query}"`);
      try {
        const stops = await searchStops(query, 8, "bus");
        console.log(`[useStopSearch] ✅ ${stops.length} results for "${query}"`);
        setResults(
          stops.map((s) => ({
            stop_id: s.stop_id,
            name: s.name,
            lat: s.lat,
            lon: s.lon,
            routes: s.routes ?? [],
          }))
        );
      } catch (err) {
        console.error("[useStopSearch] ❌ Search failed:", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200); // 200ms debounce
  }, []);

  const clear = useCallback(() => setResults([]), []);

  return { results, isSearching, search, clear };
}

// --- ROUTE PLANNING HOOK ------------------------------------------------------

export function useBusPlanner() {
  const [activeRoute, setActiveRoute] = useState<RoutePlanResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const findRoute = useCallback(async (fromId: string, toId: string) => {
    console.log(`[useRoutePlanner] 🚀 Planning route: ${fromId} → ${toId}`);
    setIsPlanning(true);
    setError(null);
    setActiveRoute(null);

    try {
      const result = await planRoute(fromId, toId, "bus");
      console.log(
        `[useRoutePlanner] ✅ Route found: ${result.num_stations} stations, ` +
        `${result.time_minutes} min, ₹${result.fare}`
      );
      setActiveRoute(result);
      return result;
    } catch (err: any) {
      const msg = err?.message ?? "Could not find a route between these stops.";
      console.error("[useRoutePlanner] ❌ Route planning failed:", msg);
      setError(msg);
      return null;
    } finally {
      setIsPlanning(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setActiveRoute(null);
    setError(null);
  }, []);

  return { activeRoute, isPlanning, error, findRoute, clearRoute };
}

// --- NEARBY STOPS HOOK -------------------------------------------------------

export function useBusNearby() {
  const [stops, setStops] = useState<(ApiStop & { distance_m: number })[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNearby = useCallback(async (lat: number, lon: number, radius = 500) => {
    setIsLoading(true);
    try {
      const data = await getNearbyStops(lat, lon, radius, 6, "bus");
      setStops(Array.isArray(data.stops) ? data.stops : []);
    } catch (err) {
      console.error("[useNearbyStops] Failed:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { stops, isLoading, fetchNearby };
}
