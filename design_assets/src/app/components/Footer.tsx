import { motion } from "motion/react";
import { Github, Twitter, Mail, Heart } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-20 py-12 px-6 border-t border-white/10 bg-card/50 backdrop-blur-xl hidden md:block">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/50">
                <span className="text-white font-bold text-xl">M</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                MetroMate
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your intelligent companion for navigating Delhi Metro with ease and efficiency.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-violet-400 transition-colors">Metro Map</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Live Status</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Fare Calculator</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Route Planner</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-violet-400 transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">FAQs</a></li>
              <li><a href="#" className="hover:text-violet-400 transition-colors">Feedback</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex gap-3">
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-background/50 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/50 transition-all"
              >
                <Twitter className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-background/50 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/50 transition-all"
              >
                <Github className="w-5 h-5" />
              </motion.a>
              <motion.a
                href="#"
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.9 }}
                className="p-3 rounded-xl bg-background/50 hover:bg-violet-600/20 border border-white/10 hover:border-violet-500/50 transition-all"
              >
                <Mail className="w-5 h-5" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} MetroMate. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>for Delhi Metro commuters</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
