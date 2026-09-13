"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { candidateApi } from "./mock-api";
import type { Candidate, MoveCandidateInput, Stage } from "./types";

export const CANDIDATES_QUERY_KEY = ["candidates"] as const;

export interface CandidateUndo {
  previousStage: Stage;
  savedStage: Stage;
}
type StageMutation = MoveCandidateInput & { undo?: boolean };

// Client-scoped, in-memory state survives card virtualization and hook remounts.
// Only successful writes create history; nothing here is persisted.
function createMoveStore() {
  let snapshot: {
    pendingIds: ReadonlySet<string>;
    undoHistory: ReadonlyMap<string, CandidateUndo>;
  } = { pendingIds: new Set(), undoHistory: new Map() };
  const listeners = new Set<() => void>();
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    set(id: string, pending: boolean) {
      const next = new Set(snapshot.pendingIds);
      if (pending) next.add(id);
      else next.delete(id);
      snapshot = { ...snapshot, pendingIds: next };
      listeners.forEach((listener) => listener());
    },
    record(id: string, entry?: CandidateUndo) {
      const undoHistory = new Map(snapshot.undoHistory);
      if (entry) undoHistory.set(id, entry);
      else undoHistory.delete(id);
      snapshot = { ...snapshot, undoHistory };
      listeners.forEach((listener) => listener());
    },
  };
}
const moveStores = new WeakMap<
  QueryClient,
  ReturnType<typeof createMoveStore>
>();
function getMoveStore(client: QueryClient) {
  let store = moveStores.get(client);
  if (!store) {
    store = createMoveStore();
    moveStores.set(client, store);
  }
  return store;
}
function patchCandidate(client: QueryClient, candidate: Candidate) {
  client.setQueryData<Candidate[]>(CANDIDATES_QUERY_KEY, (current) =>
    current?.map((item) => (item.id === candidate.id ? candidate : item)),
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
  undo: (id: string) => boolean;
  undoHistory: ReadonlyMap<string, CandidateUndo>;
} {
  const client = useQueryClient();
  const store = getMoveStore(client);
  const { pendingIds, undoHistory } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot,
  );
  const { mutate } = useMutation({
    mutationFn: ({ id, stage }: StageMutation) =>
      candidateApi.updateCandidateStage({ id, stage }),
    onMutate: async ({ id, stage }) => {
      await client.cancelQueries({
        queryKey: CANDIDATES_QUERY_KEY,
        exact: true,
      });
      const previous = client
        .getQueryData<Candidate[]>(CANDIDATES_QUERY_KEY)
        ?.find((item) => item.id === id);
      if (previous) patchCandidate(client, { ...previous, stage });
      return previous;
    },
    // Hook-level lifecycle callbacks also run after the initiating component unmounts.
    onSuccess: (candidate, input, previous) => {
      patchCandidate(client, candidate);
      if (input.undo) store.record(candidate.id);
      else if (previous && previous.stage !== candidate.stage)
        store.record(candidate.id, {
          previousStage: previous.stage,
          savedStage: candidate.stage,
        });
    },
    onError: (_error, input, previous) => {
      if (previous) patchCandidate(client, previous);
      toast.error(
        input.undo
          ? "되돌리기를 저장하지 못했습니다. 다시 시도해 주세요."
          : "단계 이동을 저장하지 못했습니다. 다시 시도해 주세요.",
      );
    },
    onSettled: (_candidate, _error, { id }) => {
      store.set(id, false);
    },
  });
  const move = useCallback(
    (id: string, stage: Stage) => {
      if (store.getSnapshot().pendingIds.has(id)) return;
      const candidate = client
        .getQueryData<Candidate[]>(CANDIDATES_QUERY_KEY)
        ?.find((item) => item.id === id);
      if (!candidate || candidate.stage === stage) return;
      store.set(id, true);
      mutate({ id, stage });
    },
    [client, mutate, store],
  );
  const undo = useCallback(
    (id: string) => {
      const snapshot = store.getSnapshot();
      if (snapshot.pendingIds.has(id)) return false;
      const entry = snapshot.undoHistory.get(id);
      if (!entry) return false;
      const candidate = client
        .getQueryData<Candidate[]>(CANDIDATES_QUERY_KEY)
        ?.find((item) => item.id === id);
      if (!candidate || candidate.stage !== entry.savedStage) {
        store.record(id);
        return false;
      }
      store.set(id, true);
      mutate({ id, stage: entry.previousStage, undo: true });
      return true;
    },
    [client, mutate, store],
  );
  return { move, pendingIds, undo, undoHistory };
}
