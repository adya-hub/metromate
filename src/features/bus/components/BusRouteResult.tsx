"use client";

import { motion } from "framer-motion";
import {
  Clock, IndianRupee, MapPin, Navigation, Shuffle, X, Circle, Bus
} from "lucide-react";
import { type RoutePlanResult } from "@/services/api/transitAPI";

interface RouteResultProps {
  route: RoutePlanResult;
  onClose?: () => void;
}

export function BusRouteResult({ route, onClose }: RouteResultProps) {
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
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
              <Bus className="w-4 h-4 text-orange-400" />
              Delhi Bus Transit Network
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
        <div className="space-y-4 p-5 rounded-3xl bg-gradient-to-br from-orange-600/5 to-amber-600/5 border border-border shadow-inner">
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

        {/* Key Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Clock className="w-4 h-4 mx-auto mb-2 text-orange-400" />
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Time</div>
            <div className="text-lg font-bold">{route.time_minutes} min</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <IndianRupee className="w-4 h-4 mx-auto mb-2 text-green-400" />
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Fare</div>
            <div className="text-lg font-bold">₹{route.fare}</div>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border text-center">
            <Shuffle className="w-4 h-4 mx-auto mb-2 text-amber-400" />
            <div className="text-[10px] text-muted-foreground uppercase font-bold">Transfers</div>
            <div className="text-lg font-bold">{route.interchange_count}</div>
          </div>
        </div>

        {/* Station Timeline */}
        <div className="space-y-0">
          <h3 className="text-sm font-bold text-foreground mb-6">
            Journey Progress — {route.num_stations} Bus Stops
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
                    style={{ backgroundColor: station.line_color || "#F97316" }}
                  />
                )}

                {/* Station Node */}
                <div
                  className={`absolute left-0 top-1 w-8 h-8 rounded-full border-2 flex items-center justify-center z-10 ${
                    station.is_interchange ? "bg-white shadow-lg" : "bg-background"
                  }`}
                  style={{ borderColor: station.line_color || "#F97316" }}
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
                       <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold uppercase tracking-tighter">
                          Transfer
                       </span>
                    )}
                  </div>

                  {isLineSwitch && (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="mt-4 mb-2 p-3 rounded-xl bg-orange-500/5 border border-dashed border-orange-500/30 flex items-center gap-3"
                    >
                      <Shuffle className="w-4 h-4 text-amber-500" />
                      <p className="text-[10px] font-bold text-amber-500 uppercase">
                        Transfer to {nextStation.line_name}
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
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30"
        >
          <Navigation className="w-5 h-5" />
          <span>Track Bus Route</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
