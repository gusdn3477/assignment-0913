import { useLayoutEffect, useRef, type RefObject } from "react";
import type { ReactVirtualizer } from "@tanstack/react-virtual";

export interface CandidateFocusRequest {
  id: string;
  control: "detail" | "move";
}

export function useCandidateScrollRestoration({
  resetKey,
  request,
  pinnedIndex,
  scrollRef,
  virtualizer,
}: {
  resetKey?: string;
  request: CandidateFocusRequest | null;
  pinnedIndex: number;
  scrollRef: RefObject<HTMLDivElement | null>;
  virtualizer: ReactVirtualizer<HTMLDivElement, Element>;
}) {
  const handledRequest = useRef<CandidateFocusRequest | null>(null);

  useLayoutEffect(() => {
    virtualizer.scrollToOffset(0);
  }, [resetKey, virtualizer]);

  useLayoutEffect(() => {
    if (!request || request === handledRequest.current || pinnedIndex < 0)
      return;

    handledRequest.current = request;
    virtualizer.scrollToIndex(pinnedIndex, { align: "auto" });

    const attribute = `data-candidate-${request.control}`;
    const control = Array.from(
      scrollRef.current?.querySelectorAll<HTMLButtonElement>(
        `[${attribute}]`,
      ) ?? [],
    ).find((node) => node.getAttribute(attribute) === request.id);

    control?.focus({ preventScroll: true });
    control?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [request, pinnedIndex, scrollRef, virtualizer]);
}
