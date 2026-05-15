import { motion } from "framer-motion";
import { Train, Bus, Map as MapIcon } from "lucide-react";

interface NavigationTabsProps {
  activeTab: "metro" | "bus" | "multimodal";
  onChange: (tab: "metro" | "bus" | "multimodal") => void;
}

export function NavigationTabs({ activeTab, onChange }: NavigationTabsProps) {
  const tabs = [
    { id: "metro", label: "Metro", icon: Train },
    { id: "bus", label: "Bus", icon: Bus },
    { id: "multimodal", label: "Multi-Modal", icon: MapIcon },
  ] as const;

  return (
    <div className="flex justify-center w-full max-w-md mx-auto p-1 bg-muted/50 rounded-2xl backdrop-blur-md border border-white/10 relative z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id as any)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${
              isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80"
            }`}
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 bg-background shadow-sm rounded-xl border border-white/5"
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon className="w-4 h-4" />
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
