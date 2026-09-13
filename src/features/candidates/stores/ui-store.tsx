"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { JOBS } from "@/features/candidates/constants/candidate";

import {
  UI_STORAGE_KEY,
  MAX_SEARCH_LENGTH,
} from "@/features/candidates/constants/storage";
export interface CandidateUIState {
  search: string;
  job: string;
  selectedId: string | null;
  hydrated: boolean;
  setSearch: (search: string) => void;
  setJob: (job: string) => void;
  selectCandidate: (id: string | null) => void;
  resetFilters: () => void;
}

// Privacy modes and full storage must not prevent in-memory interaction.
const safeStorage: StateStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Keep UI usable. */
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      /* Keep UI usable. */
    }
  },
};

function validatedSettings(value: unknown): { search: string; job: string } {
  if (!value || typeof value !== "object") return { search: "", job: "all" };
  const settings = value as Record<string, unknown>;
  return {
    search:
      typeof settings.search === "string"
        ? settings.search.slice(0, MAX_SEARCH_LENGTH)
        : "",
    job:
      settings.job === "all" || JOBS.some((job) => job === settings.job)
        ? (settings.job as string)
        : "all",
  };
}

function createUIStore() {
  return createStore<CandidateUIState>()(
    persist(
      (set) => ({
        search: "",
        job: "all",
        selectedId: null,
        hydrated: false,
        setSearch: (search) => set({ search }),
        setJob: (job) => set({ job }),
        selectCandidate: (selectedId) => set({ selectedId }),
        resetFilters: () => set({ search: "", job: "all" }),
      }),
      {
        name: UI_STORAGE_KEY,
        storage: createJSONStorage(() => safeStorage),
        skipHydration: true,
        partialize: ({ search, job }) => ({ search, job }),
        merge: (saved, current) => ({
          ...current,
          ...validatedSettings(saved),
        }),
      },
    ),
  );
}

const UIContext = createContext<ReturnType<typeof createUIStore> | null>(null);

export function CandidateUIProvider({ children }: { children: ReactNode }) {
  const [store] = useState(createUIStore);
  useEffect(() => {
    void Promise.resolve(store.persist.rehydrate()).finally(() => {
      store.setState({ hydrated: true });
    });
  }, [store]);
  return <UIContext.Provider value={store}>{children}</UIContext.Provider>;
}

export function useCandidateUI<T>(selector: (state: CandidateUIState) => T): T {
  const store = useContext(UIContext);
  if (!store) throw new Error("useCandidateUI requires CandidateUIProvider");
  return useStore(store, selector);
}
