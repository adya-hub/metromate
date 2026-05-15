export interface ShapePoint {
  lat: number;
  lng: number;
  sequence: number;
}

export class ShapeUtils {
  /**
   * Decodes polyline or processes raw shape points into Leaflet-ready coordinates
   */
  static processShapePoints(points: ShapePoint[]): [number, number][] {
    return points
      .sort((a, b) => a.sequence - b.sequence)
      .map(p => [p.lat, p.lng] as [number, number]);
  }

  /**
   * Calculates the bounding box of a set of coordinates
   */
  static getBoundingBox(coordinates: [number, number][]): [[number, number], [number, number]] | null {
    if (coordinates.length === 0) return null;

    let minLat = Infinity, maxLat = -Infinity;
    let minLng = Infinity, maxLng = -Infinity;

    coordinates.forEach(([lat, lng]) => {
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });

    return [[minLat, minLng], [maxLat, maxLng]];
  }
}
