/**
 * Raw GTFS types as they appear in .txt files
 */
export interface GTFSStop {
  stop_id: string;
  stop_code?: string;
  stop_name: string;
  stop_desc?: string;
  stop_lat: string;
  stop_lon: string;
  zone_id?: string;
  stop_url?: string;
  location_type?: string;
  parent_station?: string;
}

export interface GTFSRoute {
  route_id: string;
  agency_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: string;
  route_color?: string;
  route_text_color?: string;
}

export interface GTFSTrip {
  route_id: string;
  service_id: string;
  trip_id: string;
  trip_headsign?: string;
  direction_id?: string;
  shape_id?: string;
}

export interface GTFSStopTime {
  trip_id: string;
  arrival_time: string;
  departure_time: string;
  stop_id: string;
  stop_sequence: string;
  stop_headsign?: string;
  pickup_type?: string;
  drop_off_type?: string;
}

export interface GTFSFareAttribute {
  fare_id: string;
  price: string;
  currency_type: string;
  payment_method: string;
  transfers: string;
  agency_id: string;
  transfer_duration?: string;
}

export interface GTFSFareRule {
  fare_id: string;
  route_id?: string;
  origin_id?: string;
  destination_id?: string;
  contains_id?: string;
}

/**
 * Normalized Transit Data Types
 */
export interface Station {
  id: string;
  name: string;
  lat: number;
  lng: number;
  lines: string[]; // IDs of lines passing through
  interchange: boolean;
  zoneId?: string;
}

export interface TransitLine {
  id: string;
  shortName: string;
  longName: string;
  color: string;
  textColor: string;
  stations: string[]; // Ordered list of station IDs
  type: TransitType;
}

export enum TransitType {
  METRO = 1,
  BUS = 3,
  RAIL = 2,
}

export interface FareMetadata {
  fareId: string;
  price: number;
  originId?: string;
  destinationId?: string;
}

export interface TransitMetadata {
  stations: Record<string, Station>;
  lines: Record<string, TransitLine>;
  lastUpdated: string;
  version: string;
}
