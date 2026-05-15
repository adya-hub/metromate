import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { MetroMap } from "./components/MetroMap";
import { RouteResult } from "./components/RouteResult";
import { AIAssistant } from "./components/AIAssistant";
import { MobileNav } from "./components/MobileNav";
import { LiveStatus } from "./components/LiveStatus";
import { NearbyStations } from "./components/NearbyStations";
import { QuickActions } from "./components/QuickActions";
import { FareCalculator } from "./components/FareCalculator";
import { MetroStats } from "./components/MetroStats";
import { StatusBar } from "./components/StatusBar";
import { Footer } from "./components/Footer";
import { SettingsPanel } from "./components/SettingsPanel";

export default function App() {
  const [view, setView] = useState<"home" | "map" | "route">("home");
  const [routeData, setRouteData] = useState<{ from: string; to: string } | null>(null);
  const [mobileTab, setMobileTab] = useState("home");
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1500);
  }, []);

  useEffect(() => {
    if (mobileTab === "home") setView("home");
    if (mobileTab === "map") setView("map");
  }, [mobileTab]);

  const handleSearch = (from: string, to: string) => {
    setRouteData({ from, to });
    setView("route");
  };

  const handleCloseRoute = () => {
    setView("home");
    setRouteData(null);
    setMobileTab("home");
  };

  if (isLoading) {
    return (
      <div className="size-full min-h-screen bg-background flex items-center justify-center dark">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/50"
          >
            <span className="text-white font-bold text-3xl">M</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl font-bold bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent"
          >
            MetroMate
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="w-48 h-1 mx-auto rounded-full bg-gradient-to-r from-violet-600 to-blue-600"
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="size-full min-h-screen bg-background text-foreground dark overflow-x-hidden">
      <Navbar onSettingsClick={() => setShowSettings(true)} />
      <StatusBar />

      <main className="pt-20 pb-24 md:pb-6">
        <AnimatePresence mode="wait">
          {view === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <Hero onSearch={handleSearch} />
              <div className="max-w-7xl mx-auto px-6 space-y-12">
                <MetroStats />
                <QuickActions />
                <div className="grid lg:grid-cols-2 gap-8">
                  <LiveStatus />
                  <FareCalculator />
                </div>
                <NearbyStations />
              </div>
            </motion.div>
          )}

          {view === "map" && (
            <motion.div
              key="map"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-7xl mx-auto px-6 py-6"
            >
              <div className="h-[calc(100vh-200px)]">
                <MetroMap />
              </div>
            </motion.div>
          )}

          {view === "route" && routeData && (
            <motion.div
              key="route"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="grid md:grid-cols-2 gap-6 max-w-7xl mx-auto px-6 py-6"
            >
              <div className="h-[calc(100vh-200px)] hidden md:block">
                <MetroMap selectedRoute={["r3", "r4", "r5"]} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {view === "route" && routeData && (
          <RouteResult
            from={routeData.from}
            to={routeData.to}
            onClose={handleCloseRoute}
          />
        )}
      </AnimatePresence>

      <Footer />

      <AIAssistant />
      <MobileNav activeTab={mobileTab} onTabChange={setMobileTab} />
      <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}