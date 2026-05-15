import { motion } from "motion/react";
import { Activity, Clock, AlertCircle, CheckCircle } from "lucide-react";

const metroLines = [
  { name: "Red Line", status: "operational", color: "var(--metro-red)", delay: "On time" },
  { name: "Yellow Line", status: "operational", color: "var(--metro-yellow)", delay: "On time" },
  { name: "Blue Line", status: "delayed", color: "var(--metro-blue)", delay: "5 min delay" },
  { name: "Green Line", status: "operational", color: "var(--metro-green)", delay: "On time" },
  { name: "Violet Line", status: "operational", color: "var(--metro-violet)", delay: "On time" },
  { name: "Orange Line", status: "maintenance", color: "var(--metro-orange)", delay: "Under maintenance" },
];

export function LiveStatus() {
  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Live Metro Status</h2>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Activity className="w-5 h-5 text-violet-500" />
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {metroLines.map((line, index) => (
          <motion.div
            key={line.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{
                    backgroundColor: line.color,
                    boxShadow: `0 0 12px ${line.color}`
                  }}
                />
                <span className="font-medium">{line.name}</span>
              </div>

              {line.status === "operational" && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {line.status === "delayed" && (
                <Clock className="w-5 h-5 text-yellow-500" />
              )}
              {line.status === "maintenance" && (
                <AlertCircle className="w-5 h-5 text-orange-500" />
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{line.delay}</span>
              <div className={`text-xs px-2 py-1 rounded-lg ${
                line.status === "operational" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                line.status === "delayed" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" :
                "bg-orange-500/20 text-orange-400 border border-orange-500/30"
              }`}>
                {line.status === "operational" ? "Operational" :
                 line.status === "delayed" ? "Delayed" : "Maintenance"}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
