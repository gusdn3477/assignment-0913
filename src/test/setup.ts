import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
afterEach(cleanup);

// JSDOM has no layout engine. Give actual virtualizers deterministic geometry;
// keep unrelated elements at their native zero sizes.
Object.defineProperty(HTMLElement.prototype, "offsetHeight", {
  configurable: true,
  get() {
    if (this.hasAttribute("data-candidate-column")) return 480;
    if (this.hasAttribute("data-index")) return 174;
    return 0;
  },
});
Object.defineProperty(HTMLElement.prototype, "offsetWidth", {
  configurable: true,
  get() {
    return this.hasAttribute("data-candidate-column") ? 240 : 0;
  },
});
HTMLElement.prototype.scrollTo = function (
  options: ScrollToOptions | number = {},
  y?: number,
) {
  this.scrollTop =
    typeof options === "number" ? (y ?? 0) : (options.top ?? this.scrollTop);
  queueMicrotask(() => this.dispatchEvent(new Event("scroll")));
};

// dnd-kit observes element geometry; JSDOM supplies no ResizeObserver.
globalThis.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
