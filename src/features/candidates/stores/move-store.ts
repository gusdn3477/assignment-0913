import type { QueryClient } from "@tanstack/react-query";
import type { CandidateUndo } from "@/features/candidates/types/candidate";
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
export function getMoveStore(client: QueryClient) {
  let store = moveStores.get(client);
  if (!store) {
    store = createMoveStore();
    moveStores.set(client, store);
  }
  return store;
}
