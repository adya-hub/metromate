
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import fs from 'fs';
import path from 'path';

export interface TrainArrival {
  station_id: string;
  station_name: string;
  line_name: string;
  line_color: string;
  platform: number;
  direction: string;
  destination: string;
  eta_minutes: number;
  is_last_train: boolean;
}

export interface LineStatus {
  line_id: string;
  name: string;
  color: string;
  status: 'operational' | 'delayed' | 'disrupted' | 'maintenance';
  message: string;
  frequency_mins: number;
}

class LiveMetroService {
  private static instance: LiveMetroService;
  private stops: any[] = [];
  private routes: any[] = [];
  private trips: Map<string, any> = new Map();
  private lastUpdate: number = 0;
  private cachedVehicles: any[] = [];
  private metroRouteIds: Set<string> = new Set();
  private stats = {
    totalEntities: 0,
    metroVehicles: 0,
    busVehicles: 0,
    unknownVehicles: 0,
    lastClassification: ""
  };

  private constructor() {
    this.loadStaticData();
  }

  public static getInstance(): LiveMetroService {
    if (!LiveMetroService.instance) {
      LiveMetroService.instance = new LiveMetroService();
    }
    return LiveMetroService.instance;
  }

  private loadStaticData() {
    try {
      const metroGeneratedPath = path.resolve(__dirname, '../../generated/metro');
      this.stops = JSON.parse(fs.readFileSync(path.join(metroGeneratedPath, 'optimized_stops.json'), 'utf-8'));
      this.routes = JSON.parse(fs.readFileSync(path.join(metroGeneratedPath, 'optimized_routes.json'), 'utf-8'));
      
      // Load trips for direction/headsign info
      const tripsPath = path.resolve(__dirname, '../../../metro-gtfs/DMRC_GTFS/trips.txt');
      const tripsRaw = fs.readFileSync(tripsPath, 'utf-8').split(/\r?\n/);
      const headers = tripsRaw[0].split(',').map(h => h.trim());
      const tripIdIdx = headers.indexOf('trip_id');
      const routeIdIdx = headers.indexOf('route_id');
      const headsignIdx = headers.indexOf('trip_headsign');
      const directionIdx = headers.indexOf('direction_id');

      for (let i = 1; i < tripsRaw.length; i++) {
        const line = tripsRaw[i].trim();
        if (!line) continue;
        const cols = line.split(',');
        if (cols.length < headers.length) continue;
        this.trips.set(cols[tripIdIdx].trim(), {
          route_id: cols[routeIdIdx].trim(),
          headsign: cols[headsignIdx].trim(),
          direction: cols[directionIdx].trim()
        });
      }

      this.routes.forEach(r => this.metroRouteIds.add(r.route_id.toString()));

      console.log(`[LiveMetroService] Loaded ${this.stops.length} stops, ${this.routes.length} routes, ${this.trips.size} trips.`);
      console.log(`[LiveMetroService] Metro Route IDs: ${Array.from(this.metroRouteIds).join(', ')}`);
    } catch (err) {
      console.error('[LiveMetroService] Failed to load static data:', err);
    }
  }

  private lastFeedInfo: any = {
    byteSize: 0,
    entityCount: 0,
    success: false,
    timestamp: null,
    error: null,
    contentType: null,
    status: 0
  };

  private async fetchFeed() {
    const KEY = process.env.METRO_API_KEY;
    const URL = `https://otd.delhi.gov.in/api/realtime/VehiclePositions.pb?key=${KEY}`;
    
    if (!KEY) {
      console.warn('[GTFS-RT] No API key configured');
      return null;
    }

    // Cache feed for 15 seconds
    if (Date.now() - this.lastUpdate < 15000 && this.cachedVehicles.length > 0) {
      return this.cachedVehicles;
    }

    try {
      console.log(`[GTFS-RT] Fetching from: ${URL.split('?')[0]}...`);
      const res = await fetch(URL, { signal: AbortSignal.timeout(8000) });
      
      this.lastFeedInfo.status = res.status;
      this.lastFeedInfo.contentType = res.headers.get('content-type');
      this.lastFeedInfo.timestamp = new Date().toISOString();

      console.log(`[GTFS-RT] Fetch success. Status: ${res.status}, Type: ${this.lastFeedInfo.contentType}`);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const buffer = await res.arrayBuffer();
      const uint8 = new Uint8Array(buffer);
      this.lastFeedInfo.byteSize = uint8.length;
      console.log(`[GTFS-RT] Response size: ${uint8.length} bytes`);

      // Save dump for manual inspection
      const debugDir = path.resolve(__dirname, '../../debug');
      if (!fs.existsSync(debugDir)) fs.mkdirSync(debugDir, { recursive: true });
      fs.writeFileSync(path.join(debugDir, 'feed_dump.pb'), Buffer.from(uint8));

      if (uint8.length < 100) {
        console.warn('[GTFS-RT] Invalid or empty realtime feed (too small)');
        this.lastFeedInfo.success = false;
        this.lastFeedInfo.error = 'Feed too small';
        return [];
      }

      try {
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(uint8);
        this.lastFeedInfo.entityCount = feed.entity.length;
        this.stats.totalEntities = feed.entity.length;
        
        let metroCount = 0;
        let busCount = 0;
        let unknownCount = 0;

        const filteredMetro: any[] = [];

        feed.entity.forEach(entity => {
          if (!entity.vehicle) {
            unknownCount++;
            return;
          }

          const routeId = entity.vehicle.trip?.routeId?.toString();
          
          // Classification logic:
          // 1. If routeId is in our DMRC routes set -> Metro
          // 2. If tripId matches DMRC numeric pattern -> Metro
          // 3. Otherwise -> likely Bus (since OTD feed is mixed)
          
          const isMetroRoute = routeId && this.metroRouteIds.has(routeId);
          
          if (isMetroRoute) {
            metroCount++;
            filteredMetro.push(entity);
          } else {
            busCount++;
          }
        });

        this.stats.metroVehicles = metroCount;
        this.stats.busVehicles = busCount;
        this.stats.unknownVehicles = unknownCount;
        this.stats.lastClassification = new Date().toISOString();

        console.log(`[GTFS-RT] Classification: Metro=${metroCount}, Bus=${busCount}, Unknown=${unknownCount}`);

        this.cachedVehicles = filteredMetro;
        this.lastUpdate = Date.now();
        this.lastFeedInfo.success = true;
        this.lastFeedInfo.error = null;
        
        if (this.cachedVehicles.length === 0 && metroCount === 0) {
          console.warn('[GTFS-RT] ⚠️ Provider feed currently contains no active metro trains');
        }

        return this.cachedVehicles;
      } catch (decodeErr: any) {
        console.error(`[GTFS-RT] Decode failed: ${decodeErr.message}`);
        this.lastFeedInfo.success = false;
        this.lastFeedInfo.error = `Decode error: ${decodeErr.message}`;
        return [];
      }
    } catch (err: any) {
      console.error('[GTFS-RT] Feed fetch failed:', err.message);
      this.lastFeedInfo.success = false;
      this.lastFeedInfo.error = err.message;
      return null;
    }
  }

  public getRawFeedInfo() {
    return {
      ...this.lastFeedInfo,
      cachedVehicleCount: this.cachedVehicles.length,
      firstEntityPreview: this.cachedVehicles.length > 0 ? this.cachedVehicles[0] : null,
      stats: this.stats
    };
  }

  public getVehicleStats() {
    return this.stats;
  }

  public async getArrivals(stationId: string): Promise<TrainArrival[]> {
    const vehicles = await this.fetchFeed();
    if (!vehicles) return [];

    const station = this.stops.find(s => s.stop_id === stationId);
    if (!station) return [];

    const arrivals: TrainArrival[] = [];

    for (const entity of vehicles) {
      const v = entity.vehicle;
      const tripInfo = this.trips.get(v.trip.tripId);
      const route = this.routes.find(r => r.route_id === v.trip.routeId);
      
      if (!route) continue;

      // Calculate distance to station
      const dist = this.calculateDistance(
        v.position.latitude, 
        v.position.longitude, 
        station.stop_lat, 
        station.stop_lon
      );

      // Average Metro speed ~35km/h = 0.58 km/min
      // If within 10km, consider it a potential arrival
      if (dist < 10) {
        const eta = Math.ceil(dist / 0.58);
        
        // Very basic direction filter: if we have a headsign, we can show it
        const headsign = tripInfo?.headsign || "Metro Station";

        arrivals.push({
          station_id: stationId,
          station_name: station.stop_name,
          line_name: route.name,
          line_color: route.color,
          platform: (parseInt(tripInfo?.direction) || 0) + 1,
          direction: `Towards ${headsign}`,
          destination: headsign,
          eta_minutes: eta,
          is_last_train: false
        });
      }
    }

    // Sort by ETA and limit
    return arrivals.sort((a, b) => a.eta_minutes - b.eta_minutes).slice(0, 5);
  }

  public async getLineStatuses(): Promise<LineStatus[]> {
    const vehicles = await this.fetchFeed();
    
    // Group vehicles by route to check health
    const routeHealth: Record<string, number> = {};
    if (vehicles) {
      vehicles.forEach(e => {
        const rid = e.vehicle.trip.routeId;
        routeHealth[rid] = (routeHealth[rid] || 0) + 1;
      });
    }

    return this.routes.map(r => {
      const count = routeHealth[r.route_id] || 0;
      return {
        line_id: r.route_id,
        name: r.name,
        color: r.color,
        status: count > 0 ? 'operational' : 'maintenance',
        message: count > 0 ? 'Good Service' : 'Limited Data',
        frequency_mins: count > 5 ? 4 : 8
      };
    });
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}

export default LiveMetroService;
