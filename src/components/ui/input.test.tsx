import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Input } from "./input";

describe("Input primitive", () => {
  it("composes left and right slots without leaking their props or overriding keyboard actions", async () => {
    const click = vi.fn();
    render(
      <Input
        aria-label="검색"
        left={<span>긴 검색 대상 설명</span>}
        right={
          <button type="button" onClick={click}>
            검색 도움말 보기
          </button>
        }
      />,
    );
    const input = screen.getByRole("textbox");
    const wrapper = input.closest('[data-slot="input-wrapper"]');
    expect(
      wrapper?.querySelector('[data-slot="input-left"]'),
    ).toHaveTextContent("긴 검색 대상 설명");
    const button = screen.getByRole("button", { name: "검색 도움말 보기" });
    expect(button.closest('[data-slot="input-right"]')).not.toBeNull();
    expect(input).not.toHaveAttribute("left");
    expect(input).not.toHaveAttribute("right");
    await userEvent.click(input);
    await userEvent.tab();
    expect(button).toHaveFocus();
    await userEvent.keyboard("{Enter}");
    expect(click).toHaveBeenCalledOnce();
    expect(button).toHaveFocus();
  });

  it("forwards native props, change events and ref without wrapping a plain input", async () => {
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
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "abcd");
    expect(input).toHaveValue("abc");
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange.mock.calls[0][0].nativeEvent).toBeInstanceOf(InputEvent);
    expect(ref.current).toBe(input);
    expect(input).toHaveAttribute("name", "query");
    expect(input).toHaveClass("bg-white");
    expect(container.firstElementChild).toBe(input);
  });

  it("keeps refs current as slots appear and disappear", () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender, unmount } = render(
      <Input ref={ref} defaultValue="text" />,
    );
    expect(ref.current).toBe(screen.getByRole("textbox"));
    rerender(
      <Input
        ref={ref}
        defaultValue="text"
        left="이름"
        right="단위"
        wrapperClassName="bg-white"
      />,
    );
    expect(ref.current).toBe(screen.getByRole("textbox"));
    expect(ref.current?.closest('[data-slot="input-wrapper"]')).toHaveClass(
      "bg-white",
    );
    rerender(<Input ref={ref} defaultValue="text" />);
    expect(ref.current).toBe(screen.getByRole("textbox"));
    unmount();
    expect(ref.current).toBeNull();
  });

  it("supports controlled values and native form submission", async () => {
    const submit = vi.fn((event) => event.preventDefault());
    function Harness() {
      const [value, setValue] = useState("가");
      return (
        <form onSubmit={submit}>
          <Input
            name="name"
            value={value}
            onChange={(event) => setValue(event.currentTarget.value)}
            left="이름"
          />
        </form>
      );
    }
    render(<Harness />);
    const input = screen.getByRole("textbox");
    await userEvent.type(input, "나{Enter}");
    expect(input).toHaveValue("가나");
    expect(submit).toHaveBeenCalledOnce();
    expect(new FormData(input.closest("form")!).get("name")).toBe("가나");
  });

  it.each([{ disabled: true }, { readOnly: true }])(
    "preserves native editing restrictions: %o",
    async (state) => {
      const onChange = vi.fn();
      render(
        <Input
          defaultValue="보존"
          onChange={onChange}
          left="이름"
          {...state}
        />,
      );
      const input = screen.getByRole("textbox");
      await userEvent.type(input, "추가");
      expect(input).toHaveValue("보존");
      expect(onChange).not.toHaveBeenCalled();
    },
  );
});
