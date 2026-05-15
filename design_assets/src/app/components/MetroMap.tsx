import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ZoomIn, ZoomOut, Navigation } from "lucide-react";

interface Station {
  id: string;
  name: string;
  line: string;
  x: number;
  y: number;
  isInterchange?: boolean;
}

interface MetroMapProps {
  selectedRoute?: string[];
  onStationClick?: (station: Station) => void;
}

const stations: Station[] = [
  // Red Line
  { id: "r1", name: "Rithala", line: "red", x: 200, y: 100 },
  { id: "r2", name: "Netaji Subhash Place", line: "red", x: 250, y: 150, isInterchange: true },
  { id: "r3", name: "Kashmere Gate", line: "red", x: 350, y: 250, isInterchange: true },
  { id: "r4", name: "New Delhi", line: "red", x: 400, y: 300, isInterchange: true },
  { id: "r5", name: "Central Secretariat", line: "red", x: 450, y: 350, isInterchange: true },
  { id: "r6", name: "AIIMS", line: "red", x: 500, y: 400 },

  // Yellow Line
  { id: "y1", name: "Samaypur Badli", line: "yellow", x: 300, y: 50 },
  { id: "y2", name: "Vishwavidyalaya", line: "yellow", x: 320, y: 150 },
  { id: "y3", name: "Chandni Chowk", line: "yellow", x: 350, y: 250 },
  { id: "y4", name: "Rajiv Chowk", line: "yellow", x: 420, y: 320, isInterchange: true },
  { id: "y5", name: "Hauz Khas", line: "yellow", x: 480, y: 450, isInterchange: true },
  { id: "y6", name: "Huda City Centre", line: "yellow", x: 550, y: 550 },

  // Blue Line
  { id: "b1", name: "Dwarka Sector 21", line: "blue", x: 100, y: 350 },
  { id: "b2", name: "Rajouri Garden", line: "blue", x: 250, y: 300, isInterchange: true },
  { id: "b3", name: "Moti Nagar", line: "blue", x: 300, y: 300 },
  { id: "b4", name: "Yamuna Bank", line: "blue", x: 500, y: 250, isInterchange: true },
  { id: "b5", name: "Noida City Centre", line: "blue", x: 650, y: 200 },

  // Green Line
  { id: "g1", name: "Kirti Nagar", line: "green", x: 200, y: 280 },
  { id: "g2", name: "Ashok Park Main", line: "green", x: 280, y: 380 },
  { id: "g3", name: "Inderlok", line: "green", x: 280, y: 200, isInterchange: true },
];

const lineColors: Record<string, string> = {
  red: "var(--metro-red)",
  yellow: "var(--metro-yellow)",
  blue: "var(--metro-blue)",
  green: "var(--metro-green)",
  orange: "var(--metro-orange)",
  violet: "var(--metro-violet)",
  pink: "var(--metro-pink)",
  magenta: "var(--metro-magenta)",
};

export function MetroMap({ selectedRoute = [], onStationClick }: MetroMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => setZoom(Math.min(zoom + 0.2, 3));
  const handleZoomOut = () => setZoom(Math.max(zoom - 0.2, 0.5));

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl bg-background/50 backdrop-blur-xl border border-white/5">
      {/* Controls */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomIn}
          className="p-3 rounded-xl bg-card/80 backdrop-blur-xl border border-white/10 text-foreground hover:bg-card/90 transition-colors"
        >
          <ZoomIn className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleZoomOut}
          className="p-3 rounded-xl bg-card/80 backdrop-blur-xl border border-white/10 text-foreground hover:bg-card/90 transition-colors"
        >
          <ZoomOut className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="p-3 rounded-xl bg-card/80 backdrop-blur-xl border border-white/10 text-foreground hover:bg-card/90 transition-colors"
        >
          <Navigation className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Map Canvas */}
      <svg
        className="w-full h-full cursor-move"
        viewBox="0 0 800 600"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Metro Lines */}
          <motion.path
            d="M 200,100 L 250,150 L 350,250 L 400,300 L 450,350 L 500,400"
            stroke={lineColors.red}
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="drop-shadow-[0_0_8px_var(--metro-red)]"
          />
          <motion.path
            d="M 300,50 L 320,150 L 350,250 L 420,320 L 480,450 L 550,550"
            stroke={lineColors.yellow}
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
            className="drop-shadow-[0_0_8px_var(--metro-yellow)]"
          />
          <motion.path
            d="M 100,350 L 250,300 L 300,300 L 500,250 L 650,200"
            stroke={lineColors.blue}
            strokeWidth="4"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.4 }}
            className="drop-shadow-[0_0_8px_var(--metro-blue)]"
          />

          {/* Stations */}
          {stations.map((station) => {
            const isSelected = selectedRoute.includes(station.id);
            const isInterchange = station.isInterchange;

            return (
              <g key={station.id}>
                <motion.circle
                  cx={station.x}
                  cy={station.y}
                  r={isInterchange ? 10 : 7}
                  fill={isSelected ? lineColors[station.line] : "rgba(255,255,255,0.9)"}
                  stroke={lineColors[station.line]}
                  strokeWidth={isSelected ? 4 : 2}
                  className={`cursor-pointer ${isSelected ? "drop-shadow-[0_0_12px_currentColor]" : ""}`}
                  style={{ color: lineColors[station.line] }}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onStationClick?.(station)}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.6 + stations.indexOf(station) * 0.02 }}
                />
                {isSelected && (
                  <motion.circle
                    cx={station.x}
                    cy={station.y}
                    r={15}
                    fill="none"
                    stroke={lineColors[station.line]}
                    strokeWidth={2}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-white/10">
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(lineColors).map(([line, color]) => (
            <div key={line} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
              />
              <span className="text-sm capitalize text-muted-foreground">{line} Line</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
