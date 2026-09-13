import { WorkspaceHeader } from "@/features/candidates/components/workspace-header/workspace-header";
import { BoardSkeleton } from "@/features/candidates/components/candidate-board/board-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

// Route streaming fallback; browser Query loading is handled inside CandidatesApp.
export default function Loading() {
  return (
    <>
      <WorkspaceHeader />
      <main className="mx-auto max-w-420 px-5 py-8 sm:px-8 lg:px-10">
        <Skeleton className="mb-3 h-8 w-80 max-w-full" />
        <Skeleton className="mb-8 h-6 w-96 max-w-full" />
        <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4" aria-hidden>
          {Array.from({ length: 3 }, (_, index) => (
            <Skeleton key={index} className="h-28 rounded-xl" />
          ))}
        </div>
        <BoardSkeleton />
      </main>
    </>
  );
}
