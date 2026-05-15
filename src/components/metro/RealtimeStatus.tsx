"use client";

/**
 * RealtimeStatus.tsx
 *
 * Live line status panel — fetches from /api/metro/live/status.
 * Falls back gracefully to static data when realtime is unavailable.
 * Auto-refreshes every 30 seconds.
 */

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, CheckCircle, Clock, AlertCircle, XCircle, RefreshCw, Radio } from "lucide-react";
import { getLiveStatus, type LiveStatusResponse, type LineStatus } from "@/services/metro/liveMetroAPI";
import { DiagnosticsPanel } from "./DiagnosticsPanel";

const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    badge: "bg-green-500/20 text-green-400 border-green-500/30",
    label: "Operational",
  },
  delayed: {
    icon: Clock,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    label: "Delayed",
  },
  disrupted: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    badge: "bg-red-500/20 text-red-400 border-red-500/30",
    label: "Disrupted",
  },
  maintenance: {
    icon: AlertCircle,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    label: "Alert",
  },
};

export function RealtimeStatus() {
  const [data, setData] = useState<LiveStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    const result = await getLiveStatus();
    if (result) {
      setData(result);
      setLastUpdated(new Date());
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000); // refresh every 30s
    return () => clearInterval(interval);
  }, [refresh]);

  const lines: LineStatus[] = data?.lines ?? [];
  const isLive = data?.realtime_available ?? false;

  return (
    <section className="w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-semibold">Network Status</h2>
          <AnimatePresence>
            {isLive && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20"
              >
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-green-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Live</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-muted-foreground hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <motion.button
            onClick={refresh}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
          </motion.button>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <Activity className="w-5 h-5 text-violet-500" />
          </motion.div>
        </div>
      </div>

      {/* Fallback & Empty Feed notice */}
      {!loading && !isLive && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/30 border border-border text-muted-foreground text-xs">
          <Radio className="w-3.5 h-3.5 flex-shrink-0" />
          <span>Realtime data unavailable — showing scheduled service status</span>
        </div>
      )}

      {!loading && isLive && (data?.vehicle_count === 0) && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>🟠 Realtime provider returned no active vehicles</span>
        </div>
      )}

      {/* Line grid */}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {loading
          ? Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-20 rounded-2xl bg-card border border-border animate-pulse"
              />
            ))
          : lines.map((line, i) => {
              const cfg = statusConfig[line.status] ?? statusConfig.operational;
              const Icon = cfg.icon;
              return (
                <motion.div
                  key={line.line_id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="p-4 rounded-2xl bg-card border border-border hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: line.color,
                          boxShadow: `0 0 10px ${line.color}80`,
                        }}
                      />
                      <span className="font-medium text-sm">{line.name}</span>
                    </div>
                    <Icon className={`w-4 h-4 ${cfg.color}`} />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{line.message}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold border ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>

                  {line.frequency_mins > 0 && (
                    <div className="mt-2 text-[10px] text-muted-foreground">
                      Every {line.frequency_mins} min
                    </div>
                  )}
                </motion.div>
              );
            })}
      </div>

      <DiagnosticsPanel />
    </section>
  );
}
