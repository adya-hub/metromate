"use client";

/**
 * LiveArrivals.tsx
 *
 * Shows next train arrivals at a station — fetched from /api/metro/live/arrivals/:id.
 * Can be embedded in station selection dropdowns or route result cards.
 * Auto-refreshes every 15 seconds when mounted.
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Train, Clock, ArrowRight, Radio, Loader2 } from "lucide-react";
import { getTrainArrivals, type TrainArrival } from "@/services/metro/liveMetroAPI";

interface LiveArrivalsProps {
  stationId: string;
  stationName?: string;
}

export function LiveArrivals({ stationId, stationName }: LiveArrivalsProps) {
  const [arrivals, setArrivals] = useState<TrainArrival[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const refresh = useCallback(async () => {
    const data = await getTrainArrivals(stationId);
    if (data) {
      setArrivals(data.arrivals);
      setIsLive(data.realtime_available);
    }
    setLoading(false);
  }, [stationId]);

  useEffect(() => {
    setLoading(true);
    refresh();
    const interval = setInterval(refresh, 15_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Train className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold">{stationName ?? "Next Trains"}</span>
        </div>
        <AnimatePresence>
          {isLive && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20"
            >
              <motion.div
                className="w-1.5 h-1.5 rounded-full bg-green-400"
                animate={{ opacity: [1, 0.2, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Live</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Arrivals list */}
      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm py-3">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Loading arrivals...</span>
        </div>
      ) : arrivals.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground text-xs py-2">
          <Radio className="w-3.5 h-3.5" />
          <span>No arrival data available</span>
        </div>
      ) : (
        <div className="space-y-2">
          {arrivals.map((arr, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between p-3 rounded-xl bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{
                    backgroundColor: arr.line_color,
                    boxShadow: `0 0 8px ${arr.line_color}80`,
                  }}
                />
                <div>
                  <p className="text-sm font-medium flex items-center gap-1">
                    {arr.destination}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {arr.line_name} · Platform {arr.platform}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-lg font-bold tabular-nums ${
                  arr.eta_minutes <= 2 ? "text-green-400" :
                  arr.eta_minutes <= 5 ? "text-yellow-400" : "text-foreground"
                }`}>
                  {arr.eta_minutes} min
                </div>
                {arr.is_last_train && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-bold">
                    LAST
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
