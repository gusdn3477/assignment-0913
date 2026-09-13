import { queryOptions } from "@tanstack/react-query";
import { candidateApi } from "@/features/candidates/api/mock-api";
import { CANDIDATES_QUERY_KEY } from "./candidate-keys";

export function candidatesQueryOptions() {
  return queryOptions({
    queryKey: CANDIDATES_QUERY_KEY,
    queryFn: ({ signal }) => candidateApi.listCandidates({ signal }),
  });
}
