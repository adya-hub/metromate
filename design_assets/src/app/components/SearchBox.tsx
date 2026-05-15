import { Search, MapPin, Navigation2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface SearchBoxProps {
  placeholder?: string;
  onSelect?: (station: string) => void;
  icon?: "search" | "origin" | "destination";
  value?: string;
}

const allStations = [
  "Rajiv Chowk", "Kashmere Gate", "New Delhi", "AIIMS", "Hauz Khas",
  "Dwarka Sector 21", "Noida City Centre", "Huda City Centre",
  "Central Secretariat", "Chandni Chowk", "Vishwavidyalaya", "Netaji Subhash Place",
  "Yamuna Bank", "Rajouri Garden", "Rithala", "Samaypur Badli", "Kirti Nagar",
  "Inderlok", "Moti Nagar", "Ashok Park Main"
];

export function SearchBox({ placeholder = "Search station...", onSelect, icon = "search", value = "" }: SearchBoxProps) {
  const [query, setQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    if (searchQuery.length > 0) {
      const filtered = allStations.filter(station =>
        station.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setResults(filtered.slice(0, 5));
    } else {
      setResults([]);
    }
  };

  const handleSelect = (station: string) => {
    setQuery(station);
    setResults([]);
    setIsFocused(false);
    onSelect?.(station);
  };

  const Icon = icon === "origin" ? MapPin : icon === "destination" ? Navigation2 : Search;

  return (
    <div className="relative w-full">
      <div className={`relative transition-all duration-300 ${isFocused ? "scale-[1.02]" : ""}`}>
        <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
          isFocused ? "text-primary" : "text-muted-foreground"
        }`} />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-card/60 backdrop-blur-xl border border-white/10 text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
        />
      </div>

      <AnimatePresence>
        {isFocused && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-full rounded-2xl bg-card/95 backdrop-blur-xl border border-white/10 overflow-hidden shadow-2xl z-50"
          >
            {results.map((station, index) => (
              <motion.button
                key={station}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleSelect(station)}
                className="w-full px-4 py-3 text-left hover:bg-accent/50 transition-colors flex items-center gap-3 border-b border-white/5 last:border-0"
              >
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{station}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
