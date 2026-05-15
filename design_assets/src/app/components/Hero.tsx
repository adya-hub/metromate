import { motion } from "motion/react";
import { SearchBox } from "./SearchBox";
import { ArrowRight, Zap, Clock, TrendingDown, MapPin } from "lucide-react";
import { useState } from "react";

interface HeroProps {
  onSearch?: (from: string, to: string) => void;
}

const popularRoutes = [
  { from: "Rajiv Chowk", to: "Noida City Centre", time: "42 min", fare: "₹50" },
  { from: "New Delhi", to: "Dwarka Sector 21", time: "38 min", fare: "₹40" },
  { from: "Kashmere Gate", to: "Huda City Centre", time: "55 min", fare: "₹60" },
];

export function Hero({ onSearch }: HeroProps) {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSearch = () => {
    if (origin && destination) {
      onSearch?.(origin, destination);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-500/10 blur-[120px]"
          animate={{
            x: [0, 50, 0],
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-500/10 blur-[120px]"
          animate={{
            x: [0, -30, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Content */}
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
            <span className="text-sm">Smart Metro Navigation</span>
          </motion.div>

          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
            MetroMate
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your intelligent companion for navigating Delhi Metro. Find routes, check fares, and travel smarter.
          </p>
        </motion.div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4 p-8 rounded-3xl glass-card-strong shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-transparent to-blue-600/5 pointer-events-none" />
          <div className="relative z-10">
          <div className="grid md:grid-cols-2 gap-4">
            <SearchBox
              placeholder="From station"
              icon="origin"
              value={origin}
              onSelect={setOrigin}
            />
            <SearchBox
              placeholder="To station"
              icon="destination"
              value={destination}
              onSelect={setDestination}
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-violet-500/50 transition-all"
          >
            <span>Find Best Route</span>
            <ArrowRight className="w-5 h-5" />
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
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSearch?.(route.from, route.to)}
                className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-white/10 hover:border-violet-500/50 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium">{route.from}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-sm font-medium">{route.to}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-violet-500 transition-colors" />
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{route.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    <span>{route.fare}</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
