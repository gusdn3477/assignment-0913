import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ResetButton } from "./reset-button";
import { RetryButton } from "./retry-button";
import { ReloadButton } from "./reload-button";
import { CloseButton } from "./close-button";

describe("semantic buttons", () => {
  it.each([
    [ResetButton, "초기화"],
    [RetryButton, "다시 불러오기"],
    [ReloadButton, "새로고침"],
    [CloseButton, "닫기"],
  ] as const)("forwards native semantics for %s", async (Component, label) => {
    const ref = createRef<HTMLButtonElement>();
    const click = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    render(
      <form onSubmit={submit}>
        <Component ref={ref} onClick={click} title="action" />
      </form>,
    );
    const button = screen.getByRole("button", { name: label });
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(click).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("title", "action");
  });

  it.each([RetryButton, ReloadButton])(
    "keeps %s label and focus while pending and excludes repeated clicks",
    async (Component) => {
      const click = vi.fn();
      const { rerender } = render(
        <Component onClick={click}>새로고침</Component>,
      );
      const button = screen.getByRole("button", { name: "새로고침" });
      await userEvent.click(button);
      rerender(
        <Component onClick={click} pending>
          새로고침
        </Component>,
      );
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-busy", "true");
      expect(button).toHaveFocus();
      await userEvent.click(button);
      expect(click).toHaveBeenCalledTimes(1);
      rerender(
        <Component onClick={click} disabled>
          새로고침
        </Component>,
      );
      expect(button).toBeDisabled();
    },
  );
});
