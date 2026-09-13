"use client";

import {
  DragDropProvider,
  useDroppable,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/react";
import { Accessibility, Feedback } from "@dnd-kit/dom";
import type { ComponentProps } from "react";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  VirtualCandidateList,
  type CandidateListHandle,
} from "@/features/candidates/components/virtual-candidate-list/virtual-candidate-list";
import { useCandidateDrag } from "@/features/candidates/hooks/use-candidate-drag";
import { cn } from "@/lib/utils";
import { CandidateUndo } from "@/features/candidates/types/candidate";
import {
  STAGES,
  STAGE_LABELS,
} from "@/features/candidates/constants/candidate";
import {
  type Candidate,
  type Stage,
} from "@/features/candidates/types/candidate";

import { CandidateCard } from "@/features/candidates/components/candidate-card/candidate-card";
import { stageStyles } from "@/features/candidates/constants/stage-styles";

interface CandidateBoardProps {
  resetKey?: string;
  undoHistory?: ReadonlyMap<string, CandidateUndo>;
  onUndo?: (id: string) => boolean;
  candidates: Candidate[];
  pendingIds: ReadonlySet<string>;
  onMove: (id: string, stage: Stage) => void;
  onOpenDetail: (id: string) => void;
}

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
    <DragDropProvider
      plugins={dragPlugins}
      onDragStart={drag.onDragStart}
      onDragEnd={drag.onDragEnd}
    >
      <div
        ref={boardRef}
        role="region"
        aria-label="지원자 채용 단계 보드"
        tabIndex={0}
        className="overflow-x-auto rounded-xl pb-4"
        onKeyDownCapture={(event) => {
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
              ? target.getAttribute(`data-candidate-${item.control}`) ===
                item.id
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
        <div className="grid min-w-310 grid-cols-5 items-start gap-4">
          {STAGES.map((stage, index) => (
            <StageDropZone
              key={stage}
              stage={stage}
              active={Boolean(drag.dragId)}
              aria-label={`${STAGE_LABELS[stage]} ${columns[stage].length}명`}
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
            </StageDropZone>
          ))}
        </div>
      </div>
    </DragDropProvider>
  );
}

function StageDropZone({
  stage,
  active,
  ...props
}: ComponentProps<"section"> & { stage: Stage; active: boolean }) {
  const { ref, isDropTarget } = useDroppable({
    id: stage,
    type: "stage",
    accept: "candidate",
  });
  return (
    <section
      {...props}
      ref={ref}
      data-drop-stage={stage}
      data-drop-active={(active && isDropTarget) || undefined}
    />
  );
}

const dragPlugins: ComponentProps<typeof DragDropProvider>["plugins"] = (
  defaults,
) => [
  ...defaults,
  Feedback.configure({ feedback: "clone", dropAnimation: null }),
  Accessibility.configure({
    screenReaderInstructions: {
      draggable:
        "스페이스로 드래그 시작, 방향키로 단계 선택, 스페이스로 놓기, Escape로 취소합니다. 단계 이동 메뉴도 사용할 수 있습니다.",
    },
    announcements: {
      dragstart: () =>
        "지원자 드래그를 시작했습니다. 이동할 단계를 선택하세요.",
      dragover: ({ operation }: DragOverEvent) => {
        const stage = STAGES.find((stage) => stage === operation.target?.id);
        return stage
          ? `${STAGE_LABELS[stage]} 단계에 놓을 수 있습니다.`
          : "이동할 단계 위로 이동하세요.";
      },
      dragend: ({ canceled }: DragEndEvent) =>
        canceled ? "드래그를 취소했습니다." : "드래그를 종료했습니다.",
    },
  }),
];
