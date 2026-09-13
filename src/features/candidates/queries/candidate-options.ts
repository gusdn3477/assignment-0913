import { queryOptions } from "@tanstack/react-query";
import { candidateApi } from "@/api/candidate/mock-api";
import { CANDIDATES_QUERY_KEY } from "@/constants/candidate";

export function candidatesQueryOptions() {
  return queryOptions({
    queryKey: CANDIDATES_QUERY_KEY,
    queryFn: ({ signal }) => candidateApi.listCandidates({ signal }),
  });
}
