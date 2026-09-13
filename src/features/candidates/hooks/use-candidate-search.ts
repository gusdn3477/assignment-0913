"use client";

import type { ChangeEvent } from "react";
import { useCandidateUI } from "@/features/candidates/stores/ui-store";

export function useCandidateSearch() {
  const value = useCandidateUI((state) => state.search);
  const setValue = useCandidateUI((state) => state.setSearch);
  const onChange = (event: ChangeEvent<HTMLInputElement>) =>
    setValue(event.currentTarget.value);
  const clear = () => setValue("");
  return { value, onChange, clear };
}
