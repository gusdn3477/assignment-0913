"use client";
import { useCallback, useSyncExternalStore } from "react";
import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { candidateApi } from "@/api/candidate/mock-api";
import type {
  Candidate,
  CandidateUndo,
  MoveCandidateInput,
  Stage,
} from "@/features/candidates/types/candidate";
import { getMoveStore } from "@/features/candidates/stores/move-store";
import { CANDIDATES_QUERY_KEY } from "@/features/candidates/queries/candidate-keys";
type StageMutation = MoveCandidateInput & { undo?: boolean };
function patchCandidate(client: QueryClient, candidate: Candidate) {
  client.setQueryData<Candidate[]>(CANDIDATES_QUERY_KEY, (current) =>
    current?.map((item) => (item.id === candidate.id ? candidate : item)),
  );
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
