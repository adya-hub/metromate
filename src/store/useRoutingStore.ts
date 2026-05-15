import { create } from 'zustand';
import { RouteResult, RouteStrategy } from '@/types/routing';

interface RoutingState {
  results: Record<RouteStrategy, RouteResult | null>;
  activeStrategy: RouteStrategy;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setResults: (results: Record<RouteStrategy, RouteResult | null>) => void;
  setActiveStrategy: (strategy: RouteStrategy) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearResults: () => void;
}

export const useRoutingStore = create<RoutingState>((set) => ({
  results: {
    fastest: null,
    "min-interchanges": null,
    "shortest-distance": null,
  },
  activeStrategy: "fastest",
  isLoading: false,
  error: null,

  setResults: (results) => set({ results, isLoading: false, error: null }),
  setActiveStrategy: (strategy) => set({ activeStrategy: strategy }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  clearResults: () => set({ 
    results: { fastest: null, "min-interchanges": null, "shortest-distance": null },
    error: null 
  }),
}));
