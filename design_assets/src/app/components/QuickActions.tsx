import { motion } from "motion/react";
import { MapPin, Clock, IndianRupee, Heart, History, Download } from "lucide-react";

const actions = [
  { icon: MapPin, label: "Nearby Stations", color: "violet" },
  { icon: Clock, label: "Live Timings", color: "blue" },
  { icon: IndianRupee, label: "Fare Calculator", color: "green" },
  { icon: Heart, label: "Saved Routes", color: "pink" },
  { icon: History, label: "Recent Trips", color: "orange" },
  { icon: Download, label: "Offline Map", color: "cyan" },
];

const colorClasses: Record<string, { bg: string; border: string; text: string }> = {
  violet: { bg: "bg-violet-600/20", border: "border-violet-500/30", text: "text-violet-400" },
  blue: { bg: "bg-blue-600/20", border: "border-blue-500/30", text: "text-blue-400" },
  green: { bg: "bg-green-600/20", border: "border-green-500/30", text: "text-green-400" },
  pink: { bg: "bg-pink-600/20", border: "border-pink-500/30", text: "text-pink-400" },
  orange: { bg: "bg-orange-600/20", border: "border-orange-500/30", text: "text-orange-400" },
  cyan: { bg: "bg-cyan-600/20", border: "border-cyan-500/30", text: "text-cyan-400" },
};

export function QuickActions() {
  return (
    <div className="w-full space-y-4">
      <h2 className="text-2xl font-semibold">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const colors = colorClasses[action.color];

          return (
            <motion.button
              key={action.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              className={`p-4 rounded-2xl backdrop-blur-xl border ${colors.bg} ${colors.border} hover:shadow-lg transition-all group`}
            >
              <Icon className={`w-6 h-6 mx-auto mb-2 ${colors.text}`} />
              <span className="text-xs font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
