"use client";

import { memo, useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { Check, ChevronDown, LoaderCircle, UserRound } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { STAGES, STAGE_LABELS, type Candidate, type Stage } from "./types";

interface CandidateBoardProps {
  candidates: Candidate[];
  pendingIds: ReadonlySet<string>;
  onMove: (id: string, stage: Stage) => void;
  onOpenDetail: (id: string) => void;
}

const stageStyles: Record<Stage, { dot: string; badge: string }> = {
  review: { dot: "bg-violet-500", badge: "bg-violet-50 text-violet-700" },
  interview: { dot: "bg-blue-500", badge: "bg-blue-50 text-blue-700" },
  offer: { dot: "bg-amber-500", badge: "bg-amber-50 text-amber-800" },
  hired: { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700" },
  rejected: { dot: "bg-slate-400", badge: "bg-slate-100 text-slate-600" },
};

const CandidateCard = memo(function CandidateCard({ candidate, pending, onMove, onOpenDetail }: {
  candidate: Candidate;
  pending: boolean;
  onMove: CandidateBoardProps["onMove"];
  onOpenDetail: CandidateBoardProps["onOpenDetail"];
}) {
  const selectedMove = useRef(false);
  const date = candidate.appliedAt.slice(0, 10).replaceAll("-", ".");
  return (
    <li data-candidate-card={candidate.id} className="rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_5px_rgba(27,39,68,0.025)] transition-shadow hover:shadow-md">
      <button type="button" data-candidate-detail={candidate.id} onClick={() => onOpenDetail(candidate.id)} aria-label={`${candidate.name} 지원자 상세 보기`} className="block w-full rounded-t-xl p-4 text-left focus-visible:relative focus-visible:z-10">
        <span className="mb-3 flex items-center gap-3">
          <span aria-hidden="true" className={cn("flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold", stageStyles[candidate.stage].badge)}>{candidate.name.slice(0, 1)}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-slate-800">{candidate.name}</span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">{candidate.job}</span>
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><UserRound aria-hidden="true" className="size-3" /><time dateTime={candidate.appliedAt}>{date}</time> 지원</span>
      </button>
      <div className="mx-4 flex items-center justify-between gap-2 border-t border-slate-100 py-3">
        <span className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium", stageStyles[candidate.stage].badge)}>
          <span aria-hidden="true" className={cn("size-1.5 rounded-full", stageStyles[candidate.stage].dot)} />{STAGE_LABELS[candidate.stage]}
        </span>
        <DropdownMenu modal={false} onOpenChange={(open) => { if (open) selectedMove.current = false; }}>
          <DropdownMenuTrigger asChild>
            <button type="button" data-candidate-move={candidate.id} disabled={pending} aria-label={`${candidate.name} 단계 변경${pending ? " (저장 중)" : ""}`} className="inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-wait disabled:text-slate-400">
              {pending ? <><LoaderCircle aria-hidden="true" className="size-3 animate-spin" />저장 중</> : <>단계 이동<ChevronDown aria-hidden="true" className="size-3" /></>}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44" onCloseAutoFocus={(event) => { if (selectedMove.current) event.preventDefault(); }}>
            <DropdownMenuLabel className="text-xs text-slate-500">이동할 단계</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STAGES.map((stage) => <DropdownMenuItem key={stage} disabled={pending || stage === candidate.stage} onSelect={() => { selectedMove.current = true; onMove(candidate.id, stage); }}>
              <span aria-hidden="true" className={cn("size-2 rounded-full", stageStyles[stage].dot)} />
              {STAGE_LABELS[stage]}{stage === candidate.stage && <Check aria-label="현재 단계" className="ml-auto size-3.5" />}
            </DropdownMenuItem>)}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </li>
  );
});

export function CandidateBoard({ candidates, pendingIds, onMove, onOpenDetail }: CandidateBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const focusedCard = useRef<string | null>(null);
  const requestedMove = useRef<string | null>(null);
  const previousStages = useRef(new Map<string, Stage>());
  const columns = useMemo(() => {
    const grouped: Record<Stage, Candidate[]> = { review: [], interview: [], offer: [], hired: [], rejected: [] };
    const sorted = [...candidates].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt) || a.id.localeCompare(b.id));
    for (const candidate of sorted) grouped[candidate.stage].push(candidate);
    return grouped;
  }, [candidates]);
  const move = useCallback((id: string, stage: Stage) => {
    requestedMove.current = id;
    onMove(id, stage);
  }, [onMove]);

  useLayoutEffect(() => {
    const id = requestedMove.current ?? focusedCard.current;
    const candidate = candidates.find((item) => item.id === id);
    const changedStage = candidate && previousStages.current.has(candidate.id) && previousStages.current.get(candidate.id) !== candidate.stage;
    // A column move remounts the card. Restore focus for that card only; unrelated
    // updates must never steal focus from a search field or another card.
    if (candidate && changedStage && (requestedMove.current || document.activeElement === document.body)) {
      const detail = Array.from(boardRef.current?.querySelectorAll<HTMLButtonElement>("[data-candidate-detail]") ?? []).find((button) => button.dataset.candidateDetail === id);
      detail?.focus({ preventScroll: true });
      detail?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
      requestedMove.current = null;
    }
    previousStages.current = new Map(candidates.map((item) => [item.id, item.stage]));
  }, [candidates]);

  return (
    <div ref={boardRef} role="region" aria-label="지원자 채용 단계 보드" tabIndex={0} className="overflow-x-auto rounded-xl pb-4" onFocusCapture={(event) => {
      const card = (event.target as HTMLElement).closest<HTMLElement>("[data-candidate-card]");
      focusedCard.current = card?.dataset.candidateCard ?? null;
    }}>
      <div className="grid min-w-[1240px] grid-cols-5 items-start gap-4">
        {STAGES.map((stage, index) => <section key={stage} aria-label={`${STAGE_LABELS[stage]} ${columns[stage].length}명`} className="min-w-0 rounded-xl bg-slate-100/70 p-2.5">
          <div className="flex items-center gap-2 px-1.5 pb-4 pt-2">
            <span aria-hidden="true" className={cn("size-2 rounded-full", stageStyles[stage].dot)} />
            <h3 className="text-[13px] font-semibold text-slate-700">{STAGE_LABELS[stage]}</h3>
            <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500">{columns[stage].length}</span>
            <span aria-hidden="true" className="ml-auto text-[10px] font-medium tabular-nums text-slate-400">0{index + 1}</span>
          </div>
          <ul aria-label={`${STAGE_LABELS[stage]} 지원자 목록`} tabIndex={columns[stage].length ? 0 : undefined} className="max-h-[min(60vh,720px)] space-y-2.5 overflow-y-auto overscroll-contain rounded-lg p-0.5">
            {columns[stage].map((candidate) => <CandidateCard key={candidate.id} candidate={candidate} pending={pendingIds.has(candidate.id)} onMove={move} onOpenDetail={onOpenDetail} />)}
          </ul>
          {columns[stage].length === 0 && <p className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-slate-300/70 px-3 text-xs text-slate-500">이 단계의 지원자가 없습니다</p>}
        </section>)}
      </div>
    </div>
  );
}
