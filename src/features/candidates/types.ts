export const STAGES = [
  "review",
  "interview",
  "offer",
  "hired",
  "rejected",
] as const;
export type Stage = (typeof STAGES)[number];
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
export interface Candidate {
  id: string;
  name: string;
  job: string;
  appliedAt: string;
  stage: Stage;
  email: string;
  summary: string;
}
export interface MoveCandidateInput {
  id: string;
  stage: Stage;
}
