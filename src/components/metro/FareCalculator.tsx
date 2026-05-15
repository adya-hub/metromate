"use client";

import { motion, AnimatePresence } from "framer-motion";
import { IndianRupee, Users, CreditCard, Ticket, AlertCircle, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { type RoutePlanResult } from "@/services/api/transitAPI";
import { SearchBox } from "@/components/metro/SearchBox";
import { useMetroPlanner } from "@/features/metro/hooks/useMetroAPI";

interface FareCalculatorProps {
  activeRoute?: RoutePlanResult | null;
}

export function FareCalculator({ activeRoute: initialRoute }: FareCalculatorProps) {
  const [passengers, setPassengers] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "token">("card");
  
  const [originId, setOriginId] = useState<string>("");
  const [destId, setDestId] = useState<string>("");
  
  const { activeRoute, isPlanning, error, findRoute, clearRoute } = useMetroPlanner();

  // If page.tsx passes a route (e.g. from Hero search), we can sync it, but the user requested an independent widget flow.
  const currentRoute = activeRoute || initialRoute;

  const handleCalculate = () => {
    if (originId && destId) {
      findRoute(originId, destId);
    }
  };

  const baseFare = currentRoute?.fare || 0;
  const isCard = paymentMethod === "card";
  
  // Metro card gives 10% discount
  const singleFare = isCard ? Math.ceil(baseFare * 0.9) : baseFare;
  const totalFare = singleFare * passengers;
  const discountAmount = (baseFare - singleFare) * passengers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-gradient-to-br from-violet-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-border space-y-6 flex flex-col justify-between h-full"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold tracking-tight">Fare Calculator</h3>
            <p className="text-sm text-muted-foreground">Plan your journey cost</p>
          </div>
          <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30 shadow-inner">
            <IndianRupee className="w-5 h-5 text-violet-400" />
          </div>
        </div>

        {/* Station Selection */}
        <div className="space-y-3 relative z-20">
          <SearchBox
            icon="origin"
            placeholder="Select Origin Station"
            onSelect={(id) => {
              setOriginId(id);
              clearRoute();
            }}
          />
          <SearchBox
            icon="destination"
            placeholder="Select Destination Station"
            onSelect={(id) => {
              setDestId(id);
              clearRoute();
            }}
          />
          
          {!currentRoute && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCalculate}
              disabled={!originId || !destId || isPlanning}
              className="w-full py-3 mt-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isPlanning ? <Loader2 className="w-5 h-5 animate-spin" /> : "Calculate Fare"}
            </motion.button>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="w-4 h-4" />
              Unable to calculate fare for this journey.
            </div>
          )}
        </div>

        <AnimatePresence>
          {currentRoute && !error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6 overflow-hidden"
            >
              {/* Payment Options */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "card" 
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-400 shadow-md shadow-violet-500/10" 
                      : "bg-card border-border hover:border-violet-500/30 text-muted-foreground"
                  }`}
                >
                  <CreditCard className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Metro Card</span>
                  <span className="text-[9px] text-green-400">10% Off</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaymentMethod("token")}
                  className={`p-3 rounded-xl border transition-all flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === "token" 
                      ? "bg-violet-600/20 border-violet-500/50 text-violet-400 shadow-md shadow-violet-500/10" 
                      : "bg-card border-border hover:border-violet-500/30 text-muted-foreground"
                  }`}
                >
                  <Ticket className="w-5 h-5 mb-1" />
                  <span className="text-xs font-bold uppercase tracking-wider">Token</span>
                  <span className="text-[9px] opacity-0">-</span>
                </motion.button>
              </div>

              {/* Passenger Selector */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-card border border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg"><Users className="w-4 h-4" /></div>
                  <span className="text-sm font-medium">Passengers</span>
                </div>
                <div className="flex items-center gap-3">
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPassengers(Math.max(1, passengers - 1))}
                    className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:border-violet-500/50 transition-colors"
                  >
                    <span className="font-medium">-</span>
                  </motion.button>
                  <span className="text-lg font-bold w-4 text-center">{passengers}</span>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setPassengers(Math.min(10, passengers + 1))}
                    className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center hover:border-violet-500/50 transition-colors"
                  >
                    <span className="font-medium">+</span>
                  </motion.button>
                </div>
              </div>

              {/* Fare Breakdown */}
              <div className="space-y-3 p-5 rounded-2xl bg-card border border-border shadow-sm">
                <div className="flex justify-between text-xs text-muted-foreground mb-4">
                  <span className="font-medium truncate max-w-[120px]">{currentRoute.from}</span>
                  <span className="mx-2">→</span>
                  <span className="font-medium truncate max-w-[120px] text-right">{currentRoute.to}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Base Fare</span>
                  <span className="font-medium">₹{baseFare}</span>
                </div>
                {isCard && (
                  <div className="flex items-center justify-between text-sm text-green-400">
                    <span>Card Discount</span>
                    <span className="font-medium">-₹{baseFare - singleFare}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Passengers</span>
                  <span className="font-medium">×{passengers}</span>
                </div>
                
                <div className="h-px bg-border my-2" />
                
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-foreground">Total Fare</span>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {currentRoute.num_stations} stations · {currentRoute.time_minutes} min
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-violet-400">₹{totalFare}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

