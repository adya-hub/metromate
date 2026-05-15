import { GTFSStop, GTFSRoute, GTFSTrip, GTFSStopTime } from "@/types/transit";

export class TransitValidator {
  /**
   * Validates a raw GTFS Stop record
   */
  static isValidStop(stop: GTFSStop): boolean {
    return !!(
      stop.stop_id &&
      stop.stop_name &&
      stop.stop_lat &&
      !isNaN(parseFloat(stop.stop_lat)) &&
      stop.stop_lon &&
      !isNaN(parseFloat(stop.stop_lon))
    );
  }

  /**
   * Validates a raw GTFS Route record
   */
  static isValidRoute(route: GTFSRoute): boolean {
    return !!(
      route.route_id &&
      (route.route_short_name || route.route_long_name)
    );
  }

  /**
   * Validates a raw GTFS Trip record
   */
  static isValidTrip(trip: GTFSTrip): boolean {
    return !!(trip.trip_id && trip.route_id);
  }

  /**
   * Validates a raw GTFS StopTime record
   */
  static isValidStopTime(st: GTFSStopTime): boolean {
    return !!(st.trip_id && st.stop_id && st.stop_sequence);
  }
}
