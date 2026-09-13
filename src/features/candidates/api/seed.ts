import { JOBS, STAGES } from "@/features/candidates/constants/candidate";
import { type Candidate } from "@/features/candidates/types/candidate";

const FAMILY_NAMES = [
  "김",
  "이",
  "박",
  "최",
  "정",
  "강",
  "조",
  "윤",
  "장",
  "임",
];
const GIVEN_NAMES = [
  "서준",
  "하윤",
  "도윤",
  "지우",
  "서연",
  "민준",
  "수아",
  "지호",
  "예린",
  "현우",
  "유진",
  "시우",
  "채원",
  "준서",
  "다은",
  "하준",
  "소율",
  "은우",
  "나윤",
  "건우",
  "지민",
  "수현",
  "예준",
  "지안",
  "태윤",
];

/** Returns fresh deterministic data so callers cannot mutate the next request's seed. */
export function createSeedCandidates(): Candidate[] {
  return Array.from({ length: 250 }, (_, index) => ({
    id: `candidate-${String(index + 1).padStart(3, "0")}`,
    name: `${FAMILY_NAMES[Math.floor(index / GIVEN_NAMES.length)]}${GIVEN_NAMES[index % GIVEN_NAMES.length]}`,
    job: JOBS[index % JOBS.length],
    appliedAt: new Date(Date.UTC(2026, 7, 1 + (index % 40))).toISOString(),
    stage: STAGES[Math.floor(index / JOBS.length) % STAGES.length],
    email: `candidate${index + 1}@example.com`,
    summary: `${JOBS[index % JOBS.length]} 직무에서 ${(index % 8) + 1}년의 경험을 쌓았습니다. 팀과 협력하여 사용자 문제를 해결하고 제품을 개선하는 일에 관심이 있습니다.`,
  }));
}
