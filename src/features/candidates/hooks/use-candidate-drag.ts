"use client";

import { useCallback, useLayoutEffect, useRef, useState } from "react";
import type { DragDropEventHandlers } from "@dnd-kit/react";
import { STAGES } from "@/features/candidates/constants/candidate";
import type { Candidate, Stage } from "@/features/candidates/types/candidate";

type Session = { id: string; stage: Stage; resetKey?: string };

export function useCandidateDrag({
  candidates,
  pendingIds,
  resetKey,
  onMove,
}: {
  candidates: Candidate[];
  pendingIds: ReadonlySet<string>;
  resetKey?: string;
  onMove: (id: string, stage: Stage) => void;
}) {
  const session = useRef<Session | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const isCurrent = useCallback(
    (drag: Session) =>
      drag.resetKey === resetKey &&
      !pendingIds.has(drag.id) &&
      candidates.some(
        (candidate) =>
          candidate.id === drag.id && candidate.stage === drag.stage,
      ),
    [candidates, pendingIds, resetKey],
  );
  const clear = useCallback(() => {
    session.current = null;
    setDragId(null);
  }, []);
  useLayoutEffect(() => {
    // Invalidate permanently, including when a filtered/changed source returns.
    if (session.current && !isCurrent(session.current)) clear();
  }, [isCurrent, clear]);
  const onDragStart: DragDropEventHandlers["onDragStart"] = ({ operation }) => {
    const candidate = candidates.find(
      (item) => item.id === operation.source?.id,
    );
    if (!candidate || pendingIds.has(candidate.id)) return;
    session.current = { id: candidate.id, stage: candidate.stage, resetKey };
    setDragId(candidate.id);
  };
  const onDragEnd: DragDropEventHandlers["onDragEnd"] = ({
    operation,
    canceled,
  }) => {
    const drag = session.current;
    const stage = STAGES.find((stage) => stage === operation.target?.id);
    clear(); // Consume before mutation: repeated end events cannot write twice.
    if (!canceled && drag && isCurrent(drag) && stage && stage !== drag.stage)
      onMove(drag.id, stage);
  };
  return { dragId, onDragStart, onDragEnd };
}
