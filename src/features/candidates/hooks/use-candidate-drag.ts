"use client";

import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent,
  type RefObject,
} from "react";
import { STAGE_LABELS } from "@/features/candidates/constants/candidate";
import {
  type Candidate,
  type Stage,
} from "@/features/candidates/types/candidate";

const DRAG_TYPE = "application/x-candidate-stage";
type DragSession = {
  id: string;
  stage: Stage;
  name: string;
  token: string;
  resetKey?: string;
};

export function useCandidateDrag({
  candidates,
  pendingIds,
  resetKey,
  boardRef,
  onMove,
}: {
  candidates: Candidate[];
  pendingIds: ReadonlySet<string>;
  resetKey?: string;
  boardRef: RefObject<HTMLDivElement | null>;
  onMove: (id: string, stage: Stage) => void;
}) {
  const sessionRef = useRef<DragSession | null>(null);
  const [session, setSession] = useState<DragSession | null>(null);
  const [target, setTarget] = useState<Stage | null>(null);
  const cancel = useCallback(() => {
    sessionRef.current = null;
    setSession(null);
    setTarget(null);
  }, []);
  const isCurrent = useCallback(
    (drag: DragSession) =>
      drag.resetKey === resetKey &&
      !pendingIds.has(drag.id) &&
      candidates.some(
        (candidate) =>
          candidate.id === drag.id && candidate.stage === drag.stage,
      ),
    [candidates, pendingIds, resetKey],
  );

  useLayoutEffect(() => {
    // Synchronize the browser's in-progress drag with committed source data.
    if (sessionRef.current && !isCurrent(sessionRef.current)) cancel();
  }, [isCurrent, cancel]);

  const start = useCallback(
    (event: DragEvent<HTMLElement>, candidate: Candidate) => {
      if (pendingIds.has(candidate.id)) {
        event.preventDefault();
        return;
      }
      const drag = {
        id: candidate.id,
        stage: candidate.stage,
        name: candidate.name,
        token: crypto.randomUUID(),
        resetKey,
      };
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(DRAG_TYPE, drag.token);
      const card = event.currentTarget.closest<HTMLElement>(
        "[data-candidate-card]",
      );
      if (card && event.dataTransfer.setDragImage)
        event.dataTransfer.setDragImage(card, 24, 24);
      sessionRef.current = drag;
      setSession(drag);
      setTarget(null);
    },
    [pendingIds, resetKey],
  );

  const over = (event: DragEvent<HTMLElement>, stage?: Stage) => {
    const drag = sessionRef.current;
    if (
      !drag ||
      !isCurrent(drag) ||
      !event.dataTransfer.types.includes(DRAG_TYPE)
    )
      return;
    // Native dragover keeps firing near the board edges, including over gaps.
    const board = boardRef.current;
    if (board) {
      const bounds = board.getBoundingClientRect();
      if (event.clientX < bounds.left + 56) board.scrollLeft -= 32;
      else if (event.clientX > bounds.right - 56) board.scrollLeft += 32;
    }
    if (!stage || stage === drag.stage) {
      event.dataTransfer.dropEffect = "none";
      setTarget(null);
      return;
    }
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setTarget(stage);
  };

  const drop = (event: DragEvent<HTMLElement>, stage: Stage) => {
    const drag = sessionRef.current;
    if (!drag) return;
    event.preventDefault();
    const valid =
      isCurrent(drag) &&
      drag.stage !== stage &&
      event.dataTransfer.getData(DRAG_TYPE) === drag.token;
    // Consume before starting the mutation so duplicate drop events cannot write.
    cancel();
    if (valid) onMove(drag.id, stage);
  };

  const destination = target
    ? `${STAGE_LABELS[target]}에 놓아 이동`
    : "이동할 단계에 놓으세요";
  return {
    dragId: session?.id ?? null,
    target,
    message: session ? `${session.name} 드래그 중 · ${destination}` : "",
    start,
    over,
    drop,
    cancel,
    leave: (event: DragEvent<HTMLElement>) => {
      if (!event.currentTarget.contains(event.relatedTarget as Node | null))
        setTarget(null);
    },
  };
}
