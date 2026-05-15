import { motion } from "framer-motion";
import { Menu, Moon, Sun, User, Settings, Bell } from "lucide-react";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface NavbarProps {
  onSettingsClick?: () => void;
}

export function Navbar({ onSettingsClick }: NavbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-card/70 backdrop-blur-xl border-b border-border/50"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/50"
            >
              <span className="text-white font-bold text-xl">M</span>
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
              MetroMate
            </span>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl hover:bg-accent/50 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-xl hover:bg-accent transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettingsClick}
              className="p-2 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSettingsClick}
              className="p-2 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <User className="w-5 h-5" />
            </motion.button>
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMenu(!showMenu)}
            className="md:hidden p-2 rounded-xl hover:bg-accent/50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-4 right-4 z-40 p-4 rounded-2xl bg-card backdrop-blur-xl border border-border md:hidden"
        >
          <div className="flex flex-col gap-2">
            <button className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors">
              <Bell className="w-5 h-5" />
              <span>Notifications</span>
            </button>
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>Theme</span>
            </button>
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
            <button
              onClick={onSettingsClick}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 transition-colors"
            >
              <User className="w-5 h-5" />
              <span>Profile</span>
            </button>
          </div>
        </motion.div>
      )}
    </>
  );
}
