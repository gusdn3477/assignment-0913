"use client";

import {
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import {
  defaultRangeExtractor,
  useVirtualizer,
  type Range,
} from "@tanstack/react-virtual";
import { STAGE_LABELS } from "@/constants/candidate";
import {
  type Candidate,
  type Stage,
} from "@/features/candidates/types/candidate";
import {
  useCandidateScrollRestoration,
  type CandidateFocusRequest,
} from "@/components/candidate/board/virtual-list/use-candidate-scroll-restoration";

export interface CandidateListHandle {
  focusCandidate: (id: string, control?: "detail" | "move") => void;
}

export function VirtualCandidateList({
  candidates,
  stage,
  focusId,
  dragId,
  resetKey,
  listRef,
  children,
}: {
  candidates: Candidate[];
  stage: Stage;
  focusId: string | null;
  dragId?: string | null;
  resetKey?: string;
  listRef: Ref<CandidateListHandle>;
  children: (candidate: Candidate) => ReactNode;
}) {
  "use no memo"; // Virtualizer is mutable; do not compiler-memoize its reads.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [request, setRequest] = useState<CandidateFocusRequest | null>(null);
  const pinnedIndex = candidates.findIndex(
    (candidate) => candidate.id === (request?.id ?? focusId),
  );
  const focusedIndex = candidates.findIndex(
    (candidate) => candidate.id === focusId,
  );
  const draggedIndex = candidates.findIndex(
    (candidate) => candidate.id === dragId,
  );
  // Instance stays local and this component opts out of compiler memoization.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    // A stage move remounts measured rows while dnd-kit is completing its
    // lifecycle. Let React schedule that render instead of nesting flushSync.
    useFlushSync: false,
    count: candidates.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 174,
    getItemKey: (index) => candidates[index].id,
    overscan: 2,
    gap: 10,
    // Include breathing room in the scroll geometry, even after the last card.
    paddingStart: 6,
    paddingEnd: 16,
    scrollPaddingStart: 6,
    scrollPaddingEnd: 16,
    initialRect: { width: 240, height: 720 },
    // This component opts out of the compiler because the virtualizer is mutable.
    // Keep this option stable so the external instance does not recalculate its range
    // solely because the component rendered.
    rangeExtractor: useCallback(
      (range: Range) => {
        const indexes = defaultRangeExtractor(range);
        // Keep the final control mounted for native reverse Tab entry from outside.
        for (const index of [
          pinnedIndex,
          focusedIndex,
          draggedIndex,
          candidates.length - 1,
        ]) {
          if (index >= 0 && !indexes.includes(index)) indexes.push(index);
        }
        return indexes.sort((a, b) => a - b);
      },
      [pinnedIndex, focusedIndex, draggedIndex, candidates.length],
    ),
  });
  useImperativeHandle(
    listRef,
    () => ({
      focusCandidate(id, control = "detail") {
        setRequest({ id, control });
      },
    }),
    [],
  );
  useCandidateScrollRestoration({
    resetKey,
    request,
    pinnedIndex,
    scrollRef,
    virtualizer,
  });

  return (
    <div
      ref={scrollRef}
      data-candidate-column={stage}
      tabIndex={candidates.length ? 0 : undefined}
      aria-label={`${STAGE_LABELS[stage]} 지원자 스크롤 영역`}
      className="max-h-[max(720px,75vh)] overflow-y-auto overscroll-contain rounded-lg px-1.5"
    >
      <ul
        aria-label={`${STAGE_LABELS[stage]} 지원자 목록`}
        className="relative"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((item) => (
          <li
            key={item.key}
            data-index={item.index}
            ref={virtualizer.measureElement}
            aria-posinset={item.index + 1}
            aria-setsize={candidates.length}
            className="absolute top-0 left-0 w-full"
            style={{ transform: `translateY(${item.start}px)` }}
          >
            {children(candidates[item.index])}
          </li>
        ))}
      </ul>
    </div>
  );
}
