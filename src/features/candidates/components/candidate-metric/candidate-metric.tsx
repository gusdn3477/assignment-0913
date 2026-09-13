import { LoadingGuard } from "@/components/loading-guard/loading-guard";
import { Skeleton } from "@/components/ui/skeleton";
export function CandidateMetric({
  label,
  value,
  loading = false,
  icon,
  detail,
}: {
  label: string;
  value: number;
  loading?: boolean;
  icon: React.ReactNode;
  detail: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4  sm:px-5">
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{label}</span>
        <span className="hidden text-primary/70 sm:block" aria-hidden>
          {icon}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <LoadingGuard
          loading={loading}
          fallback={<Skeleton className="h-8 w-12" />}
        >
          <span className="text-2xl font-semibold tabular-nums tracking-tight">
            {value}
            <span className="ml-1 text-xs font-normal text-muted-foreground">
              명
            </span>
          </span>
        </LoadingGuard>
        <span className="hidden text-[11px] text-muted-foreground sm:inline">
          {detail}
        </span>
      </div>
    </div>
  );
}
