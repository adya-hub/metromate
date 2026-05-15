"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Clock, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { getLiveStatus, type LineStatus } from "@/services/metro/liveMetroAPI";

export function LiveStatus() {
  const [lines, setLines] = useState<LineStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getLiveStatus();
    if (data) setLines(data.lines);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30_000);
    return () => clearInterval(interval);
  }, [refresh]);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Live Transit Status</h2>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Activity className="w-5 h-5 text-violet-500" />
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-card border border-border animate-pulse" />
            ))
          : lines.map((line, index) => (
              <motion.div
                key={line.line_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-4 rounded-2xl bg-card backdrop-blur-xl border border-border hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: line.color, boxShadow: `0 0 12px ${line.color}` }}
                    />
                    <span className="font-medium text-sm">{line.name}</span>
                  </div>
                  {line.status === "operational" && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {line.status === "delayed"     && <Clock       className="w-4 h-4 text-yellow-500" />}
                  {line.status === "disrupted"   && <XCircle     className="w-4 h-4 text-red-500" />}
                  {line.status === "maintenance" && <AlertCircle className="w-4 h-4 text-orange-500" />}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{line.message}</span>
                  <div className={`text-[10px] px-2 py-0.5 rounded-lg font-medium ${
                    line.status === "operational" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                    line.status === "delayed"     ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                    line.status === "disrupted"   ? "bg-red-500/20 text-red-400 border border-red-500/30" :
                    "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  }`}>
                    {line.status === "operational" ? "Operational" :
                     line.status === "delayed"     ? "Delayed" :
                     line.status === "disrupted"   ? "Disrupted" : "Alert"}
                  </div>
                </div>
              </motion.div>
            ))}
      </div>
    </div>
  );
}
