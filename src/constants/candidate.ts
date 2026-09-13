import type { Stage } from "@/features/candidates/types/candidate";

export const STAGES = [
  "review",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;
export const STAGE_LABELS: Record<Stage, string> = {
  review: "서류검토",
  interview: "면접",
  offer: "처우협의",
  hired: "최종합격",
  rejected: "불합격",
};
export const JOBS = [
  "프론트엔드 개발자",
  "백엔드 개발자",
  "프로덕트 디자이너",
  "프로덕트 매니저",
  "데이터 분석가",
] as const;

export const stageStyles: Record<Stage, { dot: string; badge: string }> = {
  review: { dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  interview: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700" },
  offer: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800" },
  hired: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  rejected: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" },
};

export const STORAGE_KEY = "hiring-pipeline:candidates:v1";
export const UI_STORAGE_KEY = "hiring-pipeline-ui";
export const MAX_SEARCH_LENGTH = 200;

export const MOCK_API_ERROR_CODES = {
  STORAGE: "storage",
  CORRUPT_STORAGE: "corrupt-storage",
  NETWORK: "network",
  NOT_FOUND: "not-found",
  INVALID_INPUT: "invalid-input",
  BUSY: "busy",
} as const;

export type MockApiErrorCode =
  (typeof MOCK_API_ERROR_CODES)[keyof typeof MOCK_API_ERROR_CODES];

export const DEFAULT_CANDIDATE_LOAD_ERROR_MESSAGE =
  "잠시 후 다시 불러와 주세요.";

export const CANDIDATE_LOAD_ERROR_MESSAGES: Readonly<
  Partial<Record<MockApiErrorCode, string>>
> = {
  [MOCK_API_ERROR_CODES.CORRUPT_STORAGE]:
    "저장된 지원자 정보를 읽을 수 없어요. 브라우저 저장 데이터를 확인한 뒤 다시 불러와 주세요.",
  [MOCK_API_ERROR_CODES.STORAGE]:
    "브라우저 저장소에 접근할 수 없어요. 사이트의 저장소 사용 설정을 확인한 뒤 다시 불러와 주세요.",
};

export const CANDIDATES_QUERY_KEY = ["candidates"] as const;
