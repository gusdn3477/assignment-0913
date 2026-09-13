import { createRef, useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "./search-bar";

describe("SearchBar", () => {
  it("composes Input slots and preserves controlled input, clear, native form and focus behavior", async () => {
    const submit = vi.fn((event) => event.preventDefault());
    const ref = createRef<HTMLInputElement>();
    function Harness() {
      const [value, setValue] = useState("");
      return (
        <form onSubmit={submit}>
          <SearchBar
            ref={ref}
            aria-label="사이트 검색"
            name="search"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            clearButton={{ onClear: () => setValue(""), label: "검색 지우기" }}
            right={<span>⌘ K</span>}
          />
        </form>
      );
    }
    render(<Harness />);
    const input = screen.getByRole("searchbox", { name: "사이트 검색" });
    expect(
      input
        .closest('[data-slot="input-wrapper"]')
        ?.querySelector('[data-slot="input-left"] svg'),
    ).toHaveAttribute("aria-hidden", "true");
    await userEvent.type(input, "이름");
    expect(input).toHaveValue("이름");
    await userEvent.tab();
    await userEvent.keyboard("{Enter}");
    expect(input).toHaveValue("");
    expect(input).toHaveFocus();
    expect(ref.current).toBe(input);
    expect(submit).not.toHaveBeenCalled();
    expect(screen.getByText("⌘ K")).toBeInTheDocument();
  });

  it("allows an explicit empty left slot", () => {
    render(<SearchBar left={null} aria-label="검색" />);
    expect(
      screen.getByRole("searchbox").closest('[data-slot="input-wrapper"]'),
    ).toBeNull();
  });
});
