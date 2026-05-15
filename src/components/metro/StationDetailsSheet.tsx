"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Train, ArrowRightLeft, Clock, MapPin, Navigation2 } from "lucide-react";

interface StationDetails {
  stop_id: string;
  stop_name: string;
  is_interchange: boolean;
  all_lines: { name: string; color: string }[];
  line_name: string;
  line_color: string;
}

export function StationDetailsSheet({ 
  station, 
  onClose,
  arrivals = []
}: { 
  station: StationDetails | null; 
  onClose: () => void;
  arrivals?: any[];
}) {
  return (
    <AnimatePresence>
      {station && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 right-0 z-[1000] p-4 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto bg-background/80 backdrop-blur-2xl border border-white/10 rounded-t-[2.5rem] shadow-[0_-20px_50px_-10px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
            {/* Drag Handle */}
            <div className="flex justify-center p-3">
              <div className="w-12 h-1.5 bg-muted-foreground/20 rounded-full" />
            </div>

            <div className="px-6 pb-8 pt-2">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-foreground">{station.stop_name}</h2>
                  <div className="flex items-center gap-3 mt-2">
                    {station.all_lines.map((line, idx) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm border border-white/5"
                        style={{ backgroundColor: `${line.color}20`, color: line.color }}
                      >
                        {line.name}
                      </span>
                    ))}
                    {station.is_interchange && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full text-[10px] font-black uppercase tracking-wider text-muted-foreground border border-white/5">
                        <ArrowRightLeft className="w-3 h-3" />
                        Interchange
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors border border-white/5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Arrivals Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Next Arrivals</span>
                  </div>
                  
                  <div className="space-y-2">
                    {arrivals.length > 0 ? (
                      arrivals.map((arr, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-8 rounded-full" style={{ backgroundColor: arr.line_color }} />
                            <div>
                              <p className="text-xs font-black opacity-50 uppercase leading-none mb-1">{arr.direction}</p>
                              <p className="font-bold text-sm tracking-tight">{arr.destination}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-black tracking-tighter text-violet-400">{arr.eta_minutes}</span>
                            <span className="text-[10px] font-bold uppercase ml-1 opacity-50">min</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center py-8">
                        <div className="inline-flex p-3 bg-white/5 rounded-full mb-3">
                          <Clock className="w-6 h-6 opacity-20" />
                        </div>
                        <p className="text-xs font-bold uppercase tracking-widest opacity-40">No live data available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Navigation2 className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Quick Actions</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-violet-500/20 hover:border-violet-500/50 rounded-2xl border border-white/5 transition-all text-center group">
                      <div className="p-2 bg-violet-500/20 rounded-xl group-hover:scale-110 transition-transform">
                        <MapPin className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider">Directions From</span>
                    </button>
                    <button className="flex flex-col items-center justify-center gap-2 p-4 bg-white/5 hover:bg-violet-500/20 hover:border-violet-500/50 rounded-2xl border border-white/5 transition-all text-center group">
                      <div className="p-2 bg-violet-500/20 rounded-xl group-hover:scale-110 transition-transform">
                        <Train className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider">Directions To</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
