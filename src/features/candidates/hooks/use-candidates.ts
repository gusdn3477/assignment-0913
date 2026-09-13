"use client";
import { useMemo, useRef, useTransition } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidatesQueryOptions } from "@/features/candidates/queries/candidate-options";
import type { Candidate } from "@/features/candidates/types/candidate";

const EMPTY_CANDIDATES: Candidate[] = [];

// Normalize at the view boundary, never seed the Query cache with fake success data.
// Cancellable browser-storage reads preserve mutation isolation and inline retry.
export function useCandidates(selectedId?: string | null) {
  const query = useQuery(candidatesQueryOptions());
  const [isRetryPending, startRetryTransition] = useTransition();
  const retryInFlight = useRef(false);

  function retry(blocked = false) {
    if (retryInFlight.current || query.isFetching || blocked) return false;
    retryInFlight.current = true;
    // Keep the Action with the Query observer so its completion reads fresh state.
    // Transitions provide feedback; the synchronous ref excludes duplicate calls.
    startRetryTransition(async () => {
      try {
        await query.refetch({ throwOnError: false, cancelRefetch: false });
      } finally {
        retryInFlight.current = false;
      }
    });
    return true;
  }

  const data = query.data ?? EMPTY_CANDIDATES;
  const hasData = query.data !== undefined;
  const summary = useMemo(
    () => ({
      jobs: [...new Set(data.map((candidate) => candidate.job))].sort(),
      total: data.length,
      active: data.filter(
        (candidate) =>
          candidate.stage !== "hired" && candidate.stage !== "rejected",
      ).length,
      hired: data.filter((candidate) => candidate.stage === "hired").length,
    }),
    [data],
  );

  return {
    data,
    retry,
    isRetryPending,
    isRefreshing: isRetryPending || query.isFetching,
    hasData,
    summary,
    selectedCandidate:
      data.find((candidate) => candidate.id === selectedId) ?? null,
    isSuccess: query.isSuccess,
    isPending: query.isPending,
    isError: query.isError,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
