import { motion } from "framer-motion";
import { Home, Map, Search, User } from "lucide-react";
import { useState } from "react";

interface MobileNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "map", icon: Map, label: "Map" },
  { id: "search", icon: Search, label: "Search" },
  { id: "profile", icon: User, label: "Profile" },
];

export function MobileNav({ activeTab, onTabChange }: MobileNavProps) {
  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden"
    >
      <div className="mx-4 mb-4 px-2 py-3 rounded-3xl bg-card backdrop-blur-xl border border-border shadow-2xl">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  if (item.id === "profile") return;
                  onTabChange(item.id);
                }}
                disabled={item.id === "profile"}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${
                  isActive ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/50" : "text-muted-foreground"
                } ${item.id === "profile" ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white"
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
