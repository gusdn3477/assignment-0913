import { STAGES } from "@/features/candidates/constants/candidate";
import { Skeleton } from "@/components/ui/skeleton";
import { CandidateCardSkeleton } from "@/features/candidates/components/candidate-card/candidate-card-skeleton";
export function BoardSkeleton() {
  return (
    <div role="status" aria-label="지원자를 불러오는 중" className="space-y-5">
      <span className="sr-only">지원자를 불러오는 중입니다.</span>
      <div
        aria-hidden="true"
        className="flex flex-wrap items-center gap-3 rounded-2xl border bg-white p-4"
      >
        <Skeleton className="h-10 min-w-48 flex-1 sm:max-w-sm" />
        <Skeleton className="h-10 w-44" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="overflow-x-auto rounded-xl pb-4">
        <div className="grid min-w-[1240px] grid-cols-5 gap-4">
          {STAGES.map((stage) => (
            <div key={stage} className="space-y-3 rounded-xl border p-3">
              <Skeleton className="mb-5 h-6 w-24" />
              {Array.from({ length: 3 }, (_, j) => (
                <CandidateCardSkeleton key={j} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
