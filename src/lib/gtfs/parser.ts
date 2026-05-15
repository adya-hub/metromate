/**
 * Efficient CSV/TXT parser for GTFS data
 */
export class GTFSParser {
  /**
   * Parses a CSV string into an array of objects
   */
  static parse<T>(csv: string): T[] {
    if (!csv) return [];

    const lines = csv.split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const result: T[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');
      if (currentLine.length < headers.length) continue;

      const obj: Record<string, string> = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j]?.trim();
      }
      result.push(obj as T);
    }

    return result;
  }

  /**
   * Optimized generator-based parser for large files
   */
  static *parseGenerator<T>(csv: string): Generator<T> {
    if (!csv) return;

    const lines = csv.split(/\r?\n/);
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim());

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');
      if (currentLine.length < headers.length) continue;

      const obj: any = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentLine[j]?.trim();
      }
      yield obj as T;
    }
  }
}
