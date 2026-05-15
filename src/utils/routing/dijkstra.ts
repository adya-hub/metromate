import { TransitGraph, RouteEdge, RouteStrategy, DijkstraResult } from "@/types/routing";

export class Dijkstra {
  /**
   * Standard Dijkstra with interchange penalty support
   */
  public static findPath(
    graph: TransitGraph, 
    startId: string, 
    endId: string,
    strategy: RouteStrategy = "fastest"
  ): DijkstraResult {
    const distances: Record<string, number> = {};
    const previous: Record<string, { stationId: string; lineId: string } | null> = {};
    const previousLine: Record<string, string | null> = {};
    const nodes = new Set(Object.keys(graph.nodes));

    // Interchange penalty (in minutes)
    const INTERCHANGE_PENALTY = strategy === "min-interchanges" ? 20 : 5;

    for (const node of nodes) {
      distances[node] = Infinity;
      previous[node] = null;
      previousLine[node] = null;
    }

    distances[startId] = 0;

    const unvisited = new Set(nodes);

    while (unvisited.size > 0) {
      let closestNode: string | null = null;
      let shortestDistance = Infinity;

      for (const node of unvisited) {
        if (distances[node] < shortestDistance) {
          shortestDistance = distances[node];
          closestNode = node;
        }
      }

      if (closestNode === null || closestNode === endId) break;

      unvisited.delete(closestNode);

      const neighbors = graph.edges[closestNode] || [];
      for (const edge of neighbors) {
        if (!unvisited.has(edge.to)) continue;

        let weight = edge.weight;
        
        // Strategy adjustments
        if (strategy === "shortest-distance") {
          weight = edge.distance || edge.weight;
        }

        // Add interchange penalty
        const currentLine = previousLine[closestNode];
        if (currentLine && currentLine !== edge.lineId) {
          weight += INTERCHANGE_PENALTY;
        }

        const alt = distances[closestNode] + weight;
        if (alt < distances[edge.to]) {
          distances[edge.to] = alt;
          previous[edge.to] = { stationId: closestNode, lineId: edge.lineId };
          previousLine[edge.to] = edge.lineId;
        }
      }
    }

    return { distances, previous };
  }
}
