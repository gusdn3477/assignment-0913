"use client";

import { useEffect } from "react";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { JOBS, UI_STORAGE_KEY, MAX_SEARCH_LENGTH } from "@/constants/candidate";

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
    } catch {}
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
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

export const useCandidateUI = create<CandidateUIState>()(
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

export function useHydrateCandidateUI() {
  useEffect(() => {
    if (useCandidateUI.getState().hydrated) return;
    Promise.resolve(useCandidateUI.persist.rehydrate()).finally(() => {
      useCandidateUI.setState({ hydrated: true });
    });
  }, []);
}
