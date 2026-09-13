import { Skeleton } from "@/components/ui/skeleton";

export function CandidateCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="h-43.5 rounded-xl border border-slate-200/80 bg-white p-4"
    >
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-28" />
        </div>
      </div>
      <Skeleton className="mt-3 h-3 w-24" />
      <div className="mt-4 flex justify-between border-t py-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  );
}
