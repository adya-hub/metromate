"use client";

import { motion } from "framer-motion";
import { TrendingUp, Users, Bus, MapPin } from "lucide-react";

const stats = [
  { icon: TrendingUp, label: "Network Length", value: "393km", color: "violet", suffix: "" },
  { icon: MapPin, label: "Total Stations", value: "288", color: "blue", suffix: "" },
  { icon: Users, label: "Daily Riders", value: "6.0M+", color: "green", suffix: "" },
  { icon: MapPin, label: "Metro Lines", value: "12", color: "orange", suffix: "" },
];

const colorClasses: Record<string, { bg: string; text: string; glow: string }> = {
  violet: { bg: "from-violet-600/20 to-violet-600/10", text: "text-violet-400", glow: "shadow-violet-500/50" },
  blue: { bg: "from-blue-600/20 to-blue-600/10", text: "text-blue-400", glow: "shadow-blue-500/50" },
  green: { bg: "from-green-600/20 to-green-600/10", text: "text-green-400", glow: "shadow-green-500/50" },
  orange: { bg: "from-orange-600/20 to-orange-600/10", text: "text-orange-400", glow: "shadow-orange-500/50" },
};

export function MetroStats() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const colors = colorClasses[stat.color];

          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`p-6 rounded-2xl bg-gradient-to-br ${colors.bg} backdrop-blur-xl border border-border hover:shadow-xl ${colors.glow} transition-all`}
            >
              <Icon className={`w-8 h-8 mb-3 ${colors.text}`} />
              <div className="space-y-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">{stat.value}</span>
                  {stat.suffix && <span className="text-sm text-muted-foreground">{stat.suffix}</span>}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
