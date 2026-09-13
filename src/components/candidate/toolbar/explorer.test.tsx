import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  CandidateUIProvider,
  useCandidateUI,
} from "@/features/candidates/stores/ui-store";
import { UI_STORAGE_KEY } from "@/features/candidates/constants/storage";
import { CandidateToolbar } from "@/components/candidate/toolbar/candidate-toolbar";
import { CandidateDetail } from "@/components/candidate/detail/candidate-detail";
import { filterCandidates } from "@/features/candidates/utils/selectors";
import { JOBS } from "@/features/candidates/constants/candidate";
import { type Candidate } from "@/features/candidates/types/candidate";

const candidate: Candidate = {
  id: "c1",
  name: "Alice 김",
  job: JOBS[0],
  appliedAt: "2026-09-12",
  stage: "interview",
  email: "alice@example.com",
  summary: "사용자 경험을 개선하는 개발자입니다.",
};
function Harness() {
  const selectedId = useCandidateUI((state) => state.selectedId);
  const selectCandidate = useCandidateUI((state) => state.selectCandidate);
  const hydrated = useCandidateUI((state) => state.hydrated);
  return (
    <>
      <span>{hydrated ? "복원 완료" : "복원 중"}</span>
      <CandidateToolbar jobs={[...JOBS]} total={250} filtered={3} />
      <button
        data-candidate-detail={candidate.id}
        onClick={() => selectCandidate(candidate.id)}
      >
        상세 보기
      </button>
      <CandidateDetail candidate={selectedId ? candidate : null} />
    </>
  );
}
const mount = () =>
  render(
    <CandidateUIProvider>
      <Harness />
    </CandidateUIProvider>,
  );
beforeEach(() => localStorage.clear());
if (!HTMLElement.prototype.scrollIntoView)
  HTMLElement.prototype.scrollIntoView = () => {};

describe("candidate filtering", () => {
  it("combines trimmed case-insensitive name and exact job without mutating source", () => {
    const other = { ...candidate, id: "c2", job: JOBS[1] };
    const source = [candidate, other];
    expect(filterCandidates(source, " ALIce ", JOBS[0])).toEqual([candidate]);
    expect(filterCandidates(source, "김", "all")).toHaveLength(2);
    expect(filterCandidates(source, "없는 이름", "all")).toEqual([]);
    expect(filterCandidates(source, "  ", "all")).toEqual(source);
    expect(source).toHaveLength(2);
  });
});

describe("UI persistence and toolbar", () => {
  it("restores valid filters at mount, excluding selected ID and hydrated flag", async () => {
    localStorage.setItem(
      UI_STORAGE_KEY,
      JSON.stringify({
        state: {
          search: "Alice",
          job: JOBS[0],
          selectedId: "c1",
          hydrated: true,
        },
        version: 0,
      }),
    );
    mount();
    await screen.findByText("복원 완료");
    expect(screen.getByRole("searchbox")).toHaveValue("Alice");
    expect(screen.getByRole("combobox")).toHaveTextContent(JOBS[0]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(UI_STORAGE_KEY)!).state).toEqual({
      search: "Alice",
      job: JOBS[0],
    });
  });
  it.each([
    "{invalid",
    JSON.stringify({
      state: { search: 3, job: "bogus", setSearch: "broken" },
      version: 0,
    }),
    JSON.stringify({ state: null, version: 0 }),
  ])("recovers invalid stored data: %s", async (stored) => {
    localStorage.setItem(UI_STORAGE_KEY, stored);
    mount();
    await screen.findByText("복원 완료");
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("combobox")).toHaveTextContent("전체 직무");
    await userEvent.type(screen.getByRole("searchbox"), "김");
    expect(screen.getByRole("searchbox")).toHaveValue("김");
  });
  it("persists typing, restores after remount and resets both filters", async () => {
    const user = userEvent.setup();
    const first = mount();
    await user.type(screen.getByRole("searchbox"), "Alice");
    first.unmount();
    mount();
    await waitFor(() =>
      expect(screen.getByRole("searchbox")).toHaveValue("Alice"),
    );
    await user.click(screen.getByRole("button", { name: "초기화" }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getByRole("button", { name: "초기화" })).toBeDisabled();
    expect(screen.getByRole("status")).toHaveTextContent("전체 250명 중 3명");
  });
  it("supports keyboard job selection and reset", async () => {
    const scroll = vi
      .spyOn(HTMLElement.prototype, "scrollIntoView")
      .mockImplementation(() => {});
    try {
      mount();
      const user = userEvent.setup();
      screen.getByRole("combobox").focus();
      await user.keyboard("{Enter}");
      await user.keyboard("{ArrowDown}{Enter}");
      expect(screen.getByRole("combobox")).toHaveTextContent(JOBS[0]);
      expect(JSON.parse(localStorage.getItem(UI_STORAGE_KEY)!).state.job).toBe(
        JOBS[0],
      );
      await user.click(screen.getByRole("button", { name: "초기화" }));
      expect(screen.getByRole("combobox")).toHaveTextContent("전체 직무");
    } finally {
      scroll.mockRestore();
    }
  });
  it("continues when localStorage reads and writes throw", async () => {
    const get = vi
      .spyOn(Storage.prototype, "getItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    const set = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("full");
      });
    try {
      mount();
      await screen.findByText("복원 완료");
      await userEvent.type(screen.getByRole("searchbox"), "김");
      expect(screen.getByRole("searchbox")).toHaveValue("김");
    } finally {
      get.mockRestore();
      set.mockRestore();
    }
  });
});

it("shows full candidate detail, traps keyboard focus and returns it on Escape", async () => {
  mount();
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "상세 보기" });
  trigger.focus();
  await user.keyboard("{Enter}");
  const dialog = screen.getByRole("dialog", { name: candidate.name });
  expect(dialog).toHaveTextContent(candidate.email);
  expect(dialog).toHaveTextContent(candidate.summary);
  expect(dialog).toHaveTextContent("2026. 09. 12");
  expect(dialog).toHaveTextContent("면접");
  await user.tab();
  expect(dialog).toContainElement(document.activeElement as HTMLElement);
  expect(
    JSON.parse(localStorage.getItem(UI_STORAGE_KEY)!).state,
  ).not.toHaveProperty("selectedId");
  await user.keyboard("{Escape}");
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(trigger).toHaveFocus();
});
