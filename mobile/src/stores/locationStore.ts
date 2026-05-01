import { create } from "zustand";
import type { Location } from "@/src/types";

interface LocationState {
  currentLocation: Location | null;
  selectedLocation: Location | null;
  isLocating: boolean;
  setCurrentLocation: (location: Location) => void;
  setSelectedLocation: (location: Location | null) => void;
  setLocating: (locating: boolean) => void;
  reset: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  currentLocation: null,
  selectedLocation: null,
  isLocating: false,

  setCurrentLocation: (currentLocation) => set({ currentLocation }),
  setSelectedLocation: (selectedLocation) => set({ selectedLocation }),
  setLocating: (isLocating) => set({ isLocating }),

  reset: () =>
    set({ currentLocation: null, selectedLocation: null, isLocating: false }),
}));
