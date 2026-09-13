import { useState } from "react";
import { fireEvent, render, screen, within, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CandidateBoard } from "@/components/candidate/board/candidate-board";
import { STAGES, STAGE_LABELS } from "@/constants/candidate";
import { type Candidate } from "@/features/candidates/types/candidate";

const candidate: Candidate = {
  id: "a",
  name: "김하늘",
  job: "프론트엔드 개발자",
  stage: "review",
  appliedAt: "2026-09-12T10:00:00Z",
  email: "test@example.com",
  summary: "지원자 소개",
};
const props = {
  candidates: [candidate],
  loadingIds: new Set<string>(),
  onMove: vi.fn(),
  onOpenDetail: vi.fn(),
};

describe("CandidateBoard", () => {
  afterEach(() => {
    vi.useRealTimers();
  });
  it("keeps all five stages and their empty states visible", () => {
    render(<CandidateBoard {...props} />);
    for (const stage of STAGES)
      expect(
        screen.getByRole("heading", { name: STAGE_LABELS[stage] }),
      ).toBeInTheDocument();
    expect(screen.getAllByText("이 단계의 지원자가 없습니다")).toHaveLength(4);
    expect(
      screen.getByRole("region", { name: "서류검토 1명" }),
    ).toBeInTheDocument();
  });

  it("sorts by application date descending and id ascending without changing the input", () => {
    const candidates = [
      candidate,
      { ...candidate, id: "c", name: "이봄", appliedAt: "2026-09-13" },
      { ...candidate, id: "b", name: "박여름", appliedAt: "2026-09-13" },
    ];
    render(<CandidateBoard {...props} candidates={candidates} />);
    const buttons = screen.getAllByRole("button", { name: /상세 보기/ });
    expect(buttons.map((button) => button.dataset.candidateDetail)).toEqual([
      "b",
      "c",
      "a",
    ]);
    expect(candidates.map((item) => item.id)).toEqual(["a", "c", "b"]);
  });

  it("opens details with keyboard and exposes separate move buttons", async () => {
    const onOpenDetail = vi.fn();
    const user = userEvent.setup({ delay: null });
    render(<CandidateBoard {...props} onOpenDetail={onOpenDetail} />);
    screen.getByRole("button", { name: /상세 보기/ }).focus();
    await user.keyboard("{Enter}");
    expect(onOpenDetail).toHaveBeenCalledWith("a");
    await user.tab();
    expect(
      screen.getByRole("button", { name: "김하늘 단계 변경" }),
    ).toHaveFocus();
  });

  it("disables the current stage and moves via keyboard", async () => {
    const onMove = vi.fn();
    render(<CandidateBoard {...props} onMove={onMove} />);
    fireEvent.keyDown(
      screen.getByRole("button", { name: "김하늘 단계 변경" }),
      { key: "Enter" },
    );
    expect(screen.getByRole("menuitem", { name: /서류검토/ })).toHaveAttribute(
      "data-disabled",
    );
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "면접" }), {
      key: "Enter",
    });
    expect(onMove).toHaveBeenCalledWith("a", "interview");
  });

  it("blocks only the loading card's move control while keeping details available", () => {
    render(
      <CandidateBoard
        {...props}
        candidates={[candidate, { ...candidate, id: "b", name: "이봄" }]}
        loadingIds={new Set(["a"])}
      />,
    );
    expect(
      screen.getByRole("button", { name: "김하늘 단계 변경 (저장 중)" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "이봄 단계 변경" }),
    ).toBeEnabled();
    expect(
      screen.getByRole("button", { name: "김하늘 지원자 상세 보기" }),
    ).toBeEnabled();
  });

  it("restores focus to the moved card and again on rollback", () => {
    vi.useFakeTimers();
    function Harness() {
      const [candidates, setCandidates] = useState([candidate]);
      return (
        <>
          <CandidateBoard
            {...props}
            candidates={candidates}
            onMove={(id, stage) => setCandidates([{ ...candidate, id, stage }])}
          />
          <button onClick={() => setCandidates([candidate])}>rollback</button>
        </>
      );
    }
    render(<Harness />);
    fireEvent.keyDown(
      screen.getByRole("button", { name: "김하늘 단계 변경" }),
      { key: "Enter" },
    );
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "면접" }), {
      key: "Enter",
    });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    // Radix schedules close autofocus on a zero-delay timer after unmount.
    // Flush it explicitly so focus is checked after teardown, not just at commit.
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(screen.getByRole("button", { name: /상세 보기/ })).toHaveFocus();
    expect(
      within(screen.getByRole("region", { name: "면접 1명" })).getByRole(
        "button",
        { name: /상세 보기/ },
      ),
    ).toHaveFocus();
    fireEvent.click(screen.getByText("rollback"));
    act(() => {
      vi.runOnlyPendingTimers();
    });
    expect(
      within(screen.getByRole("region", { name: "서류검토 1명" })).getByRole(
        "button",
        { name: /상세 보기/ },
      ),
    ).toHaveFocus();
  });

  it("does not steal external focus on unrelated data changes", () => {
    const { rerender } = render(
      <>
        <input aria-label="검색" />
        <CandidateBoard {...props} />
      </>,
    );
    screen.getByRole("button", { name: /상세 보기/ }).focus();
    screen.getByRole("textbox").focus();
    rerender(
      <>
        <input aria-label="검색" />
        <CandidateBoard
          {...props}
          candidates={[{ ...candidate, stage: "interview" }]}
        />
      </>,
    );
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("virtualizes 250 candidates while preserving complete stage counts", () => {
    const candidates = Array.from({ length: 250 }, (_, index) => ({
      ...candidate,
      id: String(index),
      stage: STAGES[index % STAGES.length],
    }));
    render(<CandidateBoard {...props} candidates={candidates} />);
    expect(
      screen.getAllByRole("button", { name: /상세 보기/ }).length,
    ).toBeLessThan(50);
    for (const stage of STAGES)
      expect(
        screen.getByRole("region", { name: `${STAGE_LABELS[stage]} 50명` }),
      ).toBeInTheDocument();
  });
});
