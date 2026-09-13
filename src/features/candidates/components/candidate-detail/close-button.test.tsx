import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { CloseButton } from "./close-button";

function DetailSheet({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger>상세 열기</SheetTrigger>
      <SheetContent showCloseButton={false} aria-describedby={undefined}>
        <SheetTitle>지원자 상세</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}

describe("detail CloseButton", () => {
  it("closes the real sheet by keyboard with defaults and restores trigger focus", async () => {
    const user = userEvent.setup();
    render(
      <DetailSheet>
        <CloseButton />
      </DetailSheet>,
    );
    const trigger = screen.getByRole("button", { name: "상세 열기" });
    await user.click(trigger);
    const close = screen.getByRole("button", { name: "상세 닫기" });
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
      <DetailSheet>
        <CloseButton ref={ref} aria-label="프로필 닫기" className="top-8" />
      </DetailSheet>,
    );
    await userEvent.click(screen.getByRole("button", { name: "상세 열기" }));
    const close = screen.getByRole("button", { name: "프로필 닫기" });
    expect(ref.current).toBe(close);
    expect(close).toHaveClass("top-8");
    expect(close).not.toHaveClass("top-5");
    await userEvent.click(close);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
