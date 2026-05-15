/**
 * api/routes/search.ts
 *
 * GET /api/search?q=rajiv&limit=10
 *   Returns autocomplete results for stop names.
 *   Uses the in-memory inverted token index — O(1) lookup.
 *
 * WHY: A database LIKE '%query%' query scans every row.
 * An inverted index answers in microseconds regardless of dataset size.
 */

import { Router, Request, Response } from "express";
import { getStore } from "../dataStore";
import { searchIndex } from "../../utils/searchIndex";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const mode = req.baseUrl.includes("bus") ? "bus" : "metro";
  const { searchIdx } = getStore(mode);

  const q = String(req.query.q || "").trim();
  const limit = Math.min(20, Math.max(1, parseInt(String(req.query.limit)) || 8));

  if (!q || q.length < 2) {
    res.json({ results: [] });
    return;
  }

  if (!searchIdx) {
    res.status(503).json({ error: "Search index not ready" });
    return;
  }

  const results = searchIndex(searchIdx, q, limit);

  res.json({
    success: true,
    query: q,
    count: results.length,
    results: results.map((s) => ({
      stop_id: s.stop_id,
      name: s.stop_name,
      lat: s.stop_lat,
      lon: s.stop_lon,
      routes: s.route_ids.slice(0, 5),
      line_name: s.line_name,
      line_color: s.line_color,
      is_interchange: s.is_interchange,
      all_lines: s.all_lines
    })),
  });
});

export default router;
