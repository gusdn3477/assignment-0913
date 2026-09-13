import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Providers } from "@/app/providers";
import { CandidatesApp } from "./candidates-app";
import { candidateApi } from "./mock-api";
import { JOBS, STAGES, STAGE_LABELS, type Candidate } from "./types";

vi.mock("./mock-api", () => ({
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
      <CandidatesApp />
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
      "목록 요청 실패",
    );
    expect(candidateApi.listCandidates).toHaveBeenCalledTimes(1);
    await userEvent.click(
      screen.getByRole("button", { name: "다시 불러오기" }),
    );
    expect(
      await screen.findByRole("status", { name: "지원자를 불러오는 중" }),
    ).toBeInTheDocument();
    await act(async () => retry.resolve(candidates));
    await screen.findByRole("searchbox");
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
    expect(screen.getByRole("status")).toHaveTextContent("전체 3명 중 1명");
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
});
