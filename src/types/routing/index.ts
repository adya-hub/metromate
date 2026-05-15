import { Station, TransitLine } from "../transit";

export type RouteStrategy = "fastest" | "min-interchanges" | "shortest-distance";

export interface RouteEdge {
  from: string;
  to: string;
  lineId: string;
  weight: number; // Time in minutes or distance
  distance?: number;
}

export interface DijkstraResult {
  distances: Record<string, number>;
  previous: Record<string, { stationId: string; lineId: string } | null>;
}

export interface TransitGraph {
  nodes: Record<string, Station>;
  edges: Record<string, RouteEdge[]>;
}

export interface JourneyStep {
  type: "travel" | "interchange" | "start" | "end";
  stationId: string;
  stationName: string;
  lineId?: string;
  lineColor?: string;
  duration: number; // minutes
  description: string;
}

export interface RouteResult {
  id: string;
  strategy: RouteStrategy;
  originId: string;
  destinationId: string;
  totalTime: number; // minutes
  totalDistance: number; // km
  totalStations: number;
  totalInterchanges: number;
  totalFare: number;
  steps: JourneyStep[];
  path: string[]; // Ordered list of station IDs
  lines: string[]; // Ordered list of line IDs used
  geometry?: [number, number][]; // Coordinates for map
}

export interface RoutingState {
  results: RouteResult[];
  activeRoute: RouteResult | null;
  isLoading: boolean;
  error: string | null;
}
