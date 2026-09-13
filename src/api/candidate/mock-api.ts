import { MOCK_API_ERROR_CODES } from "@/features/candidates/constants/candidate-errors";
import type {
  MockApiOptions,
  StoragePort,
} from "@/features/candidates/types/mock-api";
import { STORAGE_KEY } from "@/features/candidates/constants/storage";
import { MockApiError } from "./mock-api-error";
import { checkAbort, sleep } from "@/features/candidates/utils/abortable-delay";
import { parseCandidates } from "@/features/candidates/utils/validate-candidates";
import { createSeedCandidates } from "@/api/candidate/seed";
import { STAGES } from "@/features/candidates/constants/candidate";
import {
  type Candidate,
  type MoveCandidateInput,
} from "@/features/candidates/types/candidate";

export function createMockApi(options: MockApiOptions = {}) {
  const getStorage = options.storage ?? (() => window.localStorage);
  const random = options.random ?? Math.random;
  const wait = options.sleep ?? sleep;
  const pendingIds = new Set<string>();

  function storage(): StoragePort {
    try {
      return getStorage();
    } catch {
      throw new MockApiError(
        MOCK_API_ERROR_CODES.STORAGE,
        "브라우저 저장소에 접근할 수 없습니다.",
      );
    }
  }
  function read(port: StoragePort): Candidate[] {
    let raw: string | null;
    try {
      raw = port.getItem(STORAGE_KEY);
    } catch {
      throw new MockApiError(
        MOCK_API_ERROR_CODES.STORAGE,
        "지원자 데이터를 읽을 수 없습니다.",
      );
    }
    return raw === null ? createSeedCandidates() : parseCandidates(raw);
  }
  async function request(signal?: AbortSignal) {
    checkAbort(signal);
    await wait(200 + Math.min(600, Math.floor(random() * 601)), signal);
    checkAbort(signal);
    if (random() < 0.15)
      throw new MockApiError(
        MOCK_API_ERROR_CODES.NETWORK,
        "요청에 실패했습니다. 잠시 후 다시 시도해 주세요.",
      );
  }
  return {
    async listCandidates({ signal }: { signal?: AbortSignal } = {}): Promise<
      Candidate[]
    > {
      await request(signal);
      return read(storage());
    },
    async updateCandidateStage({
      id,
      stage,
    }: MoveCandidateInput): Promise<Candidate> {
      if (typeof id !== "string" || !STAGES.includes(stage)) {
        throw new MockApiError(
          MOCK_API_ERROR_CODES.INVALID_INPUT,
          "올바르지 않은 단계 이동 요청입니다.",
        );
      }
      if (pendingIds.has(id))
        throw new MockApiError(
          MOCK_API_ERROR_CODES.BUSY,
          "이 지원자의 단계 이동이 진행 중입니다.",
        );
      pendingIds.add(id);
      try {
        await request();
        // Read and write synchronously after the delay: another card's completed write survives.
        const port = storage();
        const candidates = read(port);
        const index = candidates.findIndex((candidate) => candidate.id === id);
        if (index < 0)
          throw new MockApiError(
            MOCK_API_ERROR_CODES.NOT_FOUND,
            "지원자를 찾을 수 없습니다.",
          );
        const updated = { ...candidates[index], stage };
        candidates[index] = updated;
        try {
          port.setItem(STORAGE_KEY, JSON.stringify({ version: 1, candidates }));
        } catch {
          throw new MockApiError(
            MOCK_API_ERROR_CODES.STORAGE,
            "단계 이동을 저장하지 못했습니다. 브라우저 저장소를 확인해 주세요.",
          );
        }
        return updated;
      } finally {
        pendingIds.delete(id);
      }
    },
  };
}

export const candidateApi = createMockApi();
