import {
  setupDragGeometry,
  sensorDrag,
} from "@/features/candidates/components/candidate-board/dnd-test-helpers";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Providers } from "@/app/providers";
import Page from "@/app/page";
import { candidateApi } from "@/features/candidates/api/mock-api";
import { MockApiError } from "@/features/candidates/api/mock-api-error";
import { UI_STORAGE_KEY } from "@/features/candidates/constants/storage";
import {
  JOBS,
  STAGES,
  STAGE_LABELS,
} from "@/features/candidates/constants/candidate";
import { type Candidate } from "@/features/candidates/types/candidate";

vi.mock("@/features/candidates/api/mock-api", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@/features/candidates/api/mock-api")
  >()),
  candidateApi: { listCandidates: vi.fn(), updateCandidateStage: vi.fn() },
}));

const candidates: Candidate[] = [
  {
    id: "a",
    name: "김하늘",
    job: JOBS[0],
    stage: "review",
    appliedAt: "2026-09-12",
    email: "a@example.com",
    summary: "첫 번째 지원자",
  },
  {
    id: "b",
    name: "김여름",
    job: JOBS[1],
    stage: "interview",
    appliedAt: "2026-09-11",
    email: "b@example.com",
    summary: "두 번째 지원자",
  },
  {
    id: "c",
    name: "이봄",
    job: JOBS[0],
    stage: "offer",
    appliedAt: "2026-09-10",
    email: "c@example.com",
    summary: "세 번째 지원자",
  },
];

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const mount = () =>
  render(
    <Providers>
      <Page />
    </Providers>,
  );
const detail = (name: string) =>
  screen.queryByRole("button", { name: `${name} 지원자 상세 보기` });

beforeEach(() => {
  localStorage.clear();
  vi.resetAllMocks();
  vi.mocked(candidateApi.listCandidates).mockResolvedValue(candidates);
});
afterEach(() => vi.useRealTimers());

// Radix scrolls the keyboard-selected option; jsdom has no layout scrolling.
if (!HTMLElement.prototype.scrollIntoView)
  HTMLElement.prototype.scrollIntoView = () => {};

describe("CandidatesApp acceptance", () => {
  it("clears only the name filter by keyboard, keeps job and persists the change without refetching", async () => {
    localStorage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({ state: { search: "김", job: JOBS[0] }, version: 0 }),
    );
    mount();
    const user = userEvent.setup();
    const input = await screen.findByRole("searchbox");
    expect(input).toHaveValue("김");
    expect(detail("김하늘")).toBeInTheDocument();
    expect(detail("이봄")).not.toBeInTheDocument();
    await user.click(input);
    await user.tab();
    expect(screen.getByRole("button", { name: "검색어 지우기" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(
      screen.queryByRole("button", { name: "검색어 지우기" }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole("button", { name: "이봄 지원자 상세 보기" }),
    ).toBeInTheDocument();
    expect(detail("김여름")).not.toBeInTheDocument();
    expect(
      screen.getByRole("status", { name: "지원자 검색 결과" }),
    ).toHaveTextContent("전체 3명 중 2명");
    expect(
      screen.getByRole("combobox", { name: "직무 필터" }),
    ).toHaveTextContent(JOBS[0]);
    expect(JSON.parse(localStorage.getItem(UI_STORAGE_KEY)!)).toMatchObject({
      state: { search: "", job: JOBS[0] },
    });
    expect(candidateApi.listCandidates).toHaveBeenCalledTimes(1);
  });

  it("shows initial loading until the API resolves, then renders all five columns", async () => {
    const request = deferred<Candidate[]>();
    vi.mocked(candidateApi.listCandidates).mockReturnValue(request.promise);
    mount();
    expect(
      screen.getByRole("status", { name: "지원자를 불러오는 중" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("searchbox")).not.toBeInTheDocument();
    await act(async () => request.resolve(candidates));
    await screen.findByRole("searchbox");
    expect(
      screen.queryByRole("status", { name: "지원자를 불러오는 중" }),
    ).not.toBeInTheDocument();
    for (const stage of STAGES)
      expect(
        screen.getByRole("heading", { name: STAGE_LABELS[stage] }),
      ).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /지원자 상세 보기/ }),
    ).toHaveLength(3);
  });

  it("displays a query failure and allows an explicit retry to recover", async () => {
    const retry = deferred<Candidate[]>();
    vi.mocked(candidateApi.listCandidates)
      .mockRejectedValueOnce(new Error("목록 요청 실패"))
      .mockReturnValueOnce(retry.promise);
    mount();
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "지원자를 불러오지 못했어요",
    );
    expect(candidateApi.listCandidates).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("목록 요청 실패")).not.toBeInTheDocument();
    const retryButton = screen.getByRole("button", { name: "다시 불러오기" });
    await userEvent.click(retryButton);
    expect(retryButton).toBeDisabled();
    expect(retryButton).toHaveFocus();
    expect(screen.getByText("다시 불러오는 중…")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다시 불러오기" })).toBe(
      retryButton,
    );
    expect(
      screen.queryByRole("status", { name: "지원자를 불러오는 중" }),
    ).not.toBeInTheDocument();
    fireEvent.click(retryButton);
    expect(candidateApi.listCandidates).toHaveBeenCalledTimes(2);
    await act(async () => retry.resolve(candidates));
    expect(await screen.findByRole("searchbox")).toHaveFocus();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(candidateApi.listCandidates).toHaveBeenCalledTimes(2);
  });

  it("distinguishes an empty dataset from an empty filter result", async () => {
    vi.mocked(candidateApi.listCandidates).mockResolvedValue([]);
    mount();
    expect(
      await screen.findByText("아직 등록된 지원자가 없어요"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("검색 조건에 맞는 지원자가 없어요"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "검색 조건 초기화" }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText("이 단계의 지원자가 없습니다")).toHaveLength(5);
  });

  it("composes name and job filters and resets a filtered empty result", async () => {
    mount();
    const search = await screen.findByRole("searchbox");
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    fireEvent.change(search, { target: { value: "김" } });
    expect(detail("김하늘")).toBeInTheDocument();
    expect(detail("김여름")).toBeInTheDocument();
    expect(detail("이봄")).not.toBeInTheDocument();
    screen.getByRole("combobox").focus();
    fireEvent.keyDown(screen.getByRole("combobox"), { key: "Enter" });
    fireEvent.click(screen.getByRole("option", { name: JOBS[0] }));
    act(() => vi.runOnlyPendingTimers());
    expect(detail("김하늘")).toBeInTheDocument();
    expect(detail("김여름")).not.toBeInTheDocument();
    expect(screen.getByLabelText("지원자 검색 결과")).toHaveTextContent(
      "전체 3명 중 1명",
    );
    fireEvent.change(search, { target: { value: "없는 이름" } });
    expect(
      screen.getByText("검색 조건에 맞는 지원자가 없어요"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("아직 등록된 지원자가 없어요"),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "검색 조건 초기화" }));
    expect(search).toHaveValue("");
    expect(screen.getByRole("combobox")).toHaveTextContent("전체 직무");
    expect(
      screen.getAllByRole("button", { name: /지원자 상세 보기/ }),
    ).toHaveLength(3);
    expect(candidateApi.listCandidates).toHaveBeenCalledTimes(1);
  });

  it("shows an optimistic move, locks its save control, then rolls back and shows the failure toast", async () => {
    const save = deferred<Candidate>();
    vi.mocked(candidateApi.updateCandidateStage).mockReturnValue(save.promise);
    mount();
    const move = await screen.findByRole("button", {
      name: "김하늘 단계 변경",
    });
    vi.useFakeTimers({
      toFake: ["setTimeout", "clearTimeout", "setInterval", "clearInterval"],
    });
    fireEvent.keyDown(move, { key: "Enter" });
    fireEvent.keyDown(screen.getByRole("menuitem", { name: "면접" }), {
      key: "Enter",
    });
    await act(async () => vi.runOnlyPendingTimersAsync());
    const interview = screen.getByRole("region", { name: "면접 2명" });
    expect(
      within(interview).getByRole("button", {
        name: "김하늘 지원자 상세 보기",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "김하늘 단계 변경 (저장 중)" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "김여름 단계 변경" }),
    ).toBeEnabled();
    expect(candidateApi.updateCandidateStage).toHaveBeenCalledExactlyOnceWith({
      id: "a",
      stage: "interview",
    });
    await act(async () => {
      save.reject(new Error("저장 실패"));
      await vi.runOnlyPendingTimersAsync();
    });
    const review = screen.getByRole("region", { name: "서류검토 1명" });
    expect(
      within(review).getByRole("button", { name: "김하늘 지원자 상세 보기" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "면접 1명" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "김하늘 단계 변경" }),
    ).toBeEnabled();
    expect(
      screen.getByText("단계 이동을 저장하지 못했습니다. 다시 시도해 주세요."),
    ).toBeInTheDocument();
  });

  it("keeps a failed retry recoverable without exposing internal errors", async () => {
    const retry = deferred<Candidate[]>();
    vi.mocked(candidateApi.listCandidates)
      .mockRejectedValueOnce(new Error("internal first failure"))
      .mockReturnValueOnce(retry.promise)
      .mockResolvedValueOnce(candidates);
    mount();
    const button = await screen.findByRole("button", { name: "다시 불러오기" });
    await userEvent.click(button);
    expect(button).toBeDisabled();
    await act(async () => retry.reject(new Error("internal retry failure")));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "지원자를 불러오지 못했어요",
    );
    expect(screen.queryByText(/internal/)).not.toBeInTheDocument();
    expect(button).toBeEnabled();
    expect(button).toHaveFocus();
    await userEvent.click(button);
    expect(await screen.findByRole("searchbox")).toHaveFocus();
  });

  it.each([
    ["storage", "사이트의 저장소 사용 설정을 확인"],
    ["corrupt-storage", "브라우저 저장 데이터를 확인"],
  ] as const)(
    "offers relevant recovery for %s errors",
    async (code, message) => {
      vi.mocked(candidateApi.listCandidates).mockRejectedValue(
        new MockApiError(code, "internal details"),
      );
      mount();
      expect(await screen.findByRole("alert")).toHaveTextContent(message);
      expect(screen.queryByText("internal details")).not.toBeInTheDocument();
    },
  );

  it("retains searchable data through refresh failure and retry, then updates it", async () => {
    const refresh = deferred<Candidate[]>();
    const retry = deferred<Candidate[]>();
    vi.mocked(candidateApi.listCandidates)
      .mockResolvedValueOnce(candidates)
      .mockReturnValueOnce(refresh.promise)
      .mockReturnValueOnce(retry.promise);
    mount();
    const search = await screen.findByRole("searchbox");
    const board = screen.getByRole("region", { name: "지원자 채용 단계 보드" });
    const refreshButton = screen.getByRole("button", { name: "새로고침" });
    await userEvent.click(refreshButton);
    expect(refreshButton).toBeDisabled();
    expect(
      screen.getByText("최신 지원자 정보를 불러오는 중…"),
    ).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "지원자 채용 단계 보드" })).toBe(
      board,
    );
    await userEvent.type(search, "김");
    expect(search).toHaveValue("김");
    expect(detail("김하늘")).toBeInTheDocument();
    expect(detail("이봄")).not.toBeInTheDocument();
    await act(async () => refresh.reject(new Error("secret refresh failure")));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "현재 표시된 지원자 정보는 유지됩니다",
    );
    expect(
      screen.queryByText("secret refresh failure"),
    ).not.toBeInTheDocument();
    expect(search).toHaveFocus();
    expect(detail("김여름")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "다시 불러오기" }),
    );
    expect(screen.getByRole("region", { name: "지원자 채용 단계 보드" })).toBe(
      board,
    );
    expect(detail("김여름")).toBeInTheDocument();
    await act(async () => retry.resolve([candidates[0]]));
    expect(await screen.findByLabelText("지원자 검색 결과")).toHaveTextContent(
      "전체 1명 중 1명",
    );
    expect(detail("김여름")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("settles rapid search edits on matching cards, counts, and empty states without refetching", async () => {
    mount();
    const search = await screen.findByRole("searchbox");
    await userEvent.type(search, "없는 이름");
    expect(search).toHaveValue("없는 이름");
    expect(
      screen.getByText("검색 조건에 맞는 지원자가 없어요"),
    ).toBeInTheDocument();
    await userEvent.clear(search);
    await userEvent.type(search, "김하늘");
    expect(search).toHaveValue("김하늘");
    expect(search).toHaveFocus();
    expect(screen.getByLabelText("지원자 검색 결과")).toHaveTextContent(
      "전체 3명 중 1명",
    );
    expect(screen.getByLabelText("지원자 검색 결과")).toHaveAttribute(
      "aria-live",
      "off",
    );
    expect(
      screen.queryByText("검색 조건에 맞는 지원자가 없어요"),
    ).not.toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /지원자 상세 보기/ }),
    ).toHaveLength(1);
    expect(detail("김하늘")).toBeInTheDocument();
    expect(candidateApi.listCandidates).toHaveBeenCalledTimes(1);
  });

  it("cancels an older refresh for a move and blocks new refreshes until that card settles", async () => {
    const refresh = deferred<Candidate[]>();
    const save = deferred<Candidate>();
    vi.mocked(candidateApi.listCandidates)
      .mockResolvedValueOnce(candidates)
      .mockReturnValueOnce(refresh.promise);
    vi.mocked(candidateApi.updateCandidateStage).mockReturnValue(save.promise);
    mount();
    await screen.findByRole("searchbox");
    await userEvent.click(screen.getByRole("button", { name: "새로고침" }));
    const signal = vi.mocked(candidateApi.listCandidates).mock.calls[1][0]
      ?.signal;
    await userEvent.click(
      screen.getByRole("button", { name: "김하늘 단계 변경" }),
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "면접" }));
    expect(
      await screen.findByRole("button", { name: "김하늘 단계 변경 (저장 중)" }),
    ).toBeDisabled();
    expect(signal?.aborted).toBe(true);
    const refreshButton = screen.getByRole("button", { name: "새로고침" });
    expect(refreshButton).toBeDisabled();
    fireEvent.click(refreshButton);
    expect(candidateApi.listCandidates).toHaveBeenCalledTimes(2);
    await act(async () => refresh.resolve(candidates));
    expect(
      within(screen.getByRole("region", { name: "면접 2명" })).getByRole(
        "button",
        { name: "김하늘 지원자 상세 보기" },
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "김여름 단계 변경" }),
    ).toBeEnabled();
    await act(async () =>
      save.resolve({ ...candidates[0], stage: "interview" }),
    );
    expect(
      await screen.findByRole("button", { name: "김하늘 단계 변경" }),
    ).toBeEnabled();
    expect(refreshButton).toBeEnabled();
  });
});

describe("saved stage undo menu", () => {
  it("supports keyboard undo, scoped pending, failure retry, successful consumption and focus", async () => {
    const user = userEvent.setup();
    const saved = { ...candidates[0], stage: "interview" as const };
    const failedUndo = deferred<Candidate>();
    const successfulUndo = deferred<Candidate>();
    vi.mocked(candidateApi.updateCandidateStage)
      .mockResolvedValueOnce(saved)
      .mockReturnValueOnce(failedUndo.promise)
      .mockReturnValueOnce(successfulUndo.promise);
    mount();
    const trigger = () =>
      screen.getByRole("button", { name: "김하늘 단계 변경" });
    await user.click(
      await screen.findByRole("button", { name: "김하늘 단계 변경" }),
    );
    expect(
      screen.queryByRole("menuitem", { name: /되돌리기/ }),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole("menuitem", { name: "면접" }));
    await screen.findByRole("region", { name: "면접 2명" });
    await screen.findByRole("button", { name: "김하늘 단계 변경" });
    act(() => trigger().focus());
    await user.keyboard("{Enter}{End}");
    expect(
      screen.getByRole("menuitem", { name: "서류검토 단계로 되돌리기" }),
    ).toHaveFocus();
    await user.keyboard("{Enter}");
    await screen.findByRole("region", { name: "서류검토 1명" });
    expect(
      screen.getByRole("button", { name: "김하늘 단계 변경 (저장 중)" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "김여름 단계 변경" }),
    ).toBeEnabled();
    expect(detail("김하늘")).toHaveFocus();
    await act(async () => failedUndo.reject(Error("private internal failure")));
    await screen.findByRole("button", { name: "김하늘 단계 변경" });
    expect(
      screen.getByRole("region", { name: "면접 2명" }),
    ).toBeInTheDocument();
    expect(detail("김하늘")).toHaveFocus();
    expect(
      await screen.findByText(
        "되돌리기를 저장하지 못했습니다. 다시 시도해 주세요.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("private internal failure"),
    ).not.toBeInTheDocument();
    await user.click(trigger());
    await user.click(
      screen.getByRole("menuitem", { name: "서류검토 단계로 되돌리기" }),
    );
    await act(async () => successfulUndo.resolve(candidates[0]));
    await screen.findByRole("button", { name: "김하늘 단계 변경" });
    expect(detail("김하늘")).toHaveFocus();
    expect(candidateApi.updateCandidateStage).toHaveBeenLastCalledWith({
      id: "a",
      stage: "review",
    });
    await user.click(trigger());
    expect(
      screen.queryByRole("menuitem", { name: /되돌리기/ }),
    ).not.toBeInTheDocument();
    await user.keyboard("{Escape}");
  });
});

describe("drag moves through the real mutation flow", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
  it("rolls back only a failed dragged card, keeps another save, and offers Undo after success", async () => {
    setupDragGeometry();
    const first = deferred<Candidate>();
    const second = deferred<Candidate>();
    vi.mocked(candidateApi.updateCandidateStage).mockImplementation(({ id }) =>
      id === "a" ? first.promise : second.promise,
    );
    mount();
    await screen.findByRole("searchbox");
    await sensorDrag("a", "offer");
    await screen.findByRole("button", { name: "김하늘 단계 변경 (저장 중)" });
    expect(detail("김하늘")).toHaveFocus();
    await sensorDrag("a", "hired");
    await sensorDrag("b", "hired");
    await screen.findByRole("button", { name: "김여름 단계 변경 (저장 중)" });
    expect(candidateApi.updateCandidateStage).toHaveBeenCalledTimes(2);
    await act(async () => first.reject(Error("private save error")));
    await screen.findByRole("button", { name: "김하늘 단계 변경" });
    expect(
      within(screen.getByRole("region", { name: "서류검토 1명" })).getByRole(
        "button",
        { name: "김하늘 지원자 상세 보기" },
      ),
    ).toBeInTheDocument();
    expect(detail("김여름")).toHaveFocus();
    await act(async () => second.resolve({ ...candidates[1], stage: "hired" }));
    await userEvent.click(
      await screen.findByRole("button", { name: "김여름 단계 변경" }),
    );
    expect(
      screen.getByRole("menuitem", { name: "면접 단계로 되돌리기" }),
    ).toBeInTheDocument();
    vi.mocked(candidateApi.updateCandidateStage).mockResolvedValueOnce(
      candidates[1],
    );
    await userEvent.click(
      screen.getByRole("menuitem", { name: "면접 단계로 되돌리기" }),
    );
    await screen.findByRole("region", { name: "면접 1명" });
    expect(candidateApi.updateCandidateStage).toHaveBeenLastCalledWith({
      id: "b",
      stage: "interview",
    });
  });
});
