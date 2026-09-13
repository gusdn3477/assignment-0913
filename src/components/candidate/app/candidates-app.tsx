"use client";

import { useDeferredValue } from "react";
import { ArrowUpRight, CircleHelp, Layers3, Users } from "lucide-react";
import { CandidateErrorBoundary } from "@/components/candidate/error-boundary/candidate-error-boundary";
import { CandidateEmptyGuard } from "@/components/candidate/empty-guard/candidate-empty-guard";
import { CandidateMetric } from "@/components/candidate/metric/candidate-metric";
import { BoardSkeleton } from "@/components/candidate/board/board-skeleton";
import { CandidateBoard } from "@/components/candidate/board/candidate-board";
import { CandidateDetail } from "@/components/candidate/detail/candidate-detail";
import { CandidateToolbar } from "@/components/candidate/toolbar/candidate-toolbar";
import { CandidateQueryGuard } from "@/components/candidate/load-feedback/candidate-query-guard";
import { useCandidates } from "@/features/candidates/hooks/use-candidates";
import { useMoveCandidate } from "@/features/candidates/hooks/use-move-candidate";
import { filterCandidates } from "@/features/candidates/utils/selectors";
import {
  useHydrateCandidateUI,
  useCandidateUI,
} from "@/features/candidates/stores/ui-store";

function BoardContent() {
  const { move, loadingIds, undo, undoHistory } = useMoveCandidate();
  const search = useCandidateUI((state) => state.search);
  const job = useCandidateUI((state) => state.job);
  const selectedId = useCandidateUI((state) => state.selectedId);
  const query = useCandidates(selectedId);
  const selectCandidate = useCandidateUI((state) => state.selectCandidate);
  const candidates = query.data;
  const deferredSearch = useDeferredValue(search);
  const isStale = search !== deferredSearch;
  const filtered = filterCandidates(candidates, deferredSearch, job);

  return (
    <>
      <div className="mb-8 grid grid-cols-3 gap-3 sm:gap-4">
        <CandidateMetric
          label="전체 지원자"
          value={query.summary.total}
          loading={!query.hasData}
          icon={<Users className="size-4" />}
          detail="함께할 가능성"
        />
        <CandidateMetric
          label="진행 중"
          value={query.summary.active}
          loading={!query.hasData}
          icon={<Layers3 className="size-4" />}
          detail="다음 단계를 향해"
        />
        <CandidateMetric
          label="최종합격"
          value={query.summary.hired}
          loading={!query.hasData}
          icon={<ArrowUpRight className="size-4" />}
          detail="새로운 시작"
        />
      </div>

      <section
        id="pipeline"
        aria-labelledby="pipeline-title"
        className="min-w-0 scroll-mt-6"
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers3 className="size-4" aria-hidden />
            </span>
            <h2 id="pipeline-title" className="font-semibold">
              채용 파이프라인
            </h2>
            <span className="rounded-md bg-white px-2 py-0.5 text-xs text-muted-foreground">
              5단계
            </span>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CircleHelp className="size-3.5" aria-hidden />
            손잡이를 드래그해 단계를 이동하거나 카드 메뉴에서 이동·되돌리기를 할
            수 있어요
          </span>
        </div>
        <CandidateQueryGuard
          query={query}
          blocked={loadingIds.size > 0}
          fallback={<BoardSkeleton />}
        >
          <CandidateToolbar
            jobs={query.summary.jobs}
            total={query.summary.total}
            filtered={filtered.length}
            stale={isStale}
          />
          <div
            aria-busy={isStale}
            className={isStale ? "opacity-60" : undefined}
          >
            <CandidateEmptyGuard
              total={candidates.length}
              filtered={filtered.length}
            >
              <CandidateErrorBoundary label="지원자 보드">
                <CandidateBoard
                  resetKey={JSON.stringify({ search: deferredSearch, job })}
                  candidates={filtered}
                  loadingIds={loadingIds}
                  onMove={move}
                  onUndo={undo}
                  undoHistory={undoHistory}
                  onOpenDetail={selectCandidate}
                />
              </CandidateErrorBoundary>
            </CandidateEmptyGuard>
          </div>
        </CandidateQueryGuard>
      </section>
      <CandidateErrorBoundary
        key={selectedId}
        label="지원자 상세"
        onRecover={() => selectCandidate(null)}
      >
        <CandidateDetail candidate={query.selectedCandidate} />
      </CandidateErrorBoundary>
    </>
  );
}

export function CandidatesApp() {
  useHydrateCandidateUI();
  return (
    <CandidateErrorBoundary label="채용 파이프라인">
      <BoardContent />
    </CandidateErrorBoundary>
  );
}
