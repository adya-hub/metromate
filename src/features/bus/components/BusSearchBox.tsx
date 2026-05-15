"use client";

import { Search, MapPin, Navigation2, Loader2, Shuffle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";
import { useBusSearch } from "@/features/bus/hooks/useBusAPI";

interface SearchBoxProps {
  placeholder?: string;
  onSelect?: (stopId: string, stopName: string) => void;
  icon?: "search" | "origin" | "destination";
}

export function BusSearchBox({
  placeholder = "Search metro station...",
  onSelect,
  icon = "search",
}: SearchBoxProps) {
  const { results, isSearching, search, clear } = useBusSearch();
  const inputRef = useRef<HTMLInputElement>(null);
  const selectedNameRef = useRef("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (inputRef.current) inputRef.current.value = val;
    if (val !== selectedNameRef.current) selectedNameRef.current = "";
    search(val);
  };

  const handleSelect = (stopId: string, stopName: string) => {
    console.log(`[SearchBox] ✅ Station selected: "${stopName}" (id=${stopId})`);
    selectedNameRef.current = stopName;
    if (inputRef.current) inputRef.current.value = stopName;
    clear();
    onSelect?.(stopId, stopName);
  };

  const Icon = icon === "origin" ? MapPin : icon === "destination" ? Navigation2 : Search;

  return (
    <div className="relative w-full">
      <div className="relative">
        {isSearching ? (
          <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400 animate-spin" />
        ) : (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        )}
        <input
          ref={inputRef}
          type="text"
          onChange={handleChange}
          onBlur={() => setTimeout(clear, 300)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card backdrop-blur-xl border border-border text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none shadow-sm"
        />
      </div>

      <AnimatePresence>
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute top-full mt-2 w-full rounded-2xl bg-card backdrop-blur-xl border border-border overflow-hidden shadow-2xl z-50"
          >
            {results.map((stop, index) => (
              <motion.button
                key={stop.stop_id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelect(stop.stop_id, stop.name);
                }}
                className="w-full px-4 py-3 text-left hover:bg-accent/60 transition-colors flex items-center gap-3 border-b border-border/40 last:border-0 group"
              >
                <div 
                  className="w-2 h-8 rounded-full" 
                  style={{ backgroundColor: (stop as any).line_color || "#8B5CF6" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground truncate">{stop.name}</p>
                    {(stop as any).is_interchange && (
                      <Shuffle className="w-3 h-3 text-orange-400" />
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-0.5">
                    {(stop as any).all_lines?.map((line: any, i: number) => (
                      <span 
                        key={i} 
                        className="text-[10px] px-1.5 py-0.5 rounded bg-muted border border-border/50 text-muted-foreground"
                      >
                        {line.name}
                      </span>
                    )) || (
                      <span className="text-[10px] text-muted-foreground">{(stop as any).line_name}</span>
                    )}
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
