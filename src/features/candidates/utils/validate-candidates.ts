import { MOCK_API_ERROR_CODES } from "@/features/candidates/constants/candidate-errors";
import { JOBS, STAGES } from "@/features/candidates/constants/candidate";
import type { Candidate } from "@/features/candidates/types/candidate";
import { MockApiError } from "@/features/candidates/api/mock-api-error";
function isCandidate(value: unknown): value is Candidate {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    ["id", "name", "email", "summary", "appliedAt"].every(
      (key) =>
        typeof candidate[key] === "string" && candidate[key].trim().length > 0,
    ) &&
    typeof candidate.job === "string" &&
    JOBS.some((job) => job === candidate.job) &&
    STAGES.some((stage) => stage === candidate.stage) &&
    /^\d{4}-\d{2}-\d{2}T/.test(candidate.appliedAt as string) &&
    Number.isFinite(Date.parse(candidate.appliedAt as string))
  );
}
export function parseCandidates(raw: string): Candidate[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!data || typeof data !== "object") throw new Error();
    const { version, candidates } = data as Record<string, unknown>;
    if (
      version !== 1 ||
      !Array.isArray(candidates) ||
      !candidates.every(isCandidate) ||
      new Set(candidates.map((candidate) => candidate.id)).size !==
        candidates.length
    )
      throw new Error();
    return candidates;
  } catch {
    throw new MockApiError(
      MOCK_API_ERROR_CODES.CORRUPT_STORAGE,
      "저장된 지원자 데이터가 손상되었습니다. 브라우저 저장 데이터를 확인해 주세요.",
    );
  }
}
