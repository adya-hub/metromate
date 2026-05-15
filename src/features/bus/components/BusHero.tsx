"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BusSearchBox } from "./BusSearchBox";
import { ArrowRight, Zap, Clock, TrendingDown, MapPin, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface HeroProps {
  onSearch?: (fromId: string, toId: string) => void;
  isPlanning?: boolean;
}

// Popular routes using real stop_ids from the Delhi Metro backend
const popularRoutes = [
  { from: "ISBT Kashmere Gate", fromId: "3653", to: "Nehru Place", toId: "49", time: "~45 min" },
  { from: "Rohini Sec 18", fromId: "13163", to: "Connaught Place", toId: "14117", time: "~55 min" },
  { from: "Dwarka Mor", fromId: "14464", to: "AIIMS", toId: "15317", time: "~60 min" },
];

export function BusHero({ onSearch, isPlanning = false }: HeroProps) {
  const [originId, setOriginId] = useState("");
  const [originName, setOriginName] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [destinationName, setDestinationName] = useState("");

  const handleOriginSelect = (id: string, name: string) => {
    console.log(`[Hero] 📍 Origin selected: "${name}" (${id})`);
    setOriginId(id);
    setOriginName(name);
  };

  const handleDestinationSelect = (id: string, name: string) => {
    console.log(`[Hero] 🏁 Destination selected: "${name}" (${id})`);
    setDestinationId(id);
    setDestinationName(name);
  };

  const handleSearch = () => {
    console.log(`[Hero] 🔍 Find Route: from="${originId}" to="${destinationId}"`);
    if (!originId || !destinationId) {
      toast.error("Please select both origin and destination stops", {
        description: "Type in the search boxes and click a suggestion.",
      });
      return;
    }
    onSearch?.(originId, destinationId);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-500/10 blur-[120px]"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]"
          animate={{ x: [0, -30, 0], y: [0, 50, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl w-full space-y-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-6"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm">DMRC Official Network · Live Routing</span>
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Delhi <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Bus</span> Transit
          </h1>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
            Plan your journey across 10,500+ bus stops instantly.
          </p>
        </motion.div>

        {/* Search Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 p-8 rounded-3xl glass-card-strong shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-blue-600/5 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <BusSearchBox
                placeholder="Origin — e.g. Rajiv Chowk"
                icon="origin"
                onSelect={handleOriginSelect}
              />
              <BusSearchBox
                placeholder="Destination — e.g. Noida Sec 52"
                icon="destination"
                onSelect={handleDestinationSelect}
              />
            </div>

            {/* Selected stop confirmation tags */}
            <AnimatePresence>
              {(originName || destinationName) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 flex-wrap"
                >
                  {originName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                      From: {originName}
                    </span>
                  )}
                  {destinationName && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      To: {destinationName}
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: isPlanning ? 1 : 1.02 }}
              whileTap={{ scale: isPlanning ? 1 : 0.98 }}
              onClick={handleSearch}
              disabled={isPlanning}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-lg shadow-xl shadow-violet-500/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isPlanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Planning Route...
                </>
              ) : (
                <>
                  Find Best Route
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Popular Routes */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-medium text-muted-foreground text-center">Popular Routes</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {popularRoutes.map((route, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  console.log(`[Hero] 🚌 Popular route: ${route.fromId} → ${route.toId}`);
                  onSearch?.(route.fromId, route.toId);
                }}
                className="p-4 rounded-2xl bg-card backdrop-blur-xl border border-border hover:border-violet-500/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{route.from}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm font-medium truncate">{route.to}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-500 transition-colors flex-shrink-0" />
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{route.time}</span>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
