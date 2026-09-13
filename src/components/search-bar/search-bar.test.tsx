import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./search-bar";

describe("SearchBar", () => {
  it("composes both icons with native change and clear handlers, preserving keyboard focus and forms", async () => {
    const submit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLInputElement>();
    const nativeChange = vi.fn();
    const clear = vi.fn();
    function Harness() {
      const [value, setValue] = useState("검색어");
      return (
        <form onSubmit={submit}>
          <SearchBar
            ref={ref}
            aria-label="사이트 검색"
            name="search"
            value={value}
            onChange={(event) => {
              nativeChange(event);
              setValue(event.currentTarget.value);
            }}
            onClear={() => {
              clear();
              setValue("");
            }}
          />
        </form>
      );
    }
    render(<Harness />);
    const input = screen.getByRole("searchbox", { name: "사이트 검색" });
    const wrapper = input.closest('[data-slot="input-wrapper"]');
    expect(
      wrapper?.querySelector('[data-slot="input-left"] svg'),
    ).toHaveAttribute("aria-hidden", "true");
    const button = screen.getByRole("button", { name: "검색어 지우기" });
    expect(button.closest('[data-slot="input-right"]')).not.toBeNull();
    expect(button).toHaveAttribute("type", "button");
    expect(button.textContent).toBe("");
    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    await userEvent.type(input, "이름");
    expect(input).toHaveValue("검색어이름");
    expect(nativeChange).toHaveBeenCalledTimes(2);
    expect(nativeChange.mock.calls[0][0].nativeEvent).toBeInstanceOf(
      InputEvent,
    );
    nativeChange.mockClear();
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(input).toHaveValue("");
    expect(clear).toHaveBeenCalledOnce();
    expect(nativeChange).not.toHaveBeenCalled();
    expect(input).toHaveFocus();
    expect(ref.current).toBe(input);
    expect(submit).not.toHaveBeenCalled();
    expect(button).not.toBeInTheDocument();
    await userEvent.type(input, "다시");
    await userEvent.tab();
    await userEvent.keyboard(" ");
    expect(clear).toHaveBeenCalledTimes(2);
    expect(input).toHaveFocus();
    await userEvent.type(input, "검색{Enter}");
    expect(submit).toHaveBeenCalledOnce();
    expect(new FormData(input.closest("form")!).get("search")).toBe("검색");
  });

  it("only renders close when onClear and a nonempty explicit value are supplied", () => {
    const { rerender } = render(<SearchBar value="검색" onChange={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(<SearchBar value="검색" onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.getByRole("button", { name: "검색어 지우기" })).toBeEnabled();
    rerender(<SearchBar value="" onChange={vi.fn()} onClear={vi.fn()} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(
      <SearchBar key="uncontrolled" defaultValue="검색" onClear={vi.fn()} />,
    );
    expect(screen.getByRole("searchbox")).toHaveValue("검색");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([{ disabled: true }, { readOnly: true }])(
    "disables clear for a non-editable input: %o",
    async (state) => {
      const onClear = vi.fn();
      const onChange = vi.fn();
      render(
        <SearchBar
          value="보존"
          onChange={onChange}
          onClear={onClear}
          {...state}
        />,
      );
      const input = screen.getByRole("searchbox");
      await userEvent.type(input, "추가");
      const button = screen.getByRole("button", { name: "검색어 지우기" });
      expect(button).toBeDisabled();
      await userEvent.click(button);
      expect(input).toHaveValue("보존");
      expect(onChange).not.toHaveBeenCalled();
      expect(onClear).not.toHaveBeenCalled();
    },
  );

  it("preserves uncontrolled native input, constraints and callback refs", async () => {
    const ref = vi.fn();
    const clear = vi.fn();
    const { rerender } = render(
      <SearchBar
        ref={ref}
        defaultValue="홍길동"
        onClear={clear}
        maxLength={4}
        required
        className="h-12"
        wrapperClassName="bg-white"
      />,
    );
    const input = screen.getByRole("searchbox");
    expect(ref).toHaveBeenCalledWith(input);
    expect(input).toBeRequired();
    expect(input).toHaveClass("h-12");
    const wrapper = input.closest('[data-slot="input-wrapper"]');
    expect(wrapper).toHaveClass("bg-white");
    expect(
      wrapper?.querySelector('[data-slot="input-left"] svg'),
    ).toHaveAttribute("aria-hidden", "true");
    await userEvent.type(input, "가나다");
    expect(input).toHaveValue("홍길동가");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    rerender(
      <SearchBar
        key="controlled"
        ref={ref}
        value="홍길동"
        onChange={vi.fn()}
        onClear={clear}
      />,
    );
    const controlledInput = screen.getByRole("searchbox");
    await userEvent.click(
      screen.getByRole("button", { name: "검색어 지우기" }),
    );
    expect(clear).toHaveBeenCalledOnce();
    expect(controlledInput).toHaveValue("홍길동");
    expect(controlledInput).toHaveFocus();
  });

  it("always provides the search icon without a clear action", () => {
    render(<SearchBar aria-label="검색" />);
    expect(
      screen
        .getByRole("searchbox")
        .closest('[data-slot="input-wrapper"]')
        ?.querySelector('[data-slot="input-left"] svg'),
    ).toHaveAttribute("aria-hidden", "true");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
