"use client";

import {
  memo,
  type DragEvent,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Check,
  GripVertical,
  ChevronDown,
  LoaderCircle,
  UserRound,
  Undo2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  VirtualCandidateList,
  type CandidateListHandle,
} from "./virtual-candidate-list";
import { useCandidateDrag } from "./use-candidate-drag";
import { cn } from "@/lib/utils";
import type { CandidateUndo } from "./queries";
import { STAGES, STAGE_LABELS, type Candidate, type Stage } from "./types";

interface CandidateBoardProps {
  resetKey?: string;
  undoHistory?: ReadonlyMap<string, CandidateUndo>;
  onUndo?: (id: string) => boolean;
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

const CandidateCard = memo(function CandidateCard({
  candidate,
  pending,
  undoStage,
  onUndo,
  onMove,
  onOpenDetail,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  dragging: boolean;
  onDragStart: (event: DragEvent<HTMLElement>, candidate: Candidate) => void;
  onDragEnd: () => void;
  candidate: Candidate;
  pending: boolean;
  undoStage?: Stage;
  onUndo: (id: string) => boolean;
  onMove: CandidateBoardProps["onMove"];
  onOpenDetail: CandidateBoardProps["onOpenDetail"];
}) {
  const selectedMove = useRef(false);
  const date = candidate.appliedAt.slice(0, 10).replaceAll("-", ".");
  return (
    <div
      data-candidate-card={candidate.id}
      data-dragging={dragging || undefined}
      className="relative rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_5px_rgba(27,39,68,0.025)] transition-shadow hover:shadow-md data-[dragging=true]:opacity-50"
    >
      <span
        aria-hidden="true"
        data-candidate-drag={candidate.id}
        draggable={!pending}
        onDragStart={(event) => onDragStart(event, candidate)}
        onDragEnd={onDragEnd}
        title={
          pending
            ? "저장 중"
            : "다른 단계로 드래그 · 키보드와 터치는 단계 이동 메뉴 사용"
        }
        className={cn(
          "absolute right-1 top-2 z-10 flex size-7 items-center justify-center rounded-md text-slate-400",
          pending
            ? "cursor-wait opacity-40"
            : "cursor-grab hover:bg-slate-100 active:cursor-grabbing",
        )}
      >
        <GripVertical className="size-4" />
      </span>
      <button
        type="button"
        data-candidate-detail={candidate.id}
        onClick={() => onOpenDetail(candidate.id)}
        aria-label={`${candidate.name} 지원자 상세 보기`}
        className="block w-full rounded-t-xl p-4 pr-8 text-left focus-visible:relative focus-visible:z-10"
      >
        <span className="mb-3 flex items-center gap-3">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              stageStyles[candidate.stage].badge,
            )}
          >
            {candidate.name.slice(0, 1)}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-slate-800">
              {candidate.name}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {candidate.job}
            </span>
          </span>
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <UserRound aria-hidden="true" className="size-3" />
          <time dateTime={candidate.appliedAt}>{date}</time> 지원
        </span>
      </button>
      <div className="mx-4 flex items-center justify-between gap-2 border-t border-slate-100 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium",
            stageStyles[candidate.stage].badge,
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 rounded-full",
              stageStyles[candidate.stage].dot,
            )}
          />
          {STAGE_LABELS[candidate.stage]}
        </span>
        <DropdownMenu
          modal={false}
          onOpenChange={(open) => {
            if (open) selectedMove.current = false;
          }}
        >
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              data-candidate-move={candidate.id}
              disabled={pending}
              aria-label={`${candidate.name} 단계 변경${pending ? " (저장 중)" : ""}`}
              className="inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-wait disabled:text-slate-400"
            >
              {pending ? (
                <>
                  <LoaderCircle
                    aria-hidden="true"
                    className="size-3 animate-spin"
                  />
                  저장 중
                </>
              ) : (
                <>
                  단계 이동
                  <ChevronDown aria-hidden="true" className="size-3" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44"
            onCloseAutoFocus={(event) => {
              if (selectedMove.current) event.preventDefault();
            }}
          >
            <DropdownMenuLabel className="text-xs text-slate-500">
              이동할 단계
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STAGES.map((stage) => (
              <DropdownMenuItem
                key={stage}
                disabled={pending || stage === candidate.stage}
                onSelect={() => {
                  selectedMove.current = true;
                  onMove(candidate.id, stage);
                }}
              >
                <span
                  aria-hidden="true"
                  className={cn("size-2 rounded-full", stageStyles[stage].dot)}
                />
                {STAGE_LABELS[stage]}
                {stage === candidate.stage && (
                  <Check aria-label="현재 단계" className="ml-auto size-3.5" />
                )}
              </DropdownMenuItem>
            ))}
            {undoStage && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={pending}
                  onSelect={() => {
                    selectedMove.current = onUndo(candidate.id);
                  }}
                >
                  <Undo2 aria-hidden="true" className="size-3.5" />
                  {STAGE_LABELS[undoStage]} 단계로 되돌리기
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

export function CandidateBoard({
  candidates,
  resetKey,
  undoHistory,
  onUndo,
  pendingIds,
  onMove,
  onOpenDetail,
}: CandidateBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const focusedCard = useRef<string | null>(null);
  const [focusId, setFocusId] = useState<string | null>(null);
  const lists = useRef<Partial<Record<Stage, CandidateListHandle>>>({});
  const requestedMove = useRef<string | null>(null);
  const previousStages = useRef(new Map<string, Stage>());
  const columns = useMemo(() => {
    const grouped: Record<Stage, Candidate[]> = {
      review: [],
      interview: [],
      offer: [],
      hired: [],
      rejected: [],
    };
    const sorted = [...candidates].sort(
      (a, b) =>
        b.appliedAt.localeCompare(a.appliedAt) || a.id.localeCompare(b.id),
    );
    for (const candidate of sorted) grouped[candidate.stage].push(candidate);
    return grouped;
  }, [candidates]);
  const move = useCallback(
    (id: string, stage: Stage) => {
      requestedMove.current = id;
      onMove(id, stage);
    },
    [onMove],
  );

  const drag = useCandidateDrag({
    candidates,
    pendingIds,
    resetKey,
    boardRef,
    onMove: move,
  });

  const undo = useCallback(
    (id: string) => {
      if (!onUndo?.(id)) return false;
      requestedMove.current = id;
      return true;
    },
    [onUndo],
  );

  useLayoutEffect(() => {
    const id = requestedMove.current ?? focusedCard.current;
    const candidate = candidates.find((item) => item.id === id);
    const changedStage =
      candidate &&
      previousStages.current.has(candidate.id) &&
      previousStages.current.get(candidate.id) !== candidate.stage;
    // A column move remounts the card. Restore focus for that card only; unrelated
    // updates must never steal focus from a search field or another card.
    if (
      candidate &&
      changedStage &&
      (requestedMove.current || document.activeElement === document.body)
    ) {
      lists.current[candidate.stage]?.focusCandidate(candidate.id);
      requestedMove.current = null;
    }
    previousStages.current = new Map(
      candidates.map((item) => [item.id, item.stage]),
    );
  }, [candidates]);

  return (
    <div
      ref={boardRef}
      role="region"
      aria-label="지원자 채용 단계 보드"
      tabIndex={0}
      className="overflow-x-auto rounded-xl pb-4"
      onDragOver={(event) => {
        if (
          event.target === event.currentTarget ||
          !(event.target as HTMLElement).closest("[data-drop-stage]")
        )
          drag.over(event);
      }}
      onDragLeave={drag.leave}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") drag.cancel();
        if (
          event.key !== "Tab" ||
          event.altKey ||
          event.ctrlKey ||
          event.metaKey
        )
          return;
        const target = event.target as HTMLElement;
        // Portalled menus own their keyboard behavior.
        if (!boardRef.current?.contains(target)) return;
        const controls: {
          stage: Stage;
          id?: string;
          control?: "detail" | "move";
        }[] = [];
        for (const stage of STAGES) {
          if (!columns[stage].length) continue;
          controls.push({ stage });
          for (const candidate of columns[stage]) {
            controls.push({ stage, id: candidate.id, control: "detail" });
            if (!pendingIds.has(candidate.id))
              controls.push({ stage, id: candidate.id, control: "move" });
          }
        }
        const index = controls.findIndex((item) =>
          item.id
            ? target.getAttribute(`data-candidate-${item.control}`) === item.id
            : target.dataset.candidateColumn === item.stage,
        );
        const next = controls[index + (event.shiftKey ? -1 : 1)];
        if (index < 0 || !next) return;
        event.preventDefault();
        if (next.id)
          lists.current[next.stage]?.focusCandidate(next.id, next.control);
        else
          boardRef.current
            ?.querySelector<HTMLElement>(
              `[data-candidate-column="${next.stage}"]`,
            )
            ?.focus();
      }}
      onPointerDownCapture={(event) => {
        if (!boardRef.current?.contains(event.target as Node)) return;
        const card = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-candidate-card]",
        );
        if (card) {
          focusedCard.current = card.dataset.candidateCard ?? null;
          setFocusId(focusedCard.current);
        }
      }}
      onFocusCapture={(event) => {
        if (!boardRef.current?.contains(event.target as Node)) return;
        const card = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-candidate-card]",
        );
        focusedCard.current = card?.dataset.candidateCard ?? null;
        setFocusId(focusedCard.current);
      }}
    >
      <p role="status" className="sr-only">
        {drag.message}
      </p>
      <div className="grid min-w-[1240px] grid-cols-5 items-start gap-4">
        {STAGES.map((stage, index) => (
          <section
            key={stage}
            aria-label={`${STAGE_LABELS[stage]} ${columns[stage].length}명`}
            data-drop-stage={stage}
            data-drop-active={drag.target === stage || undefined}
            onDragOver={(event) => drag.over(event, stage)}
            onDrop={(event) => drag.drop(event, stage)}
            className="min-w-0 rounded-xl bg-slate-100/70 p-2.5 data-[drop-active=true]:bg-blue-50 data-[drop-active=true]:ring-2 data-[drop-active=true]:ring-blue-400"
          >
            <div className="flex items-center gap-2 px-1.5 pb-4 pt-2">
              <span
                aria-hidden="true"
                className={cn("size-2 rounded-full", stageStyles[stage].dot)}
              />
              <h3 className="text-[13px] font-semibold text-slate-700">
                {STAGE_LABELS[stage]}
              </h3>
              <span className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-semibold tabular-nums text-slate-500">
                {columns[stage].length}
              </span>
              <span
                aria-hidden="true"
                className="ml-auto text-[10px] font-medium tabular-nums text-slate-400"
              >
                0{index + 1}
              </span>
            </div>
            <VirtualCandidateList
              candidates={columns[stage]}
              stage={stage}
              focusId={focusId}
              dragId={drag.dragId}
              resetKey={resetKey}
              listRef={(handle) => {
                if (handle) lists.current[stage] = handle;
                else delete lists.current[stage];
              }}
            >
              {(candidate) => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  pending={pendingIds.has(candidate.id)}
                  dragging={drag.dragId === candidate.id}
                  onDragStart={drag.start}
                  onDragEnd={drag.cancel}
                  undoStage={
                    undoHistory?.get(candidate.id)?.savedStage ===
                    candidate.stage
                      ? undoHistory.get(candidate.id)?.previousStage
                      : undefined
                  }
                  onUndo={undo}
                  onMove={move}
                  onOpenDetail={onOpenDetail}
                />
              )}
            </VirtualCandidateList>
            {columns[stage].length === 0 && (
              <p className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-slate-300/70 px-3 text-xs text-slate-500">
                이 단계의 지원자가 없습니다
              </p>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
