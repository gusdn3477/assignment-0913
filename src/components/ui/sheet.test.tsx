import { createRef, type ComponentProps } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./sheet";

function ExampleSheet(props: ComponentProps<typeof SheetContent>) {
  return (
    <Sheet>
      <SheetTrigger>상세 열기</SheetTrigger>
      <SheetContent aria-describedby={undefined} {...props}>
        <SheetTitle>지원자 상세</SheetTitle>
        <button>다른 동작</button>
      </SheetContent>
    </Sheet>
  );
}

describe("SheetContent close button", () => {
  it("closes by keyboard with defaults and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(<ExampleSheet />);
    const trigger = screen.getByRole("button", { name: "상세 열기" });
    await user.click(trigger);
    const close = screen.getByRole("button", { name: "닫기" });
    expect(close).toHaveFocus();
    expect(close).toHaveTextContent("");
    expect(close.querySelector("svg")).toBeInTheDocument();
    expect(close).toHaveClass("absolute", "top-5", "right-5");
    await user.keyboard("{Enter}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("forwards native refs and allows accessible name and style overrides", async () => {
    const ref = createRef<HTMLButtonElement>();
    render(
      <ExampleSheet
        closeButtonProps={{
          ref,
          "aria-label": "프로필 닫기",
          className: "top-8",
        }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "상세 열기" }));
    const close = screen.getByRole("button", { name: "프로필 닫기" });
    expect(ref.current).toBe(close);
    expect(close).toHaveClass("top-8");
    expect(close).not.toHaveClass("top-5");
    await userEvent.click(close);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("can hide the default close button while preserving Escape dismissal", async () => {
    const user = userEvent.setup();
    render(<ExampleSheet showCloseButton={false} />);
    const trigger = screen.getByRole("button", { name: "상세 열기" });
    await user.click(trigger);
    expect(
      screen.queryByRole("button", { name: "닫기" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "다른 동작" })).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
});
