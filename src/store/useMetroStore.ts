import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Station, MetroLine, RoutePlan } from '@/types/metro';

interface MetroState {
  stations: Station[];
  lines: MetroLine[];
  favorites: string[];
  recentRoutes: RoutePlan[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setStations: (stations: Station[]) => void;
  toggleFavorite: (stationId: string) => void;
  addRecentRoute: (route: RoutePlan) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMetroStore = create<MetroState>()(
  persist(
    (set) => ({
      stations: [],
      lines: [],
      favorites: [],
      recentRoutes: [],
      isLoading: false,
      error: null,

      setStations: (stations) => set({ stations }),
      toggleFavorite: (stationId) => 
        set((state) => ({
          favorites: state.favorites.includes(stationId)
            ? state.favorites.filter((id) => id !== stationId)
            : [...state.favorites, stationId],
        })),
      addRecentRoute: (route) =>
        set((state) => ({
          recentRoutes: [route, ...state.recentRoutes].slice(0, 5),
        })),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'metro-storage',
      partialize: (state) => ({ favorites: state.favorites, recentRoutes: state.recentRoutes }),
    }
  )
);
