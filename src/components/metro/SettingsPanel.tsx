import { motion } from "framer-motion";
import { X, User, Bell, Globe, Moon, Download, Shield, HelpCircle } from "lucide-react";
import { useState } from "react";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const settingsSections = [
  {
    title: "Account",
    icon: User,
    items: [
      { label: "Profile Settings", value: "" },
      { label: "Travel Preferences", value: "" },
      { label: "Saved Routes", value: "12 routes" },
    ]
  },
  {
    title: "Notifications",
    icon: Bell,
    items: [
      { label: "Live Updates", value: "Enabled" },
      { label: "Route Alerts", value: "Enabled" },
      { label: "Promotional", value: "Disabled" },
    ]
  },
  {
    title: "Appearance",
    icon: Moon,
    items: [
      { label: "Dark Mode", value: "Enabled" },
      { label: "Language", value: "English" },
      { label: "Metro Line Colors", value: "Standard" },
    ]
  },
  {
    title: "Data & Privacy",
    icon: Shield,
    items: [
      { label: "Location Access", value: "While Using" },
      { label: "Analytics", value: "Enabled" },
      { label: "Clear Cache", value: "" },
    ]
  },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-3xl glass-card-strong shadow-2xl scrollbar-thin"
      >
        {/* Header */}
        <div className="sticky top-0 p-6 border-b border-border bg-gradient-to-r from-violet-600/10 via-blue-600/10 to-purple-600/10 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Settings</h2>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-violet-600/10 via-blue-600/10 to-purple-600/10 border border-border"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-violet-500/50">
                A
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">Alex Johnson</h3>
                <p className="text-sm text-muted-foreground">alex.johnson@email.com</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 hover:bg-violet-600/30 transition-colors"
              >
                Edit
              </motion.button>
            </div>
          </motion.div>

          {/* Settings Sections */}
          {settingsSections.map((section, sectionIndex) => {
            const Icon = section.icon;
            return (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (sectionIndex + 1) }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2 text-muted-foreground mb-3">
                  <Icon className="w-5 h-5" />
                  <h3 className="font-semibold">{section.title}</h3>
                </div>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <motion.button
                      key={item.label}
                      whileHover={{ x: 4 }}
                      className="w-full p-4 rounded-xl bg-background/50 border border-border hover:border-violet-500/50 transition-all flex items-center justify-between text-left group"
                    >
                      <span className="font-medium group-hover:text-violet-400 transition-colors">
                        {item.label}
                      </span>
                      {item.value && (
                        <span className="text-sm text-muted-foreground">{item.value}</span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            );
          })}

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 pt-6 border-t border-border">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              <span className="font-medium">Download Data</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 rounded-xl bg-violet-600/20 border border-violet-500/30 text-violet-400 hover:bg-violet-600/30 transition-all flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              <span className="font-medium">Help & Support</span>
            </motion.button>
          </div>

          {/* App Version */}
          <div className="text-center text-sm text-muted-foreground pt-4">
            MetroMate v1.0.0 • Built with care for Delhi Metro
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
