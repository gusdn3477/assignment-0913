import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { CandidateErrorBoundary } from "@/components/candidate/error-boundary/candidate-error-boundary";

afterEach(() => vi.restoreAllMocks());

it("isolates render exceptions, hides internal details and recovers the region", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  let fail = true;
  function Content() {
    if (fail) throw new Error("internal storage secret");
    return <p>복구된 보드</p>;
  }
  const onRecover = vi.fn(() => {
    fail = false;
  });
  render(
    <>
      <h1>채용 워크스페이스</h1>
      <CandidateErrorBoundary label="지원자 보드" onRecover={onRecover}>
        <Content />
      </CandidateErrorBoundary>
      <CandidateErrorBoundary label="지원자 상세">
        <p>사용 가능한 상세</p>
      </CandidateErrorBoundary>
    </>,
  );
  expect(
    screen.getByRole("heading", { name: "채용 워크스페이스" }),
  ).toBeVisible();
  expect(screen.getByText("사용 가능한 상세")).toBeVisible();
  expect(screen.getByRole("alert")).toHaveTextContent(
    "지원자 보드 화면을 표시하지 못했어요",
  );
  expect(screen.queryByText(/internal storage secret/)).not.toBeInTheDocument();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "다시 시도" }));
  expect(onRecover).toHaveBeenCalledTimes(1);
  expect(screen.getByText("복구된 보드")).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("keeps the fallback for a persistent error and retries without a recovery callback", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  let fail = true;
  function Content() {
    if (fail) throw new Error("internal failure");
    return <p>복구된 목록</p>;
  }
  const user = userEvent.setup();
  render(
    <CandidateErrorBoundary label="지원자 보드">
      <Content />
    </CandidateErrorBoundary>,
  );

  await user.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(screen.getByRole("alert")).toHaveTextContent(
    "지원자 보드 화면을 표시하지 못했어요",
  );
  expect(screen.queryByText(/internal failure/)).not.toBeInTheDocument();

  fail = false;
  await user.click(screen.getByRole("button", { name: "다시 시도" }));
  expect(screen.getByText("복구된 목록")).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

it("remounts for a new candidate key without invoking recovery", () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  const onRecover = vi.fn();
  function Detail({ id }: { id: string }) {
    if (id === "broken") throw new Error("internal detail failure");
    return <p>{id} 상세</p>;
  }
  const { rerender } = render(
    <CandidateErrorBoundary
      key="broken"
      label="지원자 상세"
      onRecover={onRecover}
    >
      <Detail id="broken" />
    </CandidateErrorBoundary>,
  );
  expect(screen.getByRole("alert")).toBeVisible();

  rerender(
    <CandidateErrorBoundary
      key="next"
      label="지원자 상세"
      onRecover={onRecover}
    >
      <Detail id="next" />
    </CandidateErrorBoundary>,
  );
  expect(screen.getByText("next 상세")).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(onRecover).not.toHaveBeenCalled();
});
