import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { CandidateErrorBoundary } from "@/features/candidates/components/candidate-error-boundary/candidate-error-boundary";

afterEach(() => vi.restoreAllMocks());

it("isolates render exceptions, hides internal details and recovers the region", async () => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  let fail = true;
  function Content() {
    if (fail) throw new Error("internal storage secret");
    return <p>복구된 보드</p>;
  }
  render(
    <>
      <h1>채용 워크스페이스</h1>
      <CandidateErrorBoundary
        label="지원자 보드"
        onRecover={() => {
          fail = false;
        }}
      >
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
  expect(screen.getByText("복구된 보드")).toBeVisible();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});
