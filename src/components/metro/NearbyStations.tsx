"use client";

import { motion } from "framer-motion";
import { MapPin, Navigation, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useMetroNearby } from "@/features/metro/hooks/useMetroAPI";

export function NearbyStations() {
  const { stops, isLoading, fetchNearby } = useMetroNearby();
  const [locationError, setLocationError] = useState<string | null>(null);
  const [hasRequested, setHasRequested] = useState(false);

  // On mount, try to silently get location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchNearby(pos.coords.latitude, pos.coords.longitude, 800);
          setHasRequested(true);
        },
        () => {
          // Location denied — show Delhi centre fallback
          fetchNearby(28.6328, 77.2197, 1000);
          setHasRequested(true);
        },
        { timeout: 5000 }
      );
    }
  }, [fetchNearby]);

  const handleRefresh = () => {
    setLocationError(null);
    if (!navigator.geolocation) {
      setLocationError("Geolocation not supported in this browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchNearby(pos.coords.latitude, pos.coords.longitude, 800),
      () => setLocationError("Location access denied.")
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Nearby Metro Stations</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 hover:bg-violet-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Navigation className="w-4 h-4" />
          )}
          <span className="text-sm">{isLoading ? "Locating..." : "Use My Location"}</span>
        </motion.button>
      </div>

      {locationError && (
        <p className="text-sm text-red-400">{locationError}</p>
      )}

      {!hasRequested && !isLoading && (
        <p className="text-sm text-muted-foreground">
          Click "Use My Location" to find nearby metro stations.
        </p>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          Searching nearby stations...
        </div>
      )}

      {!isLoading && stops.length === 0 && hasRequested && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No stations found within 800m. Try expanding the radius.
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {stops.map((stop, index) => (
          <motion.div
            key={stop.stop_id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="p-4 rounded-2xl bg-card backdrop-blur-xl border border-border text-left"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm mb-1 truncate">{stop.name}</h3>
                <div className="flex gap-1.5 flex-wrap">
                  {(stop as any).all_lines?.map((line: any, i: number) => (
                    <span 
                      key={i} 
                      className="text-[10px] px-1.5 py-0.5 rounded border border-border/50 text-white font-bold tracking-tight"
                      style={{ backgroundColor: `${line.color}90`, borderColor: line.color }}
                    >
                      {line.name}
                    </span>
                  )) || (stop as any).line_name && (
                    <span 
                      className="text-[10px] px-1.5 py-0.5 rounded border border-border/50 text-white font-bold tracking-tight"
                      style={{ backgroundColor: `${(stop as any).line_color}90`, borderColor: (stop as any).line_color }}
                    >
                      {(stop as any).line_name}
                    </span>
                  )}
                </div>
              </div>
              <MapPin className="w-5 h-5 flex-shrink-0 ml-2" style={{ color: (stop as any).line_color || "#8B5CF6" }} />
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                <span>{stop.distance_m}m away</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>~{Math.ceil((stop.distance_m ?? 0) / 80)} min walk</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
