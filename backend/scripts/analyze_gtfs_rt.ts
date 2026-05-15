
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import fs from 'fs';

async function analyze() {
  try {
    const data = fs.readFileSync('/tmp/vp.pb');
    const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(data);
    
    console.log(`Total Entities: ${feed.entity.length}`);
    
    const stopIds = new Set();
    const routeIds = new Set();
    
    feed.entity.forEach(entity => {
      if (entity.vehicle) {
        if (entity.vehicle.stopId) stopIds.add(entity.vehicle.stopId);
        if (entity.vehicle.trip && entity.vehicle.trip.routeId) {
          routeIds.add(entity.vehicle.trip.routeId);
        }
      }
    });
    
    console.log(`Unique Stop IDs in feed: ${stopIds.size}`);
    console.log(`Sample Stop IDs: ${Array.from(stopIds).slice(0, 20).join(', ')}`);
    
    // Check if any of our Metro stop IDs (1-241) are in the feed
    const metroMatches = Array.from(stopIds).filter(id => {
      const nid = parseInt(id);
      return nid >= 1 && nid <= 260;
    });
    
    console.log(`Metro-range Stop ID matches (1-260): ${metroMatches.length}`);
    if (metroMatches.length > 0) {
      console.log(`Matches: ${metroMatches.slice(0, 10).join(', ')}`);
    }

    // Check Route IDs too
    const metroRouteMatches = Array.from(routeIds).filter(id => 
      id.toLowerCase().includes('metro') || ['0','1','2','3','4','5','6','7','8','9'].includes(id)
    );
    console.log(`Metro-like Route ID matches: ${metroRouteMatches.length}`);
    if (metroRouteMatches.length > 0) {
        console.log(`Matches: ${metroRouteMatches.slice(0, 10).join(', ')}`);
    }

  } catch (error) {
    console.error('Error analyzing feed:', error);
  }
}

analyze();
