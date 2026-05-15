"use client";

import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";
import { 
  ZoomIn, ZoomOut, Maximize2, Minimize2, 
  Navigation, Map as MapIcon, Loader2, 
  Info, Share2
} from "lucide-react";
import { type RoutePlanResult } from "@/services/api/transitAPI";
import { StationDetailsSheet } from "./StationDetailsSheet";
import { getTrainArrivals } from "@/services/metro/liveMetroAPI";

interface MetroSVGMapProps {
  selectedRoute?: RoutePlanResult | null;
  onStationClick?: (stationName: string) => void;
}

export function MetroSVGMap({ selectedRoute, onStationClick }: MetroSVGMapProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [stationCoords, setStationCoords] = useState<Record<string, { x: number; y: number }>>({});
  const [zoom, setZoom] = useState<number>(0.3);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedStation, setSelectedStation] = useState<any | null>(null);
  const [arrivals, setArrivals] = useState<any[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Motion values for smooth pan
  const x = useMotionValue(-500); 
  const y = useMotionValue(-500); 
  const springX = useSpring(x, { damping: 40, stiffness: 300 });
  const springY = useSpring(y, { damping: 40, stiffness: 300 });

  // Calculate drag constraints based on zoom
  const [constraints, setConstraints] = useState({ left: -3000, right: 0, top: -3000, bottom: 0 });

  useLayoutEffect(() => {
    const updateConstraints = () => {
      if (!containerRef.current) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      const mapW = 3864 * zoom;
      const mapH = 2933 * zoom;
      
      // Strict boundaries
      const leftBound = mapW > width ? width - mapW : (width - mapW) / 2;
      const rightBound = mapW > width ? 0 : (width - mapW) / 2;
      const topBound = mapH > height ? height - mapH : (height - mapH) / 2;
      const bottomBound = mapH > height ? 0 : (height - mapH) / 2;
      
      setConstraints({
        left: leftBound,
        right: rightBound,
        top: topBound,
        bottom: bottomBound
      });
      console.log(`[MetroSVGMap] Constraints updated:`, { left: leftBound, right: rightBound, top: topBound, bottom: bottomBound, zoom });
    };

    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, [zoom]);

  // Load and parse SVG
  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch("/maps/dmrc-map.svg");
        const text = await response.text();
        console.log(`[MetroSVGMap] SVG loaded: ${text.length} bytes`);
        
        // Clean up SVG to make it interactive and responsive
        const parser = new DOMParser();
        const doc = parser.parseFromString(text, "image/svg+xml");
        const svgElement = doc.querySelector("svg");
        
        if (svgElement) {
          // Force viewBox if missing for proper scaling
          if (!svgElement.getAttribute("viewBox")) {
            svgElement.setAttribute("viewBox", "0 0 3864 2933");
          }
          // Remove fixed dimensions so it fits container
          svgElement.removeAttribute("width");
          svgElement.removeAttribute("height");
          svgElement.style.width = "100%";
          svgElement.style.height = "100%";
        }

        const tspans = doc.querySelectorAll("tspan");
        const coords: Record<string, { x: number; y: number }> = {};

        tspans.forEach((tspan) => {
          const name = tspan.textContent?.trim();
          if (name) {
            const textEl = tspan.closest("text");
            if (textEl) {
              const xVal = parseFloat(textEl.getAttribute("x") || "0");
              const yVal = parseFloat(textEl.getAttribute("y") || "0");
              coords[name] = { x: xVal, y: yVal };
              
              // Make text elements interactive
              textEl.style.cursor = "pointer";
              textEl.style.transition = "fill 0.2s ease";
            }
          }
        });
        
        // Custom name fixes for common DMRC stations
        if (coords["Rajiv Chowk"]) coords["Rajiv Chowk Station"] = coords["Rajiv Chowk"];
        if (coords["Kashmere Gate"]) coords["Kashmere Gate Station"] = coords["Kashmere Gate"];
        
        setStationCoords(coords);
        const processedSvg = new XMLSerializer().serializeToString(doc);
        setSvgContent(processedSvg);
        setLoading(false);
      } catch (error) {
        console.error("Failed to load SVG map:", error);
        setLoading(false);
      }
    };

    fetchSvg();
  }, []);

  // Zoom handlers
  const handleZoomIn = () => setZoom((prev: number) => Math.min(prev + 0.15, 3));
  const handleZoomOut = () => setZoom((prev: number) => Math.max(prev - 0.15, 0.1));
  const handleReset = () => {
    setZoom(0.3);
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      const mapW = 3864 * 0.3;
      const mapH = 2933 * 0.3;
      x.set((width - mapW) / 2);
      y.set((height - mapH) / 2);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleMapClick = (e: React.MouseEvent) => {
    if (isDragging) return;

    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clickX = (e.clientX - rect.left) / zoom;
    const clickY = (e.clientY - rect.top) / zoom;

    let closest: string | null = null;
    let minDist = 30; // pixels

    Object.entries(stationCoords).forEach(([name, coord]) => {
      const dist = Math.sqrt(Math.pow(clickX - coord.x, 2) + Math.pow(clickY - coord.y, 2));
      if (dist < minDist) {
        minDist = dist;
        closest = name;
      }
    });

    if (closest) {
      const nameStr = closest as string;
      const stationData = {
        stop_id: nameStr,
        stop_name: nameStr,
        is_interchange: nameStr.toLowerCase().includes("interchange") || nameStr.toLowerCase().includes("gate"),
        all_lines: [{ name: "Metro Line", color: "#8b5cf6" }],
        line_name: "Network Station",
        line_color: "#8b5cf6"
      };
      setSelectedStation(stationData);
      getTrainArrivals(nameStr).then(res => setArrivals(res?.arrivals ?? []));
      onStationClick?.(nameStr);
    } else {
      setSelectedStation(null);
    }
  };

  // Calculate the path to highlight
  const highlightedPath = useMemo(() => {
    if (!selectedRoute || !selectedRoute.path || selectedRoute.path.length === 0) return null;
    
    const points: { x: number; y: number }[] = [];
    selectedRoute.path.forEach((step: any) => {
      const name = step.stop_name.replace(" Station", "");
      let coord = stationCoords[name] || stationCoords[step.stop_name];
      
      if (!coord) {
        const match = Object.keys(stationCoords).find(k => k.includes(name) || name.includes(k));
        if (match) coord = stationCoords[match];
      }

      if (coord) points.push(coord);
    });

    if (points.length < 2) return null;
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(" ");
  }, [selectedRoute, stationCoords]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0f1d] rounded-3xl overflow-hidden">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-violet-500/10 border-t-violet-500 rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <MapIcon className="w-6 h-6 text-violet-500/50" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white/80">Loading Neural Network</h3>
            <p className="text-[10px] text-violet-400/60 font-medium tracking-widest uppercase">Initializing Schematic Vector Assets</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full bg-[#0a0f1d] rounded-3xl overflow-hidden border border-white/5 shadow-2xl group select-none ${isFullscreen ? 'rounded-none' : ''}`}
    >
      <div 
        className="absolute inset-0 cursor-grab active:cursor-grabbing overflow-hidden"
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onClick={handleMapClick}
      >
        <motion.div
          ref={mapRef}
          style={{ x, y, scale: zoom }}
          drag
          dragConstraints={constraints}
          dragElastic={0}
          dragMomentum={false}
          className="relative origin-top-left w-[3864px] h-[2933px]"
        >
          {svgContent ? (
            <div 
              dangerouslySetInnerHTML={{ __html: svgContent }} 
              className="absolute inset-0 pointer-events-none opacity-80"
              style={{ filter: "invert(0.9) hue-rotate(180deg) brightness(1.5) contrast(1.2)" }}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-sm text-muted-foreground italic">SVG Content Missing or Failed to Load</p>
            </div>
          )}

          <svg className="absolute inset-0 pointer-events-none" viewBox="0 0 3864 2933">
            <AnimatePresence>
              {highlightedPath && (
                <>
                  <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.3 }}
                    d={highlightedPath}
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="filter blur-xl"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    d={highlightedPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="15 25"
                    className="animate-route-pulse"
                  />
                  
                  {selectedRoute?.path.map((step: any, i: number) => {
                    const name = step.stop_name.replace(" Station", "");
                    const coord = stationCoords[name] || stationCoords[step.stop_name];
                    if (!coord) return null;
                    return (
                      <motion.g key={i} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1 * i }}>
                        <circle cx={coord.x} cy={coord.y} r="15" fill="#8b5cf6" className="animate-pulse" />
                        <circle cx={coord.x} cy={coord.y} r="7" fill="#ffffff" />
                      </motion.g>
                    );
                  })}
                </>
              )}
            </AnimatePresence>
          </svg>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedRoute && (
          <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-4 left-4 right-4 md:top-6 md:left-6 md:right-6 z-50 flex items-start justify-between pointer-events-none"
          >
            <div className="flex flex-col gap-3 pointer-events-auto max-w-full">
              <div className="glass-card-strong p-4 md:px-6 md:py-4 rounded-[1.5rem] md:rounded-[2rem] border border-white/10 shadow-2xl flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-8">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-violet-400/80 mb-1">Departure</span>
                    <span className="text-xs md:text-sm font-bold text-white max-w-[100px] md:max-w-[140px] truncate">{selectedRoute.from}</span>
                  </div>
                  <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shadow-inner">
                    <Navigation className="w-3 h-3 md:w-4 md:h-4 text-violet-400 rotate-90" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-blue-400/80 mb-1">Arrival</span>
                    <span className="text-xs md:text-sm font-bold text-white max-w-[100px] md:max-w-[140px] truncate">{selectedRoute.to}</span>
                  </div>
                </div>

                <div className="hidden md:block w-px h-10 bg-white/10" />
                <div className="md:hidden h-px w-full bg-white/5" />

                <div className="flex items-center justify-between md:justify-start gap-4 md:gap-8">
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-green-400/80 mb-1">Fare</span>
                    <span className="text-lg md:text-xl font-black text-white tracking-tighter">₹{selectedRoute.fare}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-amber-400/80 mb-1">Time</span>
                    <span className="text-lg md:text-xl font-black text-white tracking-tighter">{selectedRoute.time_minutes}m</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest text-violet-400/80 mb-1">Transfers</span>
                    <span className="text-lg md:text-xl font-black text-white tracking-tighter">{selectedRoute.interchange_count}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pointer-events-auto">
               <button className="glass-card-strong p-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all active:scale-95 group shadow-2xl">
                  <Share2 className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-4">
        <div className="flex flex-col bg-[#0f172a]/60 backdrop-blur-3xl rounded-[1.5rem] border border-white/10 shadow-2xl overflow-hidden p-1">
          <ControlButton icon={<ZoomIn className="w-5 h-5" />} onClick={handleZoomIn} label="Zoom In" />
          <div className="h-px bg-white/5 mx-3" />
          <ControlButton icon={<ZoomOut className="w-5 h-5" />} onClick={handleZoomOut} label="Zoom Out" />
          <div className="h-px bg-white/5 mx-3" />
          <ControlButton icon={<Maximize2 className="w-4 h-4" />} onClick={handleReset} label="Reset View" />
        </div>
        
        <button 
          onClick={toggleFullscreen}
          className="bg-[#0f172a]/60 backdrop-blur-3xl p-4 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/5 transition-all active:scale-95 group"
        >
          {isFullscreen ? <Minimize2 className="w-5 h-5 text-white/70" /> : <Maximize2 className="w-5 h-5 text-white/70" />}
        </button>
      </div>

      <StationDetailsSheet 
        station={selectedStation} 
        onClose={() => setSelectedStation(null)} 
        arrivals={arrivals}
      />

      
      <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.6)]" />
    </div>
  );
}

function ControlButton({ icon, onClick, label }: { icon: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="p-4 text-white/50 hover:text-white hover:bg-white/5 transition-all rounded-xl flex items-center justify-center" title={label}>
      {icon}
    </button>
  );
}
