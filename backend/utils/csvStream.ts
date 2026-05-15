/**
 * utils/csvStream.ts
 *
 * WHY: GTFS stop_times.txt is 136MB / 3.7M rows. Loading the entire file
 * into memory at once crashes Node.js or causes multi-GB heap usage.
 * Stream-based parsing reads line-by-line from disk into a small buffer,
 * so RAM usage stays under ~50MB regardless of file size.
 */

import fs from "fs";
import path from "path";
import { parse } from "csv-parse";

/**
 * Streams a GTFS CSV/TXT file and calls `onRow` for each parsed row.
 * Returns a promise that resolves when the entire file is consumed.
 *
 * @param filePath - Absolute path to the .txt file
 * @param onRow    - Callback invoked for every data row (header row skipped)
 */
export function streamCSV<T extends Record<string, string>>(
  filePath: string,
  onRow: (row: T) => void
): Promise<{ count: number }> {
  return new Promise((resolve, reject) => {
    let count = 0;

    const readStream = fs.createReadStream(filePath, { encoding: "utf-8" });
    const parser = parse({
      columns: true,      // Use first row as header keys
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true, // Don't crash on ragged rows
    });

    parser.on("readable", () => {
      let row: T;
      // eslint-disable-next-line no-cond-assign
      while ((row = parser.read()) !== null) {
        try {
          onRow(row);
          count++;
        } catch (err) {
          // Skip bad rows — GTFS data can be dirty
          console.warn(`[csvStream] Skipped bad row #${count}:`, err);
        }
      }
    });

    parser.on("error", reject);
    parser.on("end", () => resolve({ count }));

    readStream.on("error", reject);
    readStream.pipe(parser);
  });
}

/**
 * Convenience: read the entire (small) file into an array.
 * Use ONLY for small files (stops.txt, routes.txt, trips.txt).
 * NEVER use this for stop_times.txt.
 */
export async function readAllRows<T extends Record<string, string>>(
  filePath: string
): Promise<T[]> {
  const rows: T[] = [];
  await streamCSV<T>(filePath, (row) => rows.push(row));
  return rows;
}
