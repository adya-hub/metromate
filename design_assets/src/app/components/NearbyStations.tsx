import { motion } from "motion/react";
import { MapPin, Navigation, Clock } from "lucide-react";

interface Station {
  name: string;
  line: string;
  distance: string;
  walkTime: string;
  lineColor: string;
}

const nearbyStations: Station[] = [
  { name: "Rajiv Chowk", line: "Yellow Line", distance: "0.5 km", walkTime: "6 min", lineColor: "var(--metro-yellow)" },
  { name: "Barakhamba Road", line: "Blue Line", distance: "0.8 km", walkTime: "10 min", lineColor: "var(--metro-blue)" },
  { name: "Mandi House", line: "Blue Line", distance: "1.2 km", walkTime: "15 min", lineColor: "var(--metro-blue)" },
  { name: "Patel Chowk", line: "Yellow Line", distance: "1.5 km", walkTime: "18 min", lineColor: "var(--metro-yellow)" },
];

export function NearbyStations() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Nearby Stations</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 hover:bg-violet-600/30 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          <span className="text-sm">Use My Location</span>
        </motion.button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {nearbyStations.map((station, index) => (
          <motion.button
            key={station.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-white/10 hover:border-violet-500/50 transition-all text-left group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold mb-1 group-hover:text-violet-400 transition-colors">{station.name}</h3>
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: station.lineColor }}
                  />
                  <span className="text-sm text-muted-foreground">{station.line}</span>
                </div>
              </div>
              <MapPin className="w-5 h-5 text-violet-500" />
            </div>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                <span>{station.distance}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{station.walkTime} walk</span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
