import { motion } from "framer-motion";
import { Wallet, Ticket, Clock, Car } from "lucide-react";

const actions = [
  { id: "recharge", icon: Wallet, label: "Recharge Smart Card", color: "from-emerald-500 to-teal-500" },
  { id: "tickets", icon: Ticket, label: "Buy QR Ticket", color: "from-blue-500 to-cyan-500" },
  { id: "schedule", icon: Clock, label: "First/Last Train", color: "from-orange-500 to-amber-500" },
  { id: "parking", icon: Car, label: "Parking Status", color: "from-violet-500 to-purple-500" },
];

export function QuickActions() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold tracking-tight">Quick Actions</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={action.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              disabled={true}
              className="group relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl bg-card border border-border shadow-lg overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 transition-opacity duration-500`} />
              
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg transform transition-transform duration-300`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              
              <span className="font-medium text-sm text-foreground z-10">{action.label}</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Coming Soon</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
