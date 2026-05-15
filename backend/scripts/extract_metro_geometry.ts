import fs from 'fs';
import path from 'path';

const GTFS_PATH = path.resolve(__dirname, '../../metro-gtfs/DMRC_GTFS');
const OUTPUT_PATH = path.resolve(__dirname, '../generated/metro/network_geometry.json');

function extract() {
    console.log('Extracting Metro Network Geometry...');

    // 1. Load Routes to get colors
    const routesRaw = fs.readFileSync(path.join(GTFS_PATH, 'routes.txt'), 'utf-8').split('\n');
    const routeHeaders = routesRaw[0].split(',');
    const routeIdIdx = routeHeaders.indexOf('route_id');
    const routeColorIdx = routeHeaders.indexOf('route_color');
    const routeNameIdx = routeHeaders.indexOf('route_long_name');
    
    const routeInfo: Record<string, any> = {};
    for(let i=1; i<routesRaw.length; i++) {
        const cols = routesRaw[i].split(',');
        if (cols.length < 2) continue;
        routeInfo[cols[routeIdIdx]] = {
            color: cols[routeColorIdx] ? `#${cols[routeColorIdx]}` : null,
            name: cols[routeNameIdx]
        };
    }

    // 2. Load Trips to link Route -> Shape
    const tripsRaw = fs.readFileSync(path.join(GTFS_PATH, 'trips.txt'), 'utf-8').split('\n');
    const tripHeaders = tripsRaw[0].split(',');
    const tripRouteIdIdx = tripHeaders.indexOf('route_id');
    const tripShapeIdIdx = tripHeaders.indexOf('shape_id');

    const routeShapes: Record<string, Set<string>> = {};
    for(let i=1; i<tripsRaw.length; i++) {
        const cols = tripsRaw[i].split(',');
        if (cols.length < 2) continue;
        const rid = cols[tripRouteIdIdx];
        const sid = cols[tripShapeIdIdx];
        if (!routeShapes[rid]) routeShapes[rid] = new Set();
        routeShapes[rid].add(sid);
    }

    // 3. Load Shapes
    const shapesRaw = fs.readFileSync(path.join(GTFS_PATH, 'shapes.txt'), 'utf-8').split('\n');
    const shapeHeaders = shapesRaw[0].split(',');
    const sIdIdx = shapeHeaders.indexOf('shape_id');
    const sLatIdx = shapeHeaders.indexOf('shape_pt_lat');
    const sLonIdx = shapeHeaders.indexOf('shape_pt_lon');
    const sSeqIdx = shapeHeaders.indexOf('shape_pt_sequence');

    const allShapes: Record<string, any[]> = {};
    for(let i=1; i<shapesRaw.length; i++) {
        const cols = shapesRaw[i].split(',');
        if (cols.length < 3) continue;
        const sid = cols[sIdIdx];
        if (!allShapes[sid]) allShapes[sid] = [];
        allShapes[sid].push({
            lat: parseFloat(cols[sLatIdx]),
            lon: parseFloat(cols[sLonIdx]),
            seq: parseInt(cols[sSeqIdx])
        });
    }

    // Sort shape points by sequence
    for (const sid in allShapes) {
        allShapes[sid].sort((a, b) => a.seq - b.seq);
    }

    // 4. Assemble Network
    const network: any[] = [];
    for (const rid in routeShapes) {
        const info = routeInfo[rid] || {};
        const shapes = Array.from(routeShapes[rid]).map(sid => allShapes[sid]).filter(Boolean);
        
        shapes.forEach(shapePoints => {
            network.push({
                route_id: rid,
                name: info.name,
                color: info.color || '#8B5CF6',
                coordinates: shapePoints.map(p => [p.lat, p.lon])
            });
        });
    }

    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(network));
    console.log(`Successfully saved ${network.length} line segments to ${OUTPUT_PATH}`);
}

extract();
