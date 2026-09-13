import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CandidateBoard } from "@/features/candidates/components/candidate-board/candidate-board";
import { JOBS } from "@/features/candidates/constants/candidate";
import { type Candidate } from "@/features/candidates/types/candidate";

const candidate: Candidate = {
  id: "a",
  name: "김하늘",
  job: JOBS[0],
  stage: "review",
  appliedAt: "2026-09-12",
  email: "a@example.com",
  summary: "",
};
const defaults = {
  candidates: [candidate],
  pendingIds: new Set<string>(),
  onMove: vi.fn(),
  onOpenDetail: vi.fn(),
};
function dragTransfer() {
  const data = new Map<string, string>();
  return {
    types: [] as string[],
    effectAllowed: "",
    dropEffect: "",
    setDragImage: vi.fn(),
    setData(type: string, value: string) {
      data.set(type, value);
      this.types.push(type);
    },
    getData(type: string) {
      return data.get(type) ?? "";
    },
  };
}
const handle = (id = "a") =>
  document.querySelector<HTMLElement>(`[data-candidate-drag="${id}"]`)!;
const column = (stage: string) =>
  document.querySelector<HTMLElement>(`[data-drop-stage="${stage}"]`)!;

describe("candidate drag and drop", () => {
  it("moves only from the separate handle to a different stage and consumes the session", () => {
    const onMove = vi.fn();
    const onOpenDetail = vi.fn();
    render(
      <CandidateBoard
        {...defaults}
        onMove={onMove}
        onOpenDetail={onOpenDetail}
      />,
    );
    const dataTransfer = dragTransfer();
    fireEvent.dragStart(handle(), { dataTransfer });
    expect(dataTransfer.effectAllowed).toBe("move");
    expect(document.querySelector('[data-candidate-card="a"]')).toHaveAttribute(
      "data-dragging",
      "true",
    );
    fireEvent.dragOver(column("interview"), { dataTransfer });
    expect(column("interview")).toHaveAttribute("data-drop-active", "true");
    expect(screen.getByRole("status")).toHaveTextContent("면접에 놓아 이동");
    fireEvent.drop(column("interview"), { dataTransfer });
    fireEvent.drop(column("offer"), { dataTransfer });
    expect(onMove).toHaveBeenCalledExactlyOnceWith("a", "interview");
    expect(onOpenDetail).not.toHaveBeenCalled();
    expect(column("interview")).not.toHaveAttribute("data-drop-active");
  });

  it.each(["same-stage", "external", "forged", "ended", "escape"])(
    "rejects %s drops",
    (scenario) => {
      const onMove = vi.fn();
      render(<CandidateBoard {...defaults} onMove={onMove} />);
      const dataTransfer = dragTransfer();
      if (scenario !== "external")
        fireEvent.dragStart(handle(), { dataTransfer });
      if (scenario === "ended") fireEvent.dragEnd(handle());
      if (scenario === "escape") fireEvent.keyDown(handle(), { key: "Escape" });
      fireEvent.drop(column(scenario === "same-stage" ? "review" : "offer"), {
        dataTransfer: scenario === "forged" ? dragTransfer() : dataTransfer,
      });
      expect(onMove).not.toHaveBeenCalled();
    },
  );

  it.each(["pending", "removed", "stage", "filter"])(
    "invalidates a drag after %s changes, even if source returns",
    (scenario) => {
      const onMove = vi.fn();
      const { rerender } = render(
        <CandidateBoard {...defaults} onMove={onMove} resetKey="first" />,
      );
      const dataTransfer = dragTransfer();
      fireEvent.dragStart(handle(), { dataTransfer });
      let candidatesForScenario = [candidate];
      if (scenario === "removed") candidatesForScenario = [];
      if (scenario === "stage")
        candidatesForScenario = [{ ...candidate, stage: "interview" }];
      rerender(
        <CandidateBoard
          {...defaults}
          onMove={onMove}
          resetKey={scenario === "filter" ? "second" : "first"}
          pendingIds={scenario === "pending" ? new Set(["a"]) : new Set()}
          candidates={candidatesForScenario}
        />,
      );
      rerender(
        <CandidateBoard {...defaults} onMove={onMove} resetKey="first" />,
      );
      fireEvent.drop(column("offer"), { dataTransfer });
      expect(onMove).not.toHaveBeenCalled();
      expect(screen.getByRole("status")).toBeEmptyDOMElement();
    },
  );

  it("blocks pending handles while leaving another card draggable", () => {
    const onMove = vi.fn();
    render(
      <CandidateBoard
        {...defaults}
        candidates={[candidate, { ...candidate, id: "b" }]}
        pendingIds={new Set(["a"])}
        onMove={onMove}
      />,
    );
    const dataTransfer = dragTransfer();
    expect(handle()).toHaveAttribute("draggable", "false");
    fireEvent.dragStart(handle(), { dataTransfer });
    fireEvent.drop(column("offer"), { dataTransfer });
    expect(onMove).not.toHaveBeenCalled();
    fireEvent.dragStart(handle("b"), { dataTransfer });
    fireEvent.drop(column("offer"), { dataTransfer });
    expect(onMove).toHaveBeenCalledExactlyOnceWith("b", "offer");
  });

  it("pins the drag source when its column scrolls through 1000 cards", () => {
    const many = Array.from({ length: 1000 }, (_, index) => ({
      ...candidate,
      id: String(index).padStart(4, "0"),
    }));
    render(<CandidateBoard {...defaults} candidates={many} />);
    const source = handle("0000");
    fireEvent.dragStart(source, { dataTransfer: dragTransfer() });
    fireEvent.scroll(screen.getByLabelText("서류검토 지원자 스크롤 영역"), {
      target: { scrollTop: 184 * 500 },
    });
    expect(source).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeLessThan(15);
    fireEvent.dragEnd(source);
    expect(source).not.toBeInTheDocument();
  });

  it("scrolls the board at its horizontal edges only for an internal drag", () => {
    render(<CandidateBoard {...defaults} />);
    const board = screen.getByRole("region", { name: "지원자 채용 단계 보드" });
    vi.spyOn(board, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 500,
    } as DOMRect);
    const dataTransfer = dragTransfer();
    fireEvent.dragOver(board, { dataTransfer, clientX: 490 });
    expect(board.scrollLeft).toBe(0);
    fireEvent.dragStart(handle(), { dataTransfer });
    // jsdom's generic drag event needs explicit mouse coordinates.
    const event = new Event("dragover", { bubbles: true, cancelable: true });
    Object.defineProperties(event, {
      dataTransfer: { value: dataTransfer },
      clientX: { value: 490 },
    });
    fireEvent(board, event);
    expect(board.scrollLeft).toBe(32);
  });
});
