"use client";
import { memo, useRef } from "react";
import { useDraggable } from "@dnd-kit/react";
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
import { cn } from "@/lib/utils";
import {
  STAGES,
  STAGE_LABELS,
} from "@/features/candidates/constants/candidate";
import { stageStyles } from "@/features/candidates/constants/stage-styles";
import type { Candidate, Stage } from "@/features/candidates/types/candidate";
export const CandidateCard = memo(function CandidateCard({
  candidate,
  loading,
  undoStage,
  onUndo,
  onMove,
  onOpenDetail,
}: {
  candidate: Candidate;
  loading: boolean;
  undoStage?: Stage;
  onUndo: (id: string) => boolean;
  onMove: (id: string, stage: Stage) => void;
  onOpenDetail: (id: string) => void;
}) {
  const { ref, handleRef, isDragging } = useDraggable({
    id: candidate.id,
    type: "candidate",
    disabled: loading,
  });
  const selectedMove = useRef(false);
  const date = candidate.appliedAt.slice(0, 10).replaceAll("-", ".");
  return (
    <div
      ref={ref}
      data-candidate-card={candidate.id}
      data-dragging={isDragging || undefined}
      className="relative rounded-xl border border-slate-200/80 bg-white shadow-[0_2px_5px_rgba(27,39,68,0.025)] transition-shadow hover:shadow-md data-[dragging=true]:opacity-50"
    >
      <button
        ref={handleRef}
        type="button"
        tabIndex={-1}
        aria-label={`${candidate.name} 단계 드래그`}
        disabled={loading}
        data-candidate-drag={candidate.id}
        title={
          loading
            ? "저장 중"
            : "다른 단계로 드래그 · 단계 이동 메뉴도 사용 가능"
        }
        className={cn(
          "absolute right-1 top-2 z-10 flex touch-none size-7 items-center justify-center rounded-md text-slate-400",
          loading
            ? "cursor-wait opacity-40"
            : "cursor-grab hover:bg-slate-100 active:cursor-grabbing",
        )}
      >
        <GripVertical aria-hidden="true" className="size-4" />
      </button>
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
              disabled={loading}
              aria-label={`${candidate.name} 단계 변경${loading ? " (저장 중)" : ""}`}
              className="inline-flex min-h-8 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:cursor-wait disabled:text-slate-400"
            >
              {loading ? (
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
                disabled={loading || stage === candidate.stage}
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
                  disabled={loading}
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
