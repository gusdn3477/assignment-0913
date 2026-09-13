"use client";
import { useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { candidatesQueryOptions } from "@/features/candidates/queries/candidate-options";
import type { Candidate } from "@/features/candidates/types/candidate";

const EMPTY_CANDIDATES: Candidate[] = [];

// Normalize at the view boundary, never seed the Query cache with fake success data.
// Cancellable browser-storage reads preserve mutation isolation and inline retry.
export function useCandidates(selectedId?: string | null) {
  const query = useQuery(candidatesQueryOptions());
  const retryInFlight = useRef(false);

  function retry(blocked = false) {
    if (retryInFlight.current || query.isFetching || blocked) return false;
    retryInFlight.current = true;
    // The ref closes the gap before Query publishes its fetching state.
    void query
      .refetch({ throwOnError: false, cancelRefetch: false })
      .finally(() => {
        retryInFlight.current = false;
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
    isFetched: query.isFetched,
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
