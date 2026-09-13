import type { STAGES } from "@/constants/candidate";
export type Stage = (typeof STAGES)[number];
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

export interface CandidateUndo {
  previousStage: Stage;
  savedStage: Stage;
}
