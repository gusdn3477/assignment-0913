import type { Candidate } from "./types";

export function filterCandidates(
  candidates: Candidate[],
  search: string,
  job: string,
): Candidate[] {
  const query = search.trim().toLocaleLowerCase();
  return candidates.filter(
    (candidate) =>
      candidate.name.toLocaleLowerCase().includes(query) &&
      (job === "all" || candidate.job === job),
  );
}
