"use client";

import { motion } from "framer-motion";
import { Info, Train } from "lucide-react";

const LINES = [
  { name: "Red Line", color: "#EF4444" },
  { name: "Yellow Line", color: "#FACC15" },
  { name: "Blue Line", color: "#3B82F6" },
  { name: "Green Line", color: "#22C55E" },
  { name: "Violet Line", color: "#8B5CF6" },
  { name: "Pink Line", color: "#EC4899" },
  { name: "Magenta Line", color: "#BE185D" },
  { name: "Gray Line", color: "#6B7280" },
  { name: "Airport Express", color: "#F97316" },
  { name: "Rapid Metro", color: "#06B6D4" },
  { name: "Aqua Line", color: "#0891B2" },
];

export function MapLegend() {
  return (
    <div className="absolute top-4 right-4 z-[1000] hidden md:block">
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-background/40 backdrop-blur-3xl border border-white/10 rounded-3xl p-5 shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-violet-500/20 rounded-xl">
            <Train className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-foreground/80">Network Legend</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {LINES.map((line) => (
            <div key={line.name} className="flex items-center gap-3 group cursor-default">
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)] group-hover:scale-125 transition-transform" 
                style={{ 
                  backgroundColor: line.color,
                  boxShadow: `0 0 10px ${line.color}40`
                }} 
              />
              <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-tight">
                {line.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white ring-4 ring-white/5" />
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Interchange Station</span>
        </div>
      </motion.div>
    </div>
  );
}
