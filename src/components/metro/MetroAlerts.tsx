"use client";

/**
 * MetroAlerts.tsx
 *
 * System-wide service alerts from /api/metro/live/alerts.
 * Auto-dismissible. Animated entry. Severity color-coded.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Info, XCircle, X } from "lucide-react";
import { getMetroAlerts, type MetroAlert } from "@/services/metro/liveMetroAPI";

const severityConfig = {
  info: {
    icon: Info,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
  },
  critical: {
    icon: XCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
};

export function MetroAlerts() {
  const [alerts, setAlerts] = useState<MetroAlert[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    getMetroAlerts().then(setAlerts);
    const interval = setInterval(() => getMetroAlerts().then(setAlerts), 60_000);
    return () => clearInterval(interval);
  }, []);

  const visible = alerts.filter((a) => !dismissed.has(a.id));
  if (visible.length === 0) return null;

  return (
    <div className="space-y-2">
      <AnimatePresence>
        {visible.map((alert) => {
          const cfg = severityConfig[alert.severity];
          const Icon = cfg.icon;
          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -12, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -12, height: 0 }}
              className={`flex items-start gap-3 p-4 rounded-2xl ${cfg.bg} border ${cfg.border}`}
            >
              <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${cfg.color}`}>{alert.title}</p>
                {alert.body && (
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.body}</p>
                )}
                {alert.lines_affected.length > 0 && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Affected: {alert.lines_affected.join(", ")}
                  </p>
                )}
              </div>
              <button
                onClick={() => setDismissed((d) => new Set([...d, alert.id]))}
                className="p-1 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
