"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { LoadingGuard } from "@/components/loading-guard/loading-guard";
import type { useCandidates } from "@/features/candidates/hooks/use-candidates";
import { useCandidateUI } from "@/features/candidates/stores/ui-store";
import {
  CandidateLoadError,
  CandidateRefresh,
} from "./candidate-load-feedback";

type QueryState = Pick<
  ReturnType<typeof useCandidates>,
  | "hasData"
  | "isPending"
  | "isError"
  | "isFetched"
  | "isFetching"
  | "error"
  | "retry"
>;

// API recovery belongs here; render exceptions remain in CandidateErrorBoundary.
// Cached data, including a successful empty list, survives a background refresh.
export function CandidateQueryGuard({
  query,
  blocked = false,
  fallback,
  children,
}: {
  query: QueryState;
  blocked?: boolean;
  fallback: ReactNode;
  children: ReactNode;
}) {
  const hydrated = useCandidateUI((state) => state.hydrated);
  const restoreSearchFocus = useRef(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.hasData && restoreSearchFocus.current) {
      restoreSearchFocus.current = false;
      if (document.activeElement === document.body) {
        contentRef.current
          ?.querySelector<HTMLInputElement>('input[type="search"]')
          ?.focus();
      }
    }
  }, [query.hasData]);

  function retry() {
    if (query.retry(blocked)) restoreSearchFocus.current = !query.hasData;
  }

  const pending = query.isFetching;
  // isFetched survives a retry, keeping the initial error panel mounted.
  const initialError = !query.hasData && query.isFetched;
  if (initialError) {
    // Keep this same button mounted throughout retry, preserving keyboard focus.
    return (
      <CandidateLoadError
        pending={pending}
        error={query.error}
        onRetry={retry}
      />
    );
  }

  return (
    <LoadingGuard loading={query.isPending || !hydrated} fallback={fallback}>
      <div ref={contentRef}>
        <CandidateRefresh
          failed={query.isError}
          error={query.error}
          pending={pending}
          blocked={blocked}
          onRetry={retry}
        />
        {children}
      </div>
    </LoadingGuard>
  );
}
