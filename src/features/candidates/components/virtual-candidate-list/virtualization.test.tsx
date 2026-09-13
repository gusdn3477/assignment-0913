import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CandidateBoard } from "@/features/candidates/components/candidate-board/candidate-board";
import { CandidateDetail } from "@/features/candidates/components/candidate-detail/candidate-detail";
import { CandidateUIProvider } from "@/features/candidates/stores/ui-store";
import { type Candidate } from "@/features/candidates/types/candidate";

const candidates: Candidate[] = Array.from({ length: 1000 }, (_, index) => ({
  id: String(index).padStart(4, "0"),
  name: `지원자${index}`,
  job: "프론트엔드 개발자",
  stage: "review",
  appliedAt: "2026-09-01T00:00:00Z",
  email: `${index}@example.com`,
  summary: "소개",
}));
const props = {
  candidates,
  pendingIds: new Set<string>(),
  onMove: vi.fn(),
  onOpenDetail: vi.fn(),
};
const detail = (index: number) =>
  screen.getByRole("button", { name: `지원자${index} 지원자 상세 보기` });
const column = () => screen.getByLabelText("서류검토 지원자 스크롤 영역");

describe("virtualized candidate navigation", () => {
  it("limits 1000-row DOM, measures scroll range, and resets a deep scroll after filtering", async () => {
    const { rerender } = render(<CandidateBoard {...props} resetKey="all" />);
    expect(
      screen.getByRole("region", { name: "서류검토 1000명" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("listitem").length).toBeLessThan(12);
    expect(
      screen.queryByRole("button", { name: "지원자500 지원자 상세 보기" }),
    ).not.toBeInTheDocument();
    fireEvent.scroll(column(), { target: { scrollTop: 184 * 500 } });
    expect(detail(500)).toBeInTheDocument();
    fireEvent.scroll(column(), { target: { scrollTop: 184 * 999 - 300 } });
    expect(detail(998)).toBeInTheDocument();
    expect(detail(999).closest("li")).toHaveAttribute("aria-posinset", "1000");
    rerender(
      <CandidateBoard
        {...props}
        candidates={[candidates[500]]}
        resetKey="500"
      />,
    );
    await waitFor(() => expect(column().scrollTop).toBe(0));
    expect(detail(500)).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(1);
  });

  it("Tab reaches every card and Shift+Tab crosses an unmounted boundary", () => {
    render(<CandidateBoard {...props} />);
    act(() => column().focus());
    for (let index = 0; index < 1000; index++) {
      fireEvent.keyDown(document.activeElement!, { key: "Tab" });
      expect(document.activeElement).toHaveAttribute(
        "data-candidate-detail",
        candidates[index].id,
      );
      fireEvent.keyDown(document.activeElement!, { key: "Tab" });
      expect(document.activeElement).toHaveAttribute(
        "data-candidate-move",
        candidates[index].id,
      );
    }
    fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
    fireEvent.keyDown(document.activeElement!, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toHaveAttribute(
      "data-candidate-move",
      "0998",
    );
    expect(screen.getAllByRole("listitem").length).toBeLessThan(15);
  }, 30000);

  it("keeps the menu trigger mounted while its portalled menu has focus", async () => {
    render(<CandidateBoard {...props} />);
    await userEvent.click(
      screen.getByRole("button", { name: "지원자2 단계 변경" }),
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
    fireEvent.scroll(column(), { target: { scrollTop: 184 * 500 } });
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "지원자2 단계 변경" }),
    ).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "지원자2 단계 변경" }),
      ).toHaveFocus(),
    );
  });

  it("native reverse entry starts at the actual last card", async () => {
    render(
      <>
        <CandidateBoard {...props} />
        <button>다음 영역</button>
      </>,
    );
    screen.getByText("다음 영역").focus();
    await userEvent.tab({ shift: true });
    expect(document.activeElement).toHaveAttribute(
      "data-candidate-move",
      "0999",
    );
  });

  it("mounts the moved card at its offscreen destination and restores rollback focus without stealing search focus", async () => {
    const many = candidates.map((candidate) => ({
      ...candidate,
      stage: "interview" as const,
    }));
    const target = { ...candidates[500], stage: "review" as const };
    const initial = many.map((candidate) =>
      candidate.id === target.id ? target : candidate,
    );
    const { rerender } = render(
      <>
        <input aria-label="검색" />
        <CandidateBoard {...props} candidates={initial} />
      </>,
    );
    act(() => detail(500).focus());
    rerender(
      <>
        <input aria-label="검색" />
        <CandidateBoard {...props} candidates={many} />
      </>,
    );
    expect(
      within(screen.getByRole("region", { name: "면접 1000명" })).getByRole(
        "button",
        { name: "지원자500 지원자 상세 보기" },
      ),
    ).toHaveFocus();
    rerender(
      <>
        <input aria-label="검색" />
        <CandidateBoard {...props} candidates={initial} />
      </>,
    );
    expect(detail(500)).toHaveFocus();
    act(() => screen.getByRole("textbox").focus());
    rerender(
      <>
        <input aria-label="검색" />
        <CandidateBoard {...props} candidates={many} />
      </>,
    );
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("retains the current detail trigger after prior keyboard navigation and scrolling", async () => {
    render(
      <CandidateUIProvider>
        {/* Detail shares the real selection store. */}
        <DetailHarness />
      </CandidateUIProvider>,
    );
    act(() => column().focus());
    fireEvent.keyDown(column(), { key: "Tab" });
    await userEvent.click(detail(2));
    fireEvent.scroll(column(), { target: { scrollTop: 184 * 500 } });
    await userEvent.keyboard("{Escape}");
    await waitFor(() => expect(detail(2)).toHaveFocus());
  });
});

import { useCandidateUI } from "@/features/candidates/stores/ui-store";
function DetailHarness() {
  const select = useCandidateUI((state) => state.selectCandidate);
  const id = useCandidateUI((state) => state.selectedId);
  return (
    <>
      <CandidateBoard {...props} onOpenDetail={select} />
      <CandidateDetail
        candidate={candidates.find((candidate) => candidate.id === id) ?? null}
      />
    </>
  );
}

describe("undo in virtualized columns", () => {
  it("restores an offscreen undo target and hides mismatched history", async () => {
    const target = { ...candidates[500], stage: "interview" as const };
    const initial = candidates.map((candidate) =>
      candidate.id === target.id ? target : candidate,
    );
    const onUndo = vi.fn(() => true);
    const undoHistory = new Map([
      [
        target.id,
        { previousStage: "review" as const, savedStage: "interview" as const },
      ],
    ]);
    const { rerender } = render(
      <CandidateBoard
        {...props}
        candidates={initial}
        onUndo={onUndo}
        undoHistory={undoHistory}
      />,
    );
    await userEvent.click(
      screen.getByRole("button", { name: "지원자500 단계 변경" }),
    );
    await userEvent.keyboard("{End}{Enter}");
    expect(onUndo).toHaveBeenCalledWith(target.id);
    rerender(
      <CandidateBoard {...props} onUndo={onUndo} undoHistory={undoHistory} />,
    );
    expect(detail(500)).toHaveFocus();
    expect(screen.getAllByRole("listitem").length).toBeLessThan(15);
    await userEvent.click(
      screen.getByRole("button", { name: "지원자500 단계 변경" }),
    );
    expect(
      screen.queryByRole("menuitem", { name: /되돌리기/ }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
  });
});
