import { MetroSVGMap } from "./MetroSVGMap";
import { MapLegend } from "./MapLegend";
import { type RoutePlanResult } from "@/services/api/transitAPI";

interface MetroMapProps {
  activeRoute?: RoutePlanResult | null;
}

export function MetroMap({ activeRoute = null }: MetroMapProps) {
  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl bg-[#0a0f1d] border border-white/5 shadow-2xl">
      <MetroSVGMap selectedRoute={activeRoute} />
      <MapLegend />
    </div>
  );
}
