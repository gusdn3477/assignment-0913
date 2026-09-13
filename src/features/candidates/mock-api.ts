import { createSeedCandidates } from "./seed";
import { JOBS, STAGES, type Candidate, type MoveCandidateInput } from "./types";

export const STORAGE_KEY = "hiring-pipeline:candidates:v1";
type StoragePort = Pick<Storage, "getItem" | "setItem">;
export interface MockApiOptions {
  storage?: () => StoragePort;
  random?: () => number;
  sleep?: (milliseconds: number, signal?: AbortSignal) => Promise<void>;
}
export class MockApiError extends Error {
  constructor(
    public readonly code: "storage" | "corrupt-storage" | "network" | "not-found" | "invalid-input" | "busy",
    message: string,
  ) {
    super(message);
    this.name = "MockApiError";
  }
}

function checkAbort(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("요청이 취소되었습니다.", "AbortError");
}
function sleep(milliseconds: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    checkAbort(signal);
    const onAbort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onAbort);
      reject(new DOMException("요청이 취소되었습니다.", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, milliseconds);
    signal?.addEventListener("abort", onAbort, { once: true });
  });
}
function isCandidate(value: unknown): value is Candidate {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return ["id", "name", "email", "summary", "appliedAt"].every(
    (key) => typeof candidate[key] === "string" && candidate[key].trim().length > 0,
  ) && typeof candidate.job === "string" && JOBS.some((job) => job === candidate.job)
    && STAGES.some((stage) => stage === candidate.stage)
    && /^\d{4}-\d{2}-\d{2}T/.test(candidate.appliedAt as string)
    && Number.isFinite(Date.parse(candidate.appliedAt as string));
}
function parseCandidates(raw: string): Candidate[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") throw new Error();
    const { version, candidates } = data as Record<string, unknown>;
    if (version !== 1 || !Array.isArray(candidates)
      || !candidates.every(isCandidate)
      || new Set(candidates.map((candidate) => candidate.id)).size !== candidates.length) throw new Error();
    return candidates;
  } catch {
    throw new MockApiError("corrupt-storage", "저장된 지원자 데이터가 손상되었습니다. 브라우저 저장 데이터를 확인해 주세요.");
  }
}

export function createMockApi(options: MockApiOptions = {}) {
  const getStorage = options.storage ?? (() => window.localStorage);
  const random = options.random ?? Math.random;
  const wait = options.sleep ?? sleep;
  const pendingIds = new Set<string>();

  function storage(): StoragePort {
    try { return getStorage(); } catch {
      throw new MockApiError("storage", "브라우저 저장소에 접근할 수 없습니다.");
    }
  }
  function read(port: StoragePort): Candidate[] {
    let raw: string | null;
    try { raw = port.getItem(STORAGE_KEY); } catch {
      throw new MockApiError("storage", "지원자 데이터를 읽을 수 없습니다.");
    }
    return raw === null ? createSeedCandidates() : parseCandidates(raw);
  }
  async function request(signal?: AbortSignal) {
    checkAbort(signal);
    await wait(200 + Math.min(600, Math.floor(random() * 601)), signal);
    checkAbort(signal);
    if (random() < 0.15) throw new MockApiError("network", "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }
  return {
    async listCandidates({ signal }: { signal?: AbortSignal } = {}): Promise<Candidate[]> {
      await request(signal);
      return read(storage());
    },
    async updateCandidateStage({ id, stage }: MoveCandidateInput): Promise<Candidate> {
      if (typeof id !== "string" || !STAGES.includes(stage)) {
        throw new MockApiError("invalid-input", "올바르지 않은 단계 이동 요청입니다.");
      }
      if (pendingIds.has(id)) throw new MockApiError("busy", "이 지원자의 단계 이동이 진행 중입니다.");
      pendingIds.add(id);
      try {
        await request();
        // Read and write synchronously after the delay: another card's completed write survives.
        const port = storage();
        const candidates = read(port);
        const index = candidates.findIndex((candidate) => candidate.id === id);
        if (index < 0) throw new MockApiError("not-found", "지원자를 찾을 수 없습니다.");
        const updated = { ...candidates[index], stage };
        candidates[index] = updated;
        try { port.setItem(STORAGE_KEY, JSON.stringify({ version: 1, candidates })); } catch {
          throw new MockApiError("storage", "단계 이동을 저장하지 못했습니다. 브라우저 저장소를 확인해 주세요.");
        }
        return updated;
      } finally {
        pendingIds.delete(id);
      }
    },
  };
}

export const candidateApi = createMockApi();
