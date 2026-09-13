"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { DragDropEventHandlers } from "@dnd-kit/react";
import { STAGES } from "@/constants/candidate";
import type { Candidate, Stage } from "@/features/candidates/types/candidate";

type Session = { id: string; stage: Stage; resetKey?: string };

function isCurrentSession(
  drag: Session,
  candidates: Candidate[],
  loadingIds: ReadonlySet<string>,
  resetKey?: string,
) {
  return (
    drag.resetKey === resetKey &&
    !loadingIds.has(drag.id) &&
    candidates.some(
      (candidate) => candidate.id === drag.id && candidate.stage === drag.stage,
    )
  );
}

export function useCandidateStageDrag({
  candidates,
  loadingIds,
  resetKey,
  onMove,
}: {
  candidates: Candidate[];
  loadingIds: ReadonlySet<string>;
  resetKey?: string;
  onMove: (id: string, stage: Stage) => void;
}) {
  const session = useRef<Session | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  function clear() {
    session.current = null;
    setDragId(null);
  }
  useLayoutEffect(() => {
    // Invalidate permanently, including when a filtered/changed source returns.
    const drag = session.current;
    if (drag && !isCurrentSession(drag, candidates, loadingIds, resetKey)) {
      session.current = null;
      setDragId(null);
    }
  }, [candidates, loadingIds, resetKey]);
  const onDragStart: DragDropEventHandlers["onDragStart"] = ({ operation }) => {
    const candidate = candidates.find(
      (item) => item.id === operation.source?.id,
    );
    if (!candidate || loadingIds.has(candidate.id)) return;
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
    if (
      !canceled &&
      drag &&
      isCurrentSession(drag, candidates, loadingIds, resetKey) &&
      stage &&
      stage !== drag.stage
    )
      onMove(drag.id, stage);
  };
  return { dragId, onDragStart, onDragEnd };
}
