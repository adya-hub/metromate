"use client";

import { useEffect, useState } from "react";
import { getVehicleStats, type VehicleStats } from "@/services/metro/liveMetroAPI";
import { Activity, Database, AlertTriangle, RefreshCw, Train, Bus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DiagnosticsPanel() {
  const [stats, setStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    const data = await getVehicleStats();
    if (data) setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return null;

  return (
    <div className="w-full mt-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest hover:text-violet-400 transition-colors"
      >
        <Activity className="w-3 h-3" />
        Live Feed Diagnostics
        <span className="ml-auto opacity-50">{isOpen ? '−' : '+'}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              <div className="p-3 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Database className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-bold">Total Entities</span>
                </div>
                <div className="text-xl font-mono font-bold">{stats.totalEntities}</div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/50 border-l-violet-500/50">
                <div className="flex items-center gap-2 text-violet-400 mb-1">
                  <Train className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-bold">Metro Trains</span>
                </div>
                <div className="text-xl font-mono font-bold text-violet-400">{stats.metroVehicles}</div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/50 border-l-orange-500/50">
                <div className="flex items-center gap-2 text-orange-400 mb-1">
                  <Bus className="w-3 h-3" />
                  <span className="text-[10px] uppercase font-bold">Active Buses</span>
                </div>
                <div className="text-xl font-mono font-bold text-orange-400">{stats.busVehicles}</div>
              </div>

              <div className="p-3 rounded-xl bg-card border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span className="text-[10px] uppercase font-bold">Status</span>
                </div>
                <div className="text-[10px] font-medium leading-tight">
                  {stats.metroVehicles > 0 ? (
                    <span className="text-green-400">Stable Feed</span>
                  ) : (
                    <span className="text-orange-400">Empty Metro Feed</span>
                  )}
                  <div className="opacity-50 mt-0.5">Last update {new Date(stats.lastClassification).toLocaleTimeString()}</div>
                </div>
              </div>
            </div>

            {stats.metroVehicles === 0 && (
              <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-bold uppercase">
                <AlertTriangle className="w-3 h-3" />
                ⚠️ Provider feed currently contains no active metro trains
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
