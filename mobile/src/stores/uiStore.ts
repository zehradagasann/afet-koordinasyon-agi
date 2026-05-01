import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { NeedType } from "@/src/types";

interface RequestDraft {
  personCount: number;
  needTypes: NeedType[];
  description: string;
  photoUris: string[];
  audioUri: string | null;
}

export interface PendingRequest {
  id: string;
  createdAt: number;
  latitude: number;
  longitude: number;
  needType: NeedType;
  personCount: number;
  description?: string;
  photoUris: string[];
  audioUri: string | null;
}

interface UIState {
  isInfoPanelVisible: boolean;
  requestDraft: RequestDraft;
  pendingRequests: PendingRequest[];
  isSyncingPending: boolean;
  setInfoPanelVisible: (visible: boolean) => void;
  updateDraft: (updates: Partial<RequestDraft>) => void;
  resetDraft: () => void;
  enqueuePendingRequest: (request: PendingRequest) => void;
  removePendingRequest: (id: string) => void;
  setPendingRequests: (requests: PendingRequest[]) => void;
  setSyncingPending: (value: boolean) => void;
}

const DEFAULT_DRAFT: RequestDraft = {
  personCount: 1,
  needTypes: [],
  description: "",
  photoUris: [],
  audioUri: null,
};

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isInfoPanelVisible: false,
      requestDraft: { ...DEFAULT_DRAFT },
      pendingRequests: [],
      isSyncingPending: false,

      setInfoPanelVisible: (isInfoPanelVisible) =>
        set({ isInfoPanelVisible }),

      updateDraft: (updates) =>
        set((state) => ({
          requestDraft: { ...state.requestDraft, ...updates },
        })),

      resetDraft: () => set({ requestDraft: { ...DEFAULT_DRAFT } }),

      enqueuePendingRequest: (request) =>
        set((state) => ({
          pendingRequests: [...state.pendingRequests, request],
        })),

      removePendingRequest: (id) =>
        set((state) => ({
          pendingRequests: state.pendingRequests.filter((item) => item.id !== id),
        })),

      setPendingRequests: (requests) => set({ pendingRequests: requests }),

      setSyncingPending: (value) => set({ isSyncingPending: value }),
    }),
    {
      name: "resq-ui",
      storage: createJSONStorage(() => AsyncStorage),
      // Yalnızca draft ve pending queue persist edilir (modal state değil)
      partialize: (state) => ({
        requestDraft: state.requestDraft,
        pendingRequests: state.pendingRequests,
      }),
    }
  )
);
