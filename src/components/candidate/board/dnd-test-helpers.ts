import { act, fireEvent, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { STAGES } from "@/features/candidates/constants/candidate";

export const dragHandle = (id = "a") =>
  document.querySelector<HTMLElement>(`[data-candidate-drag="${id}"]`)!;
export const dropColumn = (stage: string) =>
  document.querySelector<HTMLElement>(`[data-drop-stage="${stage}"]`)!;

// Only layout APIs are supplied by this fixture. Real dnd-kit sensors, collision,
// feedback and provider event handlers run in every interaction.
export function setupDragGeometry() {
  // JSDOM's CSS parser predates @layer/nesting. Keep the library stylesheet,
  // omitting only its popover reset block (JSDOM has no popover rendering).
  const prepend = HTMLHeadElement.prototype.prepend;
  vi.spyOn(HTMLHeadElement.prototype, "prepend").mockImplementation(function (
    this: HTMLHeadElement,
    ...nodes: (Node | string)[]
  ) {
    for (const node of nodes) {
      if (
        node instanceof HTMLStyleElement &&
        node.textContent?.includes("@layer dnd-kit")
      )
        node.textContent = node.textContent.replace(
          /@layer dnd-kit \{.*?\} \} \}/,
          "",
        );
    }
    prepend.apply(this, nodes);
  });
  vi.spyOn(document.documentElement, "clientWidth", "get").mockReturnValue(
    1600,
  );
  vi.spyOn(document.documentElement, "clientHeight", "get").mockReturnValue(
    900,
  );
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
    function (this: HTMLElement) {
      const stage =
        this.closest<HTMLElement>("[data-drop-stage]")?.dataset.dropStage;
      const index = STAGES.findIndex((item) => item === stage);
      const translate = this.style
        .getPropertyValue("--dnd-translate")
        .match(/-?[\d.]+/g)
        ?.map(Number) ?? [0, 0];
      const x = Math.max(index, 0) * 300 + translate[0];
      return DOMRect.fromRect({
        x,
        y: translate[1] ?? 0,
        width: stage ? 240 : 1600,
        height: this.hasAttribute("data-candidate-card") ? 174 : 600,
      });
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener() {},
    removeEventListener() {},
  }));
  document.elementFromPoint = (x, y) =>
    y >= 0 && y < 600 ? dropColumn(STAGES[Math.floor(x / 300)]) : null;
  document.getAnimations = () => [];
  if (!Element.prototype.getAnimations)
    Element.prototype.getAnimations = () => [];
}
export async function startDrag(id = "a") {
  if (dragHandle(id).hasAttribute("disabled")) return false;
  // Accessibility attributes are installed by the library after registration.
  // A rendered button alone can precede the sensor's ready state.
  await waitFor(() => {
    const handle = dragHandle(id);
    const instructions = handle.getAttribute("aria-describedby");
    if (
      !instructions ||
      !document.getElementById(instructions) ||
      handle.getAttribute("aria-disabled") !== "false"
    )
      throw Error(`Drag handle ${id} is not registered`);
  });
  const handle = dragHandle(id);
  await act(async () => {
    fireEvent.keyDown(handle, { key: " ", code: "Space" });
  });
  await waitFor(() => {
    if (
      !document.querySelector(
        `[data-candidate-card="${id}"][data-dragging="true"]`,
      )
    )
      throw Error(`Drag ${id} not started`);
  });
  return true;
}
export async function moveDrag(stage: string) {
  const source = document.querySelector<HTMLElement>(
    '[data-candidate-card][data-dragging="true"]',
  );
  const from = STAGES.findIndex(
    (item) =>
      item ===
      source?.closest<HTMLElement>("[data-drop-stage]")?.dataset.dropStage,
  );
  const to = STAGES.findIndex((item) => item === stage);
  for (let i = 0; i < Math.abs(to - from) * 30; i++) {
    await act(async () => {
      fireEvent.keyDown(document, {
        key: to > from ? "ArrowRight" : "ArrowLeft",
        code: to > from ? "ArrowRight" : "ArrowLeft",
      });
    });
  }
  await waitFor(() => {
    if (!dropColumn(stage).hasAttribute("data-drop-active"))
      throw Error("Target not active");
  });
}
export async function endDrag(cancel = false) {
  await act(async () => {
    fireEvent.keyDown(document, {
      key: cancel ? "Escape" : " ",
      code: cancel ? "Escape" : "Space",
    });
  });
  await waitFor(() => {
    if (document.querySelector("[data-dnd-dragging], [data-dnd-dropping]"))
      throw Error("Drag feedback has not settled");
  });
}
export async function sensorDrag(id: string, stage: string) {
  if (!(await startDrag(id))) return;
  await moveDrag(stage);
  await endDrag();
}
