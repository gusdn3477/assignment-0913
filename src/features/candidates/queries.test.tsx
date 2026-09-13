import type { PropsWithChildren } from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { candidateApi } from "./mock-api";
import {
  CANDIDATES_QUERY_KEY,
  useCandidates,
  useMoveCandidate,
} from "./queries";
import { createSeedCandidates } from "./seed";
import type { Candidate } from "./types";

vi.mock("./mock-api", () => ({
  candidateApi: { listCandidates: vi.fn(), updateCandidateStage: vi.fn() },
}));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}
function setup(seed = true) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: Infinity, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  const candidates = createSeedCandidates().slice(0, 3);
  if (seed) client.setQueryData(CANDIDATES_QUERY_KEY, candidates);
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return {
    client,
    candidates,
    wrapper,
    data: () => client.getQueryData<Candidate[]>(CANDIDATES_QUERY_KEY)!,
  };
}
beforeEach(() => {
  vi.resetAllMocks();
});

describe("candidate query", () => {
  it("passes the query AbortSignal and aborts an in-flight list when moving", async () => {
    const context = setup();
    const list = deferred<Candidate[]>();
    vi.mocked(candidateApi.listCandidates).mockReturnValue(list.promise);
    const update = deferred<Candidate>();
    vi.mocked(candidateApi.updateCandidateStage).mockReturnValue(
      update.promise,
    );
    const hook = renderHook(
      () => ({ query: useCandidates(), mutation: useMoveCandidate() }),
      { wrapper: context.wrapper },
    );
    act(() => {
      void hook.result.current.query.refetch();
    });
    const signal = vi.mocked(candidateApi.listCandidates).mock.calls[0][0]
      ?.signal;
    expect(signal).toBeInstanceOf(AbortSignal);
    act(() => {
      hook.result.current.mutation.move(context.candidates[0].id, "hired");
    });
    await waitFor(() => expect(context.data()[0].stage).toBe("hired"));
    expect(signal?.aborted).toBe(true);
    await act(async () => {
      list.resolve(context.candidates);
    });
    expect(context.data()[0].stage).toBe("hired");
    await act(async () => {
      update.resolve({ ...context.candidates[0], stage: "hired" });
    });
  });

  it("returns the standard successful query result", async () => {
    const context = setup(false);
    vi.mocked(candidateApi.listCandidates).mockResolvedValue(
      context.candidates,
    );
    const hook = renderHook(useCandidates, { wrapper: context.wrapper });
    await waitFor(() => expect(hook.result.current.isSuccess).toBe(true));
    expect(hook.result.current.data).toEqual(context.candidates);
  });
});

describe("card-scoped optimistic mutations", () => {
  it("applies before completion, uses the server response, and publishes immutable pending snapshots", async () => {
    const context = setup();
    const request = deferred<Candidate>();
    vi.mocked(candidateApi.updateCandidateStage).mockReturnValue(
      request.promise,
    );
    const hook = renderHook(useMoveCandidate, { wrapper: context.wrapper });
    const initialPending = hook.result.current.pendingIds;
    act(() => {
      hook.result.current.move(context.candidates[0].id, "hired");
    });
    const activePending = hook.result.current.pendingIds;
    expect(activePending.has(context.candidates[0].id)).toBe(true);
    expect(initialPending.size).toBe(0);
    await waitFor(() => expect(context.data()[0].stage).toBe("hired"));
    expect(context.data()[1]).toBe(context.candidates[1]);
    const saved = {
      ...context.candidates[0],
      stage: "hired" as const,
      summary: "서버 응답",
    };
    await act(async () => {
      request.resolve(saved);
    });
    await waitFor(() => expect(hook.result.current.pendingIds.size).toBe(0));
    expect(activePending.has(context.candidates[0].id)).toBe(true);
    expect(context.data()[0]).toEqual(saved);
  });

  it("rolls back only the failed card and permits retry", async () => {
    const context = setup();
    const request = deferred<Candidate>();
    vi.mocked(candidateApi.updateCandidateStage)
      .mockReturnValueOnce(request.promise)
      .mockResolvedValue({ ...context.candidates[0], stage: "offer" });
    const hook = renderHook(useMoveCandidate, { wrapper: context.wrapper });
    act(() => {
      hook.result.current.move(context.candidates[0].id, "hired");
    });
    await waitFor(() => expect(context.data()[0].stage).toBe("hired"));
    await act(async () => {
      request.reject(Error("failed"));
    });
    await waitFor(() => expect(hook.result.current.pendingIds.size).toBe(0));
    expect(context.data()).toEqual(context.candidates);
    expect(toast.error).toHaveBeenCalledWith(
      "단계 이동을 저장하지 못했습니다. 다시 시도해 주세요.",
    );
    act(() => {
      hook.result.current.move(context.candidates[0].id, "offer");
    });
    await waitFor(() =>
      expect(candidateApi.updateCandidateStage).toHaveBeenCalledTimes(2),
    );
    await waitFor(() => expect(hook.result.current.pendingIds.size).toBe(0));
    expect(context.data()[0].stage).toBe("offer");
  });

  it.each(["success-first", "failure-first"])(
    "preserves B's success when A fails (%s)",
    async (order) => {
      const context = setup();
      const a = deferred<Candidate>();
      const b = deferred<Candidate>();
      vi.mocked(candidateApi.updateCandidateStage).mockImplementation(
        ({ id }) => (id === context.candidates[0].id ? a.promise : b.promise),
      );
      const hook = renderHook(useMoveCandidate, { wrapper: context.wrapper });
      act(() => {
        hook.result.current.move(context.candidates[0].id, "hired");
        hook.result.current.move(context.candidates[1].id, "offer");
      });
      await waitFor(() =>
        expect(candidateApi.updateCandidateStage).toHaveBeenCalledTimes(2),
      );
      expect(
        context
          .data()
          .slice(0, 2)
          .map((item) => item.stage),
      ).toEqual(["hired", "offer"]);
      if (order === "success-first") {
        await act(async () => {
          b.resolve({ ...context.candidates[1], stage: "offer" });
        });
        await act(async () => {
          a.reject(Error("failed A"));
        });
      } else {
        await act(async () => {
          a.reject(Error("failed A"));
        });
        expect(context.data()[1].stage).toBe("offer");
        expect(
          hook.result.current.pendingIds.has(context.candidates[1].id),
        ).toBe(true);
        await act(async () => {
          b.resolve({ ...context.candidates[1], stage: "offer" });
        });
      }
      await waitFor(() => expect(hook.result.current.pendingIds.size).toBe(0));
      expect(context.data()[0]).toEqual(context.candidates[0]);
      expect(context.data()[1].stage).toBe("offer");
    },
  );

  it("excludes same-tick duplicates across hook instances while allowing another card", async () => {
    const context = setup();
    const a = deferred<Candidate>();
    const b = deferred<Candidate>();
    vi.mocked(candidateApi.updateCandidateStage).mockImplementation(({ id }) =>
      id === context.candidates[0].id ? a.promise : b.promise,
    );
    const first = renderHook(useMoveCandidate, { wrapper: context.wrapper });
    const second = renderHook(useMoveCandidate, { wrapper: context.wrapper });
    act(() => {
      first.result.current.move(context.candidates[0].id, "hired");
      first.result.current.move(context.candidates[0].id, "rejected");
      second.result.current.move(context.candidates[0].id, "offer");
      second.result.current.move(context.candidates[1].id, "offer");
    });
    await waitFor(() =>
      expect(candidateApi.updateCandidateStage).toHaveBeenCalledTimes(2),
    );
    expect(
      vi
        .mocked(candidateApi.updateCandidateStage)
        .mock.calls.map(([input]) => input),
    ).toEqual([
      { id: context.candidates[0].id, stage: "hired" },
      { id: context.candidates[1].id, stage: "offer" },
    ]);
    expect(first.result.current.pendingIds).toEqual(
      second.result.current.pendingIds,
    );
    await act(async () => {
      a.resolve({ ...context.candidates[0], stage: "hired" });
      b.resolve({ ...context.candidates[1], stage: "offer" });
    });
  });

  it("preserves both card responses when success completes in reverse order", async () => {
    const context = setup();
    const a = deferred<Candidate>();
    const b = deferred<Candidate>();
    vi.mocked(candidateApi.updateCandidateStage).mockImplementation(({ id }) =>
      id === context.candidates[0].id ? a.promise : b.promise,
    );
    const hook = renderHook(useMoveCandidate, { wrapper: context.wrapper });
    act(() => {
      hook.result.current.move(context.candidates[0].id, "hired");
      hook.result.current.move(context.candidates[1].id, "offer");
    });
    await waitFor(() =>
      expect(candidateApi.updateCandidateStage).toHaveBeenCalledTimes(2),
    );
    const savedB = {
      ...context.candidates[1],
      stage: "offer" as const,
      summary: "B saved",
    };
    await act(async () => {
      b.resolve(savedB);
    });
    expect(context.data()[0].stage).toBe("hired");
    expect(hook.result.current.pendingIds.has(context.candidates[0].id)).toBe(
      true,
    );
    const savedA = {
      ...context.candidates[0],
      stage: "hired" as const,
      summary: "A saved",
    };
    await act(async () => {
      a.resolve(savedA);
    });
    expect(context.data().slice(0, 2)).toEqual([savedA, savedB]);
  });

  it.each(["success", "failure"])(
    "retains lock and finishes %s after unmount and remount",
    async (outcome) => {
      const context = setup();
      const request = deferred<Candidate>();
      vi.mocked(candidateApi.updateCandidateStage).mockReturnValue(
        request.promise,
      );
      const first = renderHook(useMoveCandidate, { wrapper: context.wrapper });
      act(() => {
        first.result.current.move(context.candidates[0].id, "hired");
      });
      first.unmount();
      const second = renderHook(useMoveCandidate, { wrapper: context.wrapper });
      expect(
        second.result.current.pendingIds.has(context.candidates[0].id),
      ).toBe(true);
      act(() => {
        second.result.current.move(context.candidates[0].id, "offer");
      });
      await waitFor(() =>
        expect(candidateApi.updateCandidateStage).toHaveBeenCalledTimes(1),
      );
      expect(context.data()[0].stage).toBe("hired");
      await act(async () => {
        if (outcome === "success")
          request.resolve({ ...context.candidates[0], stage: "hired" });
        else request.reject(Error("failure"));
      });
      await waitFor(() =>
        expect(second.result.current.pendingIds.size).toBe(0),
      );
      expect(context.data()[0].stage).toBe(
        outcome === "success" ? "hired" : context.candidates[0].stage,
      );
    },
  );

  it("ignores a missing card, unloaded data, and a move to the current stage", () => {
    const context = setup();
    const hook = renderHook(useMoveCandidate, { wrapper: context.wrapper });
    act(() => {
      hook.result.current.move("missing", "hired");
      hook.result.current.move(
        context.candidates[0].id,
        context.candidates[0].stage,
      );
      context.client.removeQueries({ queryKey: CANDIDATES_QUERY_KEY });
      hook.result.current.move(context.candidates[0].id, "hired");
    });
    expect(hook.result.current.pendingIds.size).toBe(0);
    expect(candidateApi.updateCandidateStage).not.toHaveBeenCalled();
  });
});
