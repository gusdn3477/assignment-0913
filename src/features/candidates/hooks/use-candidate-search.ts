"use client";

import { useCallback, type ChangeEvent } from "react";
import { useCandidateUI } from "@/features/candidates/stores/ui-store";

export function useCandidateSearch() {
  const value = useCandidateUI((state) => state.search);
  const setValue = useCandidateUI((state) => state.setSearch);
  const onChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) =>
      setValue(event.currentTarget.value),
    [setValue],
  );
  const clear = useCallback(() => setValue(""), [setValue]);
  return { value, onChange, clear };
}
