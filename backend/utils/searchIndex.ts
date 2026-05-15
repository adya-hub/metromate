/**
 * utils/searchIndex.ts
 *
 * WHY: A plain `.filter()` over 10,000 stops on every keystroke
 * requires scanning the full array each time (O(n) per query).
 * We instead build an inverted token index at startup (O(n) once),
 * so every autocomplete query is O(1) map lookup + small merge.
 *
 * This makes autocomplete feel instant even with 100k+ stops.
 */

export interface StopEntry {
  stop_id: string;
  stop_name: string;
  stop_lat: number;
  stop_lon: number;
  route_ids: string[];      // routes that serve this stop
  normalized_name: string;  // lowercase, stripped of punctuation
  line_name?: string;       // Primary line name (e.g. "Yellow Line")
  line_color?: string;      // Primary line color (e.g. "#FFD700")
  is_interchange?: boolean; // True if served by multiple lines
  all_lines?: Array<{ name: string; color: string }>;
}

export interface SearchIndex {
  /** token → set of stop_ids containing that token */
  tokenMap: Map<string, Set<string>>;
  /** stop_id → StopEntry */
  stopsById: Map<string, StopEntry>;
}

/**
 * Normalize a stop name for indexing and querying.
 * "Rajiv Chowk (Exit 4)" → "rajiv chowk exit 4"
 */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[()\/\-_,.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize a normalized name into searchable tokens.
 * Minimum length 2 to avoid noise words like "a", "of".
 */
function tokenize(normalized: string): string[] {
  return normalized.split(" ").filter((t) => t.length >= 2);
}

/**
 * Build the inverted search index from a list of StopEntry objects.
 */
export function buildSearchIndex(stops: StopEntry[]): SearchIndex {
  const tokenMap = new Map<string, Set<string>>();
  const stopsById = new Map<string, StopEntry>();

  for (const stop of stops) {
    stopsById.set(stop.stop_id, stop);
    const tokens = tokenize(stop.normalized_name);

    for (const token of tokens) {
      // Also index all prefixes of each token (for prefix/autocomplete search)
      for (let len = 2; len <= token.length; len++) {
        const prefix = token.slice(0, len);
        if (!tokenMap.has(prefix)) tokenMap.set(prefix, new Set());
        tokenMap.get(prefix)!.add(stop.stop_id);
      }
    }
  }

  console.log(
    `[searchIndex] Built index: ${stopsById.size} stops, ${tokenMap.size} tokens`
  );
  return { tokenMap, stopsById };
}

/**
 * Search the index for stops matching a user query.
 * Returns results sorted by match quality (exact > starts-with > contains).
 *
 * @param index - Pre-built search index
 * @param query - Raw user query string (e.g. "rajiv chow")
 * @param limit - Max results to return (default 10)
 */
export function searchIndex(
  index: SearchIndex,
  query: string,
  limit = 10
): StopEntry[] {
  const normalized = normalizeName(query);
  if (!normalized) return [];

  const tokens = tokenize(normalized);
  if (tokens.length === 0) return [];

  // Find stops that match ALL tokens (AND logic for multi-word queries)
  let resultIds: Set<string> | null = null;

  for (const token of tokens) {
    const matches = index.tokenMap.get(token) ?? new Set<string>();
    if (resultIds === null) {
      resultIds = new Set(matches);
    } else {
      // Intersect: keep only stops that match every token
      for (const id of resultIds) {
        if (!matches.has(id)) resultIds.delete(id);
      }
    }
  }

  if (!resultIds || resultIds.size === 0) return [];

  // Convert to entries and sort by quality
  const entries = Array.from(resultIds)
    .map((id) => index.stopsById.get(id)!)
    .filter(Boolean);

  entries.sort((a, b) => {
    // Exact name match wins
    const aExact = a.normalized_name === normalized ? -1 : 0;
    const bExact = b.normalized_name === normalized ? -1 : 0;
    if (aExact !== bExact) return aExact - bExact;
    // Then starts-with
    const aStart = a.normalized_name.startsWith(normalized) ? -1 : 0;
    const bStart = b.normalized_name.startsWith(normalized) ? -1 : 0;
    if (aStart !== bStart) return aStart - bStart;
    // Finally alphabetical
    return a.stop_name.localeCompare(b.stop_name);
  });

  return entries.slice(0, limit);
}
