"use client";
import { useQuery } from "@tanstack/react-query";
import { candidatesQueryOptions } from "@/features/candidates/queries/candidate-options";

// Cancellable browser-storage reads preserve mutation isolation and inline retry.
export function useCandidates() {
  return useQuery(candidatesQueryOptions());
}
