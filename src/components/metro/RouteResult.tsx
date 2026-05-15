"use client";

import { motion } from "framer-motion";
import {
  Clock, IndianRupee, MapPin, Navigation, Shuffle, X, Circle
} from "lucide-react";
import { type RoutePlanResult } from "@/services/api/transitAPI";
import { LiveArrivals } from "@/components/metro/LiveArrivals";
import { Train } from "lucide-react";

interface RouteResultProps {
  route: RoutePlanResult;
  onClose?: () => void;
}

export function RouteResult({ route, onClose }: RouteResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="h-full flex flex-col"
    >
      <div className="p-6 space-y-6 overflow-y-auto scrollbar-thin flex-1">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Route Details</h2>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
              <Train className="w-3.5 h-3.5 text-violet-400" />
              Delhi Metro Rail Network
            </p>
          </div>
          {onClose && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-accent transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Origin / Destination Summary */}
        <div className="space-y-4 p-5 rounded-3xl bg-gradient-to-br from-violet-600/5 to-blue-600/5 border border-border shadow-inner">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-4 h-4 rounded-full border-2 border-green-500 bg-background" />
              <div className="absolute top-4 left-2 w-0.5 h-8 bg-gradient-to-b from-green-500 to-red-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Origin</p>
              <span className="font-semibold text-sm">{route.from}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-4 h-4 rounded-full border-2 border-red-500 bg-background" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Destination</p>
              <span className="font-semibold text-sm">{route.to}</span>
            </div>
          </div>
        </div>

        {/* Live Arrivals at Origin */}
        <LiveArrivals
          stationId={route.path[0].stop_id}
          stationName={route.path[0].stop_name}
        />

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Clock className="w-4 h-4 mx-auto mb-2 text-violet-400" />
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Time</div>
            <div className="text-lg font-bold">{route.time_minutes} min</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <IndianRupee className="w-4 h-4 mx-auto mb-2 text-green-400" />
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Fare</div>
            <div className="text-lg font-bold">₹{route.fare}</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Shuffle className="w-4 h-4 mx-auto mb-2 text-orange-400" />
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Changes</div>
            <div className="text-lg font-bold">{route.interchange_count}</div>
          </div>
        </div>

        {/* Station Timeline */}
        <div className="space-y-0">
          <h3 className="text-sm font-bold text-foreground mb-6">
            Route Progress — {route.num_stations} Stations ({route.distance_km} km)
          </h3>
          {route.path.map((station, index) => {
            const isFirst = index === 0;
            const isLast = index === route.path.length - 1;
            const nextStation = route.path[index + 1];
            const isLineSwitch = nextStation && station.line_name !== nextStation.line_name;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.02 }}
                className="relative pl-10"
              >
                {/* Vertical Line */}
                {!isLast && (
                  <div 
                    className="absolute left-[13px] top-6 w-1.5 h-full opacity-60" 
                    style={{ backgroundColor: station.line_color || "#8B5CF6" }}
                  />
                )}

                {/* Station Node */}
                <div
                  className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                    station.is_interchange ? "bg-white shadow-lg" : "bg-background"
                  }`}
                  style={{ borderColor: station.line_color || "#8B5CF6" }}
                >
                  {station.is_interchange ? (
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                  ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                  )}
                </div>

                {/* Station Info */}
                <div className="pb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isFirst || isLast || station.is_interchange ? "font-bold" : "font-medium text-muted-foreground"}`}>
                        {station.stop_name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {station.line_name}
                      </p>
                    </div>
                    {station.is_interchange && (
                       <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold uppercase tracking-tighter">
                          Interchange
                       </span>
                    )}
                  </div>

                  {isLineSwitch && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4 mb-2 p-3 rounded-xl bg-orange-500/5 border border-dashed border-orange-500/30 flex items-center gap-3"
                    >
                      <Shuffle className="w-4 h-4 text-orange-400" />
                      <p className="text-[10px] font-bold text-orange-400 uppercase">
                        Change to {nextStation.line_name}
                      </p>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="p-6 border-t border-border bg-card">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30"
        >
          <Navigation className="w-5 h-5" />
          <span>Launch Navigation</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
