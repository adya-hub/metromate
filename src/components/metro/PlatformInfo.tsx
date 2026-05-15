"use client";

/**
 * PlatformInfo.tsx
 *
 * Compact platform info card — shown after station selection in Route Details.
 */

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Layers, ArrowRight } from "lucide-react";
import { getPlatformInfo } from "@/services/metro/liveMetroAPI";

interface PlatformInfoProps {
  stationId: string;
  stationName?: string;
}

interface Platform {
  number: number;
  direction: string;
}

export function PlatformInfo({ stationId, stationName }: PlatformInfoProps) {
  const [platforms, setPlatforms] = useState<Platform[]>([]);

  useEffect(() => {
    getPlatformInfo(stationId).then((data: any) => {
      if (data?.platforms) setPlatforms(data.platforms);
    });
  }, [stationId]);

  if (platforms.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-xl bg-card border border-border space-y-2"
    >
      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <Layers className="w-3.5 h-3.5" />
        {stationName ? `${stationName} — Platforms` : "Platforms"}
      </div>
      <div className="space-y-1">
        {platforms.map((p) => (
          <div key={p.number} className="flex items-center gap-2 text-sm">
            <span className="w-6 h-6 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 text-[11px] font-bold flex items-center justify-center">
              {p.number}
            </span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground">{p.direction}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
