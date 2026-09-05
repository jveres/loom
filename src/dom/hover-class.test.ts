// @vitest-environment happy-dom

import { remove } from "loom/dom";
import { hoverClass } from "loom/events";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it } from "vitest";

const over = (target: Element, pointerType = "mouse"): void => {
  target.dispatchEvent(
    new PointerEvent("pointerover", {
      isPrimary: true,
      bubbles: true,
      pointerType,
    }),
  );
};
afterEach(() => {
  document.body.replaceChildren();
});
describe("hoverClass", () => {
  it("dresses the resolved target on pointerover, undresses on the host's own pointerleave; touch never dresses and clears a stale costume", () => {
    const host = document.createElement("ul");
    const a = document.createElement("li");
    const b = document.createElement("li");
    const inner = document.createElement("span");
    b.append(inner);
    host.append(a, b);
    document.body.append(host);
    const voice = hoverClass(host, {
      target: (event) => (event.target as Element).closest("li"),
    });
    over(a);
    expect(a.classList.contains("is-hover")).toBe(true);
    over(inner);
    expect(a.classList.contains("is-hover")).toBe(false);
    expect(b.classList.contains("is-hover")).toBe(true);
    expect(voice.current()).toEqual([b]);
    over(a, "touch");
    expect(b.classList.contains("is-hover")).toBe(false);
    expect(a.classList.contains("is-hover")).toBe(false);
    over(a);
    host.dispatchEvent(
      new PointerEvent("pointerleave", {
        isPrimary: true,
        pointerType: "mouse",
      }),
    );
    expect(a.classList.contains("is-hover")).toBe(false);
  });
  it("dresses a LIST of elements (an ancestor chain), honors `when`, and undresses on disposal", () => {
    const host = document.createElement("div");
    const mid = document.createElement("div");
    const leaf = document.createElement("i");
    mid.append(leaf);
    host.append(mid);
    document.body.append(host);
    let owns = true;
    hoverClass(host, {
      name: "is-hot",
      when: () => owns,
      target: (event) => {
        const chain: Element[] = [];
        for (
          let el = event.target as Element | null;
          el && el !== host;
          el = el.parentElement
        )
          chain.push(el);
        return chain;
      },
    });
    over(leaf, "pen");
    expect(leaf.classList.contains("is-hot")).toBe(true);
    expect(mid.classList.contains("is-hot")).toBe(true);
    owns = false;
    over(leaf, "mouse"); // gated: the costume stays as it was
    expect(leaf.classList.contains("is-hot")).toBe(true);
    remove(host);
    expect(leaf.classList.contains("is-hot")).toBe(false);
    expect(mid.classList.contains("is-hot")).toBe(false);
  });
  it("set() drives the costume from a host's own forwarding", () => {
    const host = document.createElement("div");
    const row = document.createElement("p");
    host.append(row);
    document.body.append(host);
    const voice = hoverClass(host);
    voice.set(row);
    expect(row.classList.contains("is-hover")).toBe(true);
    voice.set(null);
    expect(row.classList.contains("is-hover")).toBe(false);
  });
});
