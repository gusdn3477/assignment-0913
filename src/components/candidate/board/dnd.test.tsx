import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  setupDragGeometry,
  sensorDrag,
  startDrag,
  endDrag,
  moveDrag,
  dragHandle,
} from "./dnd-test-helpers";
import { CandidateBoard } from "@/components/candidate/board/candidate-board";
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
  loadingIds: new Set<string>(),
  onMove: vi.fn(),
  onOpenDetail: vi.fn(),
};
describe("candidate drag and drop", () => {
  beforeEach(setupDragGeometry);
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  it("moves with real keyboard sensor and collision handling", async () => {
    const onMove = vi.fn();
    render(<CandidateBoard {...defaults} onMove={onMove} />);
    await sensorDrag("a", "interview");
    await endDrag();
    expect(onMove).toHaveBeenCalledExactlyOnceWith("a", "interview");
  });

  it.each(["same-stage", "external", "escape", "outside"])(
    "rejects %s drops",
    async (scenario) => {
      const onMove = vi.fn();
      render(<CandidateBoard {...defaults} onMove={onMove} />);
      if (scenario !== "external") await startDrag();
      if (scenario === "outside") {
        await moveDrag("offer");
        for (let i = 0; i < 25; i++) {
          await act(async () => {
            fireEvent.keyDown(document, {
              key: "ArrowUp",
              code: "ArrowUp",
              shiftKey: true,
            });
          });
        }
      }
      await endDrag(scenario === "escape");
      await endDrag();
      expect(onMove).not.toHaveBeenCalled();
    },
  );

  it.each(["loading", "removed", "stage", "filter"])(
    "permanently invalidates a %s source",
    async (scenario) => {
      const onMove = vi.fn();
      const { rerender } = render(
        <CandidateBoard {...defaults} onMove={onMove} resetKey="first" />,
      );
      await startDrag();
      await moveDrag("offer");
      rerender(
        <CandidateBoard
          {...defaults}
          onMove={onMove}
          resetKey={scenario === "filter" ? "second" : "first"}
          loadingIds={scenario === "loading" ? new Set(["a"]) : new Set()}
          candidates={
            scenario === "removed"
              ? []
              : [
                  {
                    ...candidate,
                    stage: scenario === "stage" ? "interview" : "review",
                  },
                ]
          }
        />,
      );
      rerender(
        <CandidateBoard {...defaults} onMove={onMove} resetKey="first" />,
      );
      await endDrag();
      expect(onMove).not.toHaveBeenCalled();
    },
  );

  it("blocks a loading handle but permits another card", async () => {
    const onMove = vi.fn();
    render(
      <CandidateBoard
        {...defaults}
        onMove={onMove}
        candidates={[candidate, { ...candidate, id: "b" }]}
        loadingIds={new Set(["a"])}
      />,
    );
    expect(dragHandle()).toBeDisabled();
    await sensorDrag("a", "offer");
    await sensorDrag("b", "offer");
    expect(onMove).toHaveBeenCalledExactlyOnceWith("b", "offer");
  });

  it("pins the source across a 1000-card virtual scroll", async () => {
    const many = Array.from({ length: 1000 }, (_, index) => ({
      ...candidate,
      id: String(index).padStart(4, "0"),
    }));
    render(<CandidateBoard {...defaults} candidates={many} />);
    const source = dragHandle("0000");
    await startDrag("0000");
    fireEvent.scroll(screen.getByLabelText("서류검토 지원자 스크롤 영역"), {
      target: { scrollTop: 184 * 500 },
    });
    expect(source).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeLessThan(15);
    await endDrag(true);
    expect(source).not.toBeInTheDocument();
  });
});
