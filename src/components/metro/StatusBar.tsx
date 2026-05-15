import { motion } from "framer-motion";
import { Wifi, WifiOff, Download, Cloud, Clock } from "lucide-react";
import { useState, useEffect } from "react";

export function StatusBar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-20 right-6 z-40 hidden md:flex items-center gap-3 px-4 py-2 rounded-2xl bg-card/90 backdrop-blur-xl border border-border shadow-xl"
    >
      {/* Time */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/50">
        <Clock className="w-4 h-4 text-violet-400" />
        <span className="text-sm font-medium">{formatTime(currentTime)}</span>
      </div>

      {/* Network Status */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background/50">
        {isOnline ? (
          <>
            <Wifi className="w-4 h-4 text-green-400" />
            <span className="text-xs text-green-400">Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-orange-400" />
            <span className="text-xs text-orange-400">Offline</span>
          </>
        )}
      </div>

      {/* Cloud Sync */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="p-1.5 rounded-lg hover:bg-accent/50 transition-colors"
      >
        <Cloud className="w-4 h-4 text-blue-400" />
      </motion.button>

      {/* Download Map */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 hover:bg-violet-600/30 transition-colors"
      >
        <Download className="w-4 h-4" />
        <span className="text-xs font-medium">Offline Map</span>
      </motion.button>
    </motion.div>
  );
}
