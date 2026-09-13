import type { ReactNode } from "react";
import { ResetButton } from "@/components/buttons/reset-button";
import { useCandidateUI } from "@/features/candidates/stores/ui-store";

export function CandidateEmptyGuard({
  total,
  filtered,
  children,
}: {
  total: number;
  filtered: number;
  children: ReactNode;
}) {
  const resetFilters = useCandidateUI((state) => state.resetFilters);
  const hasCandidates = total > 0;

  return (
    <div
      data-candidate-results
      className="grid min-h-[calc(max(720px,75vh)+5rem)]"
    >
      {filtered > 0 ? (
        children
      ) : (
        <div className="flex items-center justify-center py-5">
          <div className="w-full rounded-xl border border-dashed bg-white p-6 text-center">
            <p className="font-medium">
              {hasCandidates
                ? "검색 조건에 맞는 지원자가 없어요"
                : "아직 등록된 지원자가 없어요"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {hasCandidates
                ? "다른 이름이나 직무로 검색해 보세요."
                : "지원자가 등록되면 이곳에서 채용 단계를 관리할 수 있어요."}
            </p>
            {hasCandidates && (
              <ResetButton
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={resetFilters}
              >
                검색 조건 초기화
              </ResetButton>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
