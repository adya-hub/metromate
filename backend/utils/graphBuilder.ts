/**
 * utils/graphBuilder.ts
 *
 * WHY: Raw GTFS stop_times encode sequences but not connections.
 * We need to collapse 3.7M stop_time rows into a compact adjacency list
 * (graph_edges.json) so the API can run Dijkstra efficiently.
 *
 * Approach:
 *  - Group stop_times by trip_id
 *  - For each consecutive pair of stops in a trip, emit one edge
 *  - Deduplicate: keep the minimum travel time for each (from, to) pair
 *  - Result: ~100k edges instead of 3.7M rows
 *
 * METRO ADDITION:
 *  - Interchange penalties: Switching lines takes time.
 */

export interface GraphEdge {
  from: string;   // stop_id
  to: string;     // stop_id
  route_id: string;
  time_secs: number;  // travel time in seconds
}

/** Adjacency list: stop_id → array of outgoing edges */
export type AdjacencyList = Record<string, GraphEdge[]>;

const INTERCHANGE_PENALTY_SECS = 300; // 5 minutes for a line switch

export function buildGraphEdges(
  tripStops: Map<string, Array<{ stop_id: string; arrival_secs: number; route_id: string }>>
): AdjacencyList {
  // Key by from->to->route to allow multiple parallel lines
  const edgeMin = new Map<string, { edge: GraphEdge; min_secs: number }>();

  for (const stops of tripStops.values()) {
    for (let i = 0; i < stops.length - 1; i++) {
      const from = stops[i];
      const to = stops[i + 1];
      const timeSecs = to.arrival_secs - from.arrival_secs;

      if (timeSecs <= 0 || timeSecs > 7200) continue;

      const fwdKey = `${from.stop_id}→${to.stop_id}→${from.route_id}`;
      const revKey = `${to.stop_id}→${from.stop_id}→${from.route_id}`; // Bidirectional

      const existingFwd = edgeMin.get(fwdKey);
      if (!existingFwd || timeSecs < existingFwd.min_secs) {
        edgeMin.set(fwdKey, {
          min_secs: timeSecs,
          edge: { from: from.stop_id, to: to.stop_id, route_id: from.route_id, time_secs: timeSecs },
        });
      }

      // Explicitly add reverse edge for metro to guarantee bidirectional routing
      const existingRev = edgeMin.get(revKey);
      if (!existingRev || timeSecs < existingRev.min_secs) {
        edgeMin.set(revKey, {
          min_secs: timeSecs,
          edge: { from: to.stop_id, to: from.stop_id, route_id: from.route_id, time_secs: timeSecs },
        });
      }
    }
  }

  // Inject Virtual Transfers for physical interchanges split across different stop_ids
  // Time penalty is around 300s-420s (5-7 mins walking)
  const VIRTUAL_TRANSFERS = [
    { from: "234", to: "500", time: 300 }, // Noida Sec-52 (Blue) <-> Noida Sec-51 (Aqua)
    { from: "156", to: "181", time: 420 }, // Dhaula Kuan (Airport) <-> South Campus (Pink)
  ];

  for (const t of VIRTUAL_TRANSFERS) {
    const fwdKey = `${t.from}→${t.to}→VIRTUAL`;
    const revKey = `${t.to}→${t.from}→VIRTUAL`;
    
    edgeMin.set(fwdKey, {
      min_secs: t.time,
      edge: { from: t.from, to: t.to, route_id: "VIRTUAL", time_secs: t.time }
    });
    edgeMin.set(revKey, {
      min_secs: t.time,
      edge: { from: t.to, to: t.from, route_id: "VIRTUAL", time_secs: t.time }
    });
  }

  const adj: AdjacencyList = {};
  for (const { edge } of edgeMin.values()) {
    if (!adj[edge.from]) adj[edge.from] = [];
    adj[edge.from].push(edge);
  }

  return adj;
}

export function dijkstra(
  adj: AdjacencyList,
  startId: string,
  endId: string,
  getRouteLine?: (routeId: string) => string
): { timeSecs: number; path: Array<{ stop_id: string; route_id: string }>; interchanges: number } | null {
  // dist maps stateKey (stopId|line) to total time
  const dist = new Map<string, number>();
  const prev = new Map<string, { id: string; line: string; edge: GraphEdge }>();
  
  // State: [total_dist, current_stop_id, current_line]
  const heap: Array<{ d: number; id: string; line: string }> = [{ d: 0, id: startId, line: "START" }];

  const startState = `${startId}|START`;
  dist.set(startState, 0);

  let finalState: string | null = null;
  let minTime = Infinity;

  while (heap.length > 0) {
    heap.sort((a, b) => a.d - b.d);
    const { d: curDist, id: curId, line: lastLine } = heap.shift()!;
    const curState = `${curId}|${lastLine}`;

    if (curDist > (dist.get(curState) ?? Infinity)) continue;

    if (curId === endId) {
      if (curDist < minTime) {
        minTime = curDist;
        finalState = curState;
      }
      continue; // keep looking for a better path just in case
    }

    for (const edge of adj[curId] ?? []) {
      const edgeLine = getRouteLine ? getRouteLine(edge.route_id) : edge.route_id;
      let penalty = 0;
      
      if (lastLine !== "START" && edgeLine !== lastLine) {
        penalty = INTERCHANGE_PENALTY_SECS;
      }

      const newDist = curDist + edge.time_secs + penalty;
      const nextState = `${edge.to}|${edgeLine}`;

      if (newDist < (dist.get(nextState) ?? Infinity)) {
        dist.set(nextState, newDist);
        prev.set(nextState, { id: curId, line: lastLine, edge });
        heap.push({ d: newDist, id: edge.to, line: edgeLine });
      }
    }
  }

  if (!finalState) return null;

  // Reconstruct path
  const rawPath: Array<{ stop_id: string; route_id: string }> = [];
  let interchanges = 0;
  let cur: string | undefined = finalState;

  while (cur !== undefined && cur !== startState) {
    const p = prev.get(cur);
    if (!p) break;
    
    // Add current stop if it's the end
    if (rawPath.length === 0) {
      rawPath.unshift({ stop_id: p.edge.to, route_id: p.edge.route_id });
    }
    rawPath.unshift({ stop_id: p.edge.from, route_id: p.edge.route_id });

    const edgeLine = getRouteLine ? getRouteLine(p.edge.route_id) : p.edge.route_id;
    if (p.line !== "START" && edgeLine !== p.line) {
      interchanges++;
    }

    cur = `${p.id}|${p.line}`;
  }

  // Ensure start node is first
  if (rawPath.length === 0 || rawPath[0].stop_id !== startId) {
    rawPath.unshift({ stop_id: startId, route_id: rawPath[0]?.route_id || "" });
  }

  // Remove contiguous duplicates that can happen during state reconstruction
  const path = rawPath.filter((val, i, arr) => i === 0 || val.stop_id !== arr[i - 1].stop_id);

  return { timeSecs: minTime, path, interchanges };
}
