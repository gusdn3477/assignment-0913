import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "@/components/ui/input";

describe("Input", () => {
  it("composes variable-width left and right content with clear without leaking slot props onto the native input", async () => {
    const onClear = vi.fn();
    const ref = createRef<HTMLInputElement>();
    render(
      <Input
        ref={ref}
        aria-label="검색"
        name="query"
        value="text"
        onChange={vi.fn()}
        left={<span>긴 검색 대상 설명</span>}
        right={<button type="button">검색 도움말 보기</button>}
        clearButton={{ onClear }}
        wrapperClassName="bg-white"
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("left");
    expect(input).not.toHaveAttribute("right");
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "query");
    expect(input.closest('[data-slot="input-wrapper"]')).toHaveClass(
      "bg-white",
    );
    expect(
      screen.getByText("긴 검색 대상 설명").closest('[data-slot="input-left"]'),
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole("button", { name: "검색 도움말 보기" })
        .closest('[data-slot="input-right"]'),
    ).toBe(
      screen
        .getByRole("button", { name: "입력 지우기" })
        .closest('[data-slot="input-right"]'),
    );
    await userEvent.click(input);
    await userEvent.tab();
    expect(
      screen.getByRole("button", { name: "검색 도움말 보기" }),
    ).toHaveFocus();
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(input).toHaveFocus();
  });

  it("keeps the external ref current when clear support changes", async () => {
    const ref = createRef<HTMLInputElement>();
    const onClear = vi.fn();
    const { rerender } = render(
      <Input ref={ref} value="text" onChange={vi.fn()} />,
    );
    expect(ref.current).toBe(screen.getByRole("textbox"));
    rerender(
      <Input
        ref={ref}
        value="text"
        onChange={vi.fn()}
        clearButton={{ onClear }}
      />,
    );
    expect(ref.current).toBe(screen.getByRole("textbox"));
    await userEvent.click(screen.getByRole("button"));
    expect(ref.current).toHaveFocus();
    rerender(<Input ref={ref} value="text" onChange={vi.fn()} />);
    expect(ref.current).toBe(screen.getByRole("textbox"));
  });

  it("forwards native props and the input ref without wrapping a plain input", async () => {
    const ref = createRef<HTMLInputElement>();
    const onChange = vi.fn();
    const { container } = render(
      <Input
        ref={ref}
        name="query"
        aria-label="검색"
        defaultValue=""
        maxLength={3}
        onChange={onChange}
        className="bg-white"
      />,
    );
    const input = screen.getByRole("textbox", { name: "검색" });
    await userEvent.type(input, "abcd");
    expect(input).toHaveValue("abc");
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "query");
    expect(input).toHaveClass("bg-white");
    expect(container.firstElementChild).toBe(input);
  });

  it("clears by keyboard once without submitting or synthesizing onChange, and restores input focus", async () => {
    const clear = vi.fn();
    const change = vi.fn();
    const submit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLInputElement>();
    function Controlled() {
      const [value, setValue] = useState("가");
      return (
        <form onSubmit={submit}>
          <Input
            ref={ref}
            type="search"
            aria-label="이름 검색"
            value={value}
            onChange={(event) => {
              change(event.target.value);
              setValue(event.target.value);
            }}
            clearButton={{
              label: "검색 지우기",
              onClear: () => {
                clear();
                setValue("");
              },
            }}
          />
        </form>
      );
    }
    render(<Controlled />);
    const user = userEvent.setup();
    const input = screen.getByRole("searchbox");
    await user.click(input);
    await user.type(input, "나");
    expect(change).toHaveBeenCalledExactlyOnceWith("가나");
    await user.tab();
    expect(screen.getByRole("button", { name: "검색 지우기" })).toHaveFocus();
    await user.keyboard("{Enter}");
    expect(clear).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);
    expect(submit).not.toHaveBeenCalled();
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(ref.current).toBe(input);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it.each([{ disabled: true }, { readOnly: true }, { value: "" }])(
    "hides clear when unavailable: %j",
    (props) => {
      render(
        <Input
          aria-label="검색"
          value="text"
          onChange={vi.fn()}
          clearButton={{ onClear: vi.fn() }}
          {...props}
        />,
      );
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    },
  );

  it("allows clearing zero without losing native number type", async () => {
    const onClear = vi.fn();
    render(
      <Input
        type="number"
        value={0}
        onChange={vi.fn()}
        clearButton={{ onClear }}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "입력 지우기" }));
    expect(onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("spinbutton")).toHaveFocus();
  });
});
