import Link from "next/link";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Header } from "./header";

describe("Header", () => {
  it("preserves native header semantics and independently renders optional slots", () => {
    const ref = createRef<HTMLElement>();
    const { rerender } = render(
      <Header
        ref={ref}
        aria-label="워크스페이스"
        left={<Link href="/">홈</Link>}
        right={<button>계정</button>}
      />,
    );
    const header = screen.getByRole("banner", { name: "워크스페이스" });
    expect(ref.current).toBe(header);
    expect(screen.getByRole("link", { name: "홈" })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("button", { name: "계정" })).toBeInTheDocument();
    expect(header.querySelector('[data-slot="header-center"]')).toBeNull();
    rerender(
      <Header ref={ref} center={<nav aria-label="주 메뉴">채용</nav>} />,
    );
    expect(
      screen.getByRole("navigation", { name: "주 메뉴" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(ref.current).toBe(screen.getByRole("banner"));
  });
});
