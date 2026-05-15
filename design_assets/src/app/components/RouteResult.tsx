import { motion } from "motion/react";
import { Clock, IndianRupee, ArrowRight, MapPin, Navigation, Shuffle } from "lucide-react";
import { useState } from "react";

interface RouteStep {
  station: string;
  line: string;
  lineColor: string;
  isInterchange?: boolean;
}

interface RouteResultProps {
  from: string;
  to: string;
  onClose?: () => void;
}

const mockRoute: RouteStep[] = [
  { station: "Rajiv Chowk", line: "Yellow Line", lineColor: "var(--metro-yellow)" },
  { station: "New Delhi", line: "Yellow Line", lineColor: "var(--metro-yellow)", isInterchange: true },
  { station: "Kashmere Gate", line: "Red Line", lineColor: "var(--metro-red)", isInterchange: true },
  { station: "Netaji Subhash Place", line: "Red Line", lineColor: "var(--metro-red)" },
  { station: "Noida City Centre", line: "Blue Line", lineColor: "var(--metro-blue)" },
];

const routeOptions = [
  { name: "Fastest", time: "42 min", fare: "₹50", interchanges: 2, active: true },
  { name: "Cheapest", time: "48 min", fare: "₹40", interchanges: 1, active: false },
  { name: "Less Interchanges", time: "45 min", fare: "₹50", interchanges: 1, active: false },
];

export function RouteResult({ from, to, onClose }: RouteResultProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed right-0 top-0 h-full w-full md:w-[480px] glass-card-strong border-l border-white/10 shadow-2xl z-50 overflow-y-auto scrollbar-thin"
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Route Details</h2>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-accent/50 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>

        {/* From/To */}
        <div className="space-y-3 p-4 rounded-2xl bg-background/50 border border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500 shadow-lg shadow-green-500/50" />
            <span className="font-medium">{from}</span>
          </div>
          <div className="h-8 w-px bg-gradient-to-b from-green-500 to-red-500 ml-[5px]" />
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/50" />
            <span className="font-medium">{to}</span>
          </div>
        </div>

        {/* Route Options Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-background/50 border border-white/10">
          {routeOptions.map((option, index) => (
            <motion.button
              key={option.name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(index)}
              className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                activeTab === index
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-500/50"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <div className="text-xs font-medium">{option.name}</div>
            </motion.button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
            className="p-4 rounded-2xl bg-background/50 border border-white/10 text-center"
          >
            <Clock className="w-5 h-5 mx-auto mb-2 text-violet-500" />
            <div className="text-sm text-muted-foreground">Time</div>
            <div className="text-lg font-semibold">{routeOptions[activeTab].time}</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl bg-background/50 border border-white/10 text-center"
          >
            <IndianRupee className="w-5 h-5 mx-auto mb-2 text-green-500" />
            <div className="text-sm text-muted-foreground">Fare</div>
            <div className="text-lg font-semibold">{routeOptions[activeTab].fare}</div>
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-background/50 border border-white/10 text-center"
          >
            <Shuffle className="w-5 h-5 mx-auto mb-2 text-blue-500" />
            <div className="text-sm text-muted-foreground">Changes</div>
            <div className="text-lg font-semibold">{routeOptions[activeTab].interchanges}</div>
          </motion.div>
        </div>

        {/* Route Timeline */}
        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-4">Journey Steps</h3>
          {mockRoute.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="relative pl-8"
            >
              {/* Line */}
              {index < mockRoute.length - 1 && (
                <div
                  className="absolute left-[11px] top-8 w-0.5 h-full"
                  style={{ backgroundColor: step.lineColor }}
                />
              )}

              {/* Station Dot */}
              <div
                className="absolute left-0 top-3 w-6 h-6 rounded-full border-2 flex items-center justify-center"
                style={{
                  borderColor: step.lineColor,
                  backgroundColor: step.isInterchange ? step.lineColor : "transparent",
                  boxShadow: `0 0 12px ${step.lineColor}`,
                }}
              >
                {step.isInterchange && <Shuffle className="w-3 h-3 text-white" />}
              </div>

              {/* Station Info */}
              <div className="pb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{step.station}</div>
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: step.lineColor }}
                      />
                      {step.line}
                    </div>
                  </div>
                  {step.isInterchange && (
                    <span className="text-xs px-2 py-1 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                      Change
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Live Train Status */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/20 to-blue-600/20 border border-violet-500/30">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative">
              <Navigation className="w-5 h-5 text-violet-400" />
              <motion.div
                className="absolute inset-0"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Navigation className="w-5 h-5 text-violet-400" />
              </motion.div>
            </div>
            <span className="font-medium">Next train arriving</span>
          </div>
          <div className="text-2xl font-bold text-violet-400">3 min 24 sec</div>
        </div>

        {/* Start Navigation Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-medium flex items-center justify-center gap-2 shadow-lg shadow-violet-500/50"
        >
          <Navigation className="w-5 h-5" />
          <span>Start Navigation</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
