"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/metro/Navbar";
import { Hero } from "@/components/metro/Hero";
import { MetroMap } from "@/components/metro/MetroMap";
import { RouteResult } from "@/components/metro/RouteResult";
import { AIAssistant } from "@/components/metro/AIAssistant";
import { MobileNav } from "@/components/metro/MobileNav";
import { LiveStatus } from "@/components/metro/LiveStatus";
import { NearbyStations } from "@/components/metro/NearbyStations";
import { QuickActions } from "@/components/metro/QuickActions";
import { FareCalculator } from "@/components/metro/FareCalculator";
import { MetroStats } from "@/components/metro/MetroStats";
import { StatusBar } from "@/components/metro/StatusBar";
import { Footer } from "@/components/metro/Footer";
import { SettingsPanel } from "@/components/metro/SettingsPanel";
import { NavigationTabs } from "@/components/metro/NavigationTabs";
import { RealtimeStatus } from "@/components/metro/RealtimeStatus";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { toast } from "sonner";
import { useMetroPlanner } from "@/features/metro/hooks/useMetroAPI";
import { useBusPlanner } from "@/features/bus/hooks/useBusAPI";
import { BusHero } from "@/features/bus/components/BusHero";
import { BusRouteResult } from "@/features/bus/components/BusRouteResult";

export default function Home() {
  const {
    activeRoute: metroRoute,
    isPlanning: isMetroPlanning,
    error: metroError,
    findRoute: findMetroRoute,
    clearRoute: clearMetroRoute,
  } = useMetroPlanner();

  const {
    activeRoute: busRoute,
    isPlanning: isBusPlanning,
    error: busError,
    findRoute: findBusRoute,
    clearRoute: clearBusRoute,
  } = useBusPlanner();

  const [appTab, setAppTab] = useState<"metro" | "bus" | "multimodal">("metro");
  // Per-tab view state so switching tabs doesn't reset the other
  const [metroView, setMetroView] = useState<"home" | "map" | "route">("home");
  const [busView, setBusView] = useState<"home" | "route">("home");
  const [mobileTab, setMobileTab] = useState("home");
  const [showSettings, setShowSettings] = useState(false);

  const handleSearch = async (fromId: string, toId: string) => {
    if (appTab === "metro") {
      const result = await findMetroRoute(fromId, toId);
      if (result) setMetroView("route");
      else toast.error("No route found between these stations.", { description: metroError ?? undefined });
    } else if (appTab === "bus") {
      const result = await findBusRoute(fromId, toId);
      if (result) setBusView("route");
      else toast.error("No route found between these bus stops.", { description: busError ?? undefined });
    }
  };

  const handleCloseMetroRoute = () => {
    setMetroView("home");
    clearMetroRoute();
    setMobileTab("home");
  };

  const handleCloseBusRoute = () => {
    setBusView("home");
    clearBusRoute();
  };

  const handleTabChange = (tab: string) => {
    if (tab === "map") { setMetroView("map"); setAppTab("metro"); }
    else if (tab === "home") { setMetroView("home"); }
    else if (tab === "search") {
      setMetroView("home");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setMobileTab(tab);
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <div className="relative flex min-h-screen w-full bg-background text-foreground overflow-x-hidden selection:bg-violet-500/30">
        <SidebarInset className="flex flex-col min-h-screen w-full">
          <Navbar onSettingsClick={() => setShowSettings(true)} />
          <StatusBar />

          <main className="flex-1 pt-20 pb-24 md:pb-6 relative z-10">
            {/* -- TOP NAV TABS --------------------------------------------- */}
            <div className="mb-6 px-4">
              <NavigationTabs activeTab={appTab} onChange={setAppTab} />
            </div>

            <AnimatePresence mode="wait">
              {/* ============================================================
                  METRO TAB
              ============================================================ */}
              {appTab === "metro" && (
                <motion.div
                  key="metro-tab"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="w-full"
                >
                  <AnimatePresence mode="wait">
                    {/* HOME */}
                    {metroView === "home" && (
                      <motion.div
                        key="metro-home"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-16 pb-12"
                      >
                        <Hero onSearch={handleSearch} isPlanning={isMetroPlanning} />
                        <div className="max-w-7xl mx-auto px-6 space-y-16">
                          <MetroStats />
                          <QuickActions />
                          {/* Live Status replaces the old fake panel */}
                          <RealtimeStatus />
                          <div className="grid lg:grid-cols-2 gap-10">
                            <LiveStatus />
                            <FareCalculator activeRoute={metroRoute} />
                          </div>
                          <NearbyStations />
                        </div>
                      </motion.div>
                    )}

                    {/* MAP */}
                    {metroView === "map" && (
                      <motion.div
                        key="metro-map"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="max-w-7xl mx-auto px-6 py-6"
                      >
                        <div className="h-[calc(100svh-280px)] min-h-[500px]">
                          <MetroMap activeRoute={null} />
                        </div>
                      </motion.div>
                    )}

                    {/* ROUTE RESULT */}
                    {metroView === "route" && metroRoute && (
                      <motion.div
                        key="metro-route"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="grid lg:grid-cols-[1fr,480px] gap-8 max-w-[1800px] mx-auto px-6 py-6 h-[calc(100svh-140px)]"
                      >
                        <div className="hidden lg:block h-full relative">
                          <MetroMap activeRoute={metroRoute} />
                        </div>
                        <div className="h-full overflow-y-auto rounded-3xl glass-card-strong border border-border shadow-2xl">
                          <RouteResult route={metroRoute} onClose={handleCloseMetroRoute} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ============================================================
                  BUS TAB
              ============================================================ */}
              {appTab === "bus" && (
                <motion.div
                  key="bus-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full"
                >
                  <AnimatePresence mode="wait">
                    {busView === "home" && (
                      <motion.div
                        key="bus-home"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-16 pb-12"
                      >
                        <BusHero onSearch={handleSearch} isPlanning={isBusPlanning} />
                      </motion.div>
                    )}

                    {busView === "route" && busRoute && (
                      <motion.div
                        key="bus-route"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="max-w-[800px] mx-auto px-6 py-6 h-[calc(100vh-140px)]"
                      >
                        <div className="h-full overflow-y-auto rounded-3xl glass-card-strong border border-border shadow-2xl">
                          <BusRouteResult route={busRoute} onClose={handleCloseBusRoute} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* ============================================================
                  MULTI-MODAL TAB
              ============================================================ */}
              {appTab === "multimodal" && (
                <motion.div
                  key="multimodal-tab"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-7xl mx-auto px-6 py-20 text-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 mb-8">
                    <span className="text-sm font-medium">Coming Soon</span>
                  </div>
                  <h2 className="text-4xl font-bold mb-4">Multi-Modal Transit</h2>
                  <p className="text-muted-foreground text-lg max-w-md mx-auto">
                    Combined Metro + Bus + Walking journeys across Delhi — under development.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {appTab === "metro" && metroView === "home" && <Footer />}
        </SidebarInset>

        <AIAssistant />
        <MobileNav activeTab={mobileTab} onTabChange={handleTabChange} />
        <SettingsPanel isOpen={showSettings} onClose={() => setShowSettings(false)} />

        <div className="fixed top-24 left-6 z-50 md:flex hidden">
          <SidebarTrigger className="glass-card hover:bg-white/10" />
        </div>
      </div>
    </SidebarProvider>
  );
}
