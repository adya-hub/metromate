import { motion } from "motion/react";
import { IndianRupee, Users, CreditCard, Ticket } from "lucide-react";
import { useState } from "react";

export function FareCalculator() {
  const [passengers, setPassengers] = useState(1);
  const baseFare = 50;
  const totalFare = baseFare * passengers;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-3xl bg-gradient-to-br from-violet-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-white/10 space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Fare Breakdown</h3>
        <div className="p-3 rounded-xl bg-violet-600/20 border border-violet-500/30">
          <IndianRupee className="w-5 h-5 text-violet-400" />
        </div>
      </div>

      {/* Passenger Selector */}
      <div className="space-y-3">
        <label className="text-sm text-muted-foreground flex items-center gap-2">
          <Users className="w-4 h-4" />
          Number of Passengers
        </label>
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPassengers(Math.max(1, passengers - 1))}
            className="w-10 h-10 rounded-xl bg-card/60 border border-white/10 flex items-center justify-center hover:border-violet-500/50 transition-colors"
          >
            <span className="text-xl">-</span>
          </motion.button>
          <div className="flex-1 text-center">
            <span className="text-3xl font-bold">{passengers}</span>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setPassengers(passengers + 1)}
            className="w-10 h-10 rounded-xl bg-card/60 border border-white/10 flex items-center justify-center hover:border-violet-500/50 transition-colors"
          >
            <span className="text-xl">+</span>
          </motion.button>
        </div>
      </div>

      {/* Fare Details */}
      <div className="space-y-3 p-4 rounded-2xl bg-background/50 border border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Base Fare (per person)</span>
          <span className="font-medium">₹{baseFare}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Number of Passengers</span>
          <span className="font-medium">×{passengers}</span>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="flex items-center justify-between">
          <span className="font-semibold">Total Fare</span>
          <span className="text-2xl font-bold text-violet-400">₹{totalFare}</span>
        </div>
      </div>

      {/* Payment Options */}
      <div className="grid grid-cols-2 gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-xl bg-card/60 border border-white/10 hover:border-violet-500/50 transition-all flex items-center justify-center gap-2"
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-sm">Metro Card</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-3 rounded-xl bg-card/60 border border-white/10 hover:border-violet-500/50 transition-all flex items-center justify-center gap-2"
        >
          <Ticket className="w-4 h-4" />
          <span className="text-sm">Token</span>
        </motion.button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium shadow-lg shadow-violet-500/30"
      >
        Book Tickets
      </motion.button>
    </motion.div>
  );
}
