import { afterEach, describe, expect, it, vi } from "vitest";
import { createMockApi, STORAGE_KEY } from "./mock-api";
import { createSeedCandidates } from "./seed";
import { JOBS, STAGES } from "./types";

function setup(raw: string | null = null) {
  let value = raw;
  const port = {
    getItem: vi.fn(() => value),
    setItem: vi.fn((_key: string, next: string) => {
      value = next;
    }),
  };
  const api = createMockApi({
    storage: () => port,
    random: () => 0.5,
    sleep: async () => {},
  });
  return { port, api, value: () => value };
}
afterEach(() => vi.useRealTimers());

describe("candidate seed", () => {
  it("generates 250 deterministic, unique Korean candidates across all jobs and stages", () => {
    const seed = createSeedCandidates();
    expect(seed).toHaveLength(250);
    expect(new Set(seed.map((candidate) => candidate.id)).size).toBe(250);
    expect(new Set(seed.map((candidate) => candidate.name)).size).toBe(250);
    expect(seed.every((candidate) => /^[가-힣]+$/.test(candidate.name))).toBe(
      true,
    );
    for (const job of JOBS)
      for (const stage of STAGES) {
        expect(
          seed.filter(
            (candidate) => candidate.job === job && candidate.stage === stage,
          ),
        ).toHaveLength(10);
      }
    expect(createSeedCandidates()).toEqual(seed);
    seed[0].name = "변경";
    expect(createSeedCandidates()[0].name).not.toBe("변경");
  });
});

describe("mock API", () => {
  it("reads seed without persisting and persists successful moves for a new API instance", async () => {
    const { api, port } = setup();
    expect(await api.listCandidates()).toEqual(createSeedCandidates());
    expect(port.setItem).not.toHaveBeenCalled();
    expect(
      await api.updateCandidateStage({ id: "candidate-001", stage: "hired" }),
    ).toMatchObject({ stage: "hired" });
    expect(port.setItem).toHaveBeenCalledWith(STORAGE_KEY, expect.any(String));
    const reloaded = createMockApi({
      storage: () => port,
      random: () => 0.5,
      sleep: async () => {},
    });
    expect((await reloaded.listCandidates())[0].stage).toBe("hired");
  });

  it("accepts an empty stored dataset without replacing it with seed", async () => {
    const { api, port } = setup(JSON.stringify({ version: 1, candidates: [] }));
    await expect(api.listCandidates()).resolves.toEqual([]);
    expect(port.setItem).not.toHaveBeenCalled();
  });

  it("fails below the 15% threshold without writing", async () => {
    const { port } = setup();
    const api = createMockApi({
      storage: () => port,
      random: () => 0.149,
      sleep: async () => {},
    });
    await expect(
      api.updateCandidateStage({ id: "candidate-001", stage: "hired" }),
    ).rejects.toMatchObject({ code: "network" });
    await expect(api.listCandidates()).rejects.toMatchObject({
      code: "network",
    });
    expect(port.setItem).not.toHaveBeenCalled();
    const boundary = createMockApi({
      storage: () => port,
      random: () => 0.15,
      sleep: async () => {},
    });
    await expect(boundary.listCandidates()).resolves.toHaveLength(250);
  });

  it("preserves different card writes that complete in reverse order and excludes same-card overlap", async () => {
    const { port } = setup();
    const resolve: Array<() => void> = [];
    const api = createMockApi({
      storage: () => port,
      random: () => 0.5,
      sleep: () => new Promise<void>((done) => resolve.push(done)),
    });
    const first = api.updateCandidateStage({
      id: "candidate-001",
      stage: "hired",
    });
    const second = api.updateCandidateStage({
      id: "candidate-002",
      stage: "offer",
    });
    await expect(
      api.updateCandidateStage({ id: "candidate-001", stage: "rejected" }),
    ).rejects.toMatchObject({ code: "busy" });
    resolve[1]();
    await second;
    resolve[0]();
    await first;
    const saved = JSON.parse(port.getItem()!);
    expect(saved.candidates[0].stage).toBe("hired");
    expect(saved.candidates[1].stage).toBe("offer");
  });

  it.each([
    "{broken",
    "null",
    JSON.stringify({ version: 2, candidates: createSeedCandidates() }),
    JSON.stringify({
      version: 1,
      candidates: createSeedCandidates().map((candidate) => ({
        ...candidate,
        stage: "bad",
      })),
    }),
    JSON.stringify({
      version: 1,
      candidates: createSeedCandidates().map((candidate) => ({
        ...candidate,
        id: "duplicate",
      })),
    }),
    JSON.stringify({
      version: 1,
      candidates: createSeedCandidates().map((candidate) => ({
        ...candidate,
        appliedAt: "bad",
      })),
    }),
  ])("rejects corrupt data without overwriting it (case %#)", async (raw) => {
    const { api, port, value } = setup(raw);
    await expect(api.listCandidates()).rejects.toMatchObject({
      code: "corrupt-storage",
    });
    await expect(
      api.updateCandidateStage({ id: "candidate-001", stage: "hired" }),
    ).rejects.toMatchObject({ code: "corrupt-storage" });
    expect(value()).toBe(raw);
    expect(port.setItem).not.toHaveBeenCalled();
  });

  it("reports unavailable storage and failed writes, then permits retry", async () => {
    const unavailable = createMockApi({
      storage: () => {
        throw Error();
      },
      random: () => 0.5,
      sleep: async () => {},
    });
    await expect(unavailable.listCandidates()).rejects.toMatchObject({
      code: "storage",
    });
    const { api, port } = setup();
    port.setItem.mockImplementationOnce(() => {
      throw Error("QuotaExceededError");
    });
    await expect(
      api.updateCandidateStage({ id: "candidate-001", stage: "hired" }),
    ).rejects.toMatchObject({ code: "storage" });
    expect((await api.listCandidates())[0].stage).toBe("review");
    await expect(
      api.updateCandidateStage({ id: "candidate-001", stage: "hired" }),
    ).resolves.toMatchObject({ stage: "hired" });
  });

  it("rejects missing cards and invalid stages without saving", async () => {
    const { api, port } = setup();
    await expect(
      api.updateCandidateStage({ id: "missing", stage: "hired" }),
    ).rejects.toMatchObject({ code: "not-found" });
    await expect(
      // @ts-expect-error exercise untrusted runtime input
      api.updateCandidateStage({ id: "candidate-001", stage: "bad" }),
    ).rejects.toMatchObject({ code: "invalid-input" });
    expect(port.setItem).not.toHaveBeenCalled();
  });

  it("aborts before and during default delay and removes the timer", async () => {
    vi.useFakeTimers();
    const { port } = setup();
    const api = createMockApi({ storage: () => port, random: () => 0.5 });
    const before = new AbortController();
    before.abort();
    await expect(
      api.listCandidates({ signal: before.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    const during = new AbortController();
    const pending = api.listCandidates({ signal: during.signal });
    const assertion = expect(pending).rejects.toMatchObject({
      name: "AbortError",
    });
    during.abort();
    await assertion;
    expect(vi.getTimerCount()).toBe(0);
    expect(port.getItem).not.toHaveBeenCalled();
  });

  it("checks cancellation even when injected sleep ignores signal", async () => {
    const controller = new AbortController();
    const { port } = setup();
    const api = createMockApi({
      storage: () => port,
      random: () => 0.5,
      sleep: async () => {
        controller.abort();
      },
    });
    await expect(
      api.listCandidates({ signal: controller.signal }),
    ).rejects.toMatchObject({ name: "AbortError" });
    expect(port.getItem).not.toHaveBeenCalled();
  });

  it.each([
    [0, 200],
    [0.99999, 800],
  ])(
    "uses the configured random source for latency",
    async (randomValue, milliseconds) => {
      const { port } = setup();
      const sleep = vi.fn(async () => {});
      const random = vi
        .fn()
        .mockReturnValueOnce(randomValue)
        .mockReturnValue(0.5);
      await createMockApi({
        storage: () => port,
        random,
        sleep,
      }).listCandidates();
      expect(sleep).toHaveBeenCalledWith(milliseconds, undefined);
    },
  );
});
