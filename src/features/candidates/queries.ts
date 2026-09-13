"use client";

import { useCallback, useSyncExternalStore } from "react";
import { QueryClient, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { candidateApi } from "./mock-api";
import type { Candidate, MoveCandidateInput, Stage } from "./types";

export const CANDIDATES_QUERY_KEY = ["candidates"] as const;

// A client-scoped store keeps locks synchronous across hook instances and remounts.
function createPendingStore() {
  let snapshot: ReadonlySet<string> = new Set<string>();
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    set(id: string, pending: boolean) {
      const next = new Set(snapshot);
      if (pending) next.add(id);
      else next.delete(id);
      snapshot = next;
      listeners.forEach((listener) => listener());
    },
  };
}
const pendingStores = new WeakMap<QueryClient, ReturnType<typeof createPendingStore>>();
function getPendingStore(client: QueryClient) {
  let store = pendingStores.get(client);
  if (!store) {
    store = createPendingStore();
    pendingStores.set(client, store);
  }
  return store;
}
function patchCandidate(client: QueryClient, candidate: Candidate) {
  client.setQueryData<Candidate[]>(CANDIDATES_QUERY_KEY, (current) =>
    current?.map((item) => item.id === candidate.id ? candidate : item),
  );
}

export function useCandidates() {
  return useQuery({
    queryKey: CANDIDATES_QUERY_KEY,
    queryFn: ({ signal }) => candidateApi.listCandidates({ signal }),
  });
}

export function useMoveCandidate(): {
  move: (id: string, stage: Stage) => void;
  pendingIds: ReadonlySet<string>;
} {
  const client = useQueryClient();
  const store = getPendingStore(client);
  const pendingIds = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const { mutate } = useMutation({
    mutationFn: (input: MoveCandidateInput) => candidateApi.updateCandidateStage(input),
    onMutate: async ({ id, stage }) => {
      await client.cancelQueries({ queryKey: CANDIDATES_QUERY_KEY, exact: true });
      const previous = client.getQueryData<Candidate[]>(CANDIDATES_QUERY_KEY)?.find((item) => item.id === id);
      if (previous) patchCandidate(client, { ...previous, stage });
      return previous;
    },
    // Hook-level lifecycle callbacks also run after the initiating component unmounts.
    onSuccess: (candidate) => { patchCandidate(client, candidate); },
    onError: (_error, _input, previous) => {
      if (previous) patchCandidate(client, previous);
      toast.error("단계 이동을 저장하지 못했습니다. 다시 시도해 주세요.");
    },
    onSettled: (_candidate, _error, { id }) => { store.set(id, false); },
  });
  const move = useCallback((id: string, stage: Stage) => {
    if (store.getSnapshot().has(id)) return;
    const candidate = client.getQueryData<Candidate[]>(CANDIDATES_QUERY_KEY)?.find((item) => item.id === id);
    if (!candidate || candidate.stage === stage) return;
    store.set(id, true);
    mutate({ id, stage });
  }, [client, mutate, store]);
  return { move, pendingIds };
}
