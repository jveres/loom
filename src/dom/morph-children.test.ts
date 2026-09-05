// @vitest-environment happy-dom
import { morph, morphChildren } from "loom/dom";
import { describe, expect, it, vi } from "vitest";

function nodes(html: string): Node[] {
  const parent = document.createElement("div");
  parent.innerHTML = html;
  return Array.from(parent.childNodes);
}

const options = { skip: "[data-chrome]" };

describe("morphChildren", () => {
  it("retains live children without traversing their enhanced descendants", () => {
    const host = document.createElement("div");
    const live = morphChildren(host, nodes("<p>Selected text</p><p>Tail</p>"));
    const paragraph = live[0] as Element;
    paragraph.setAttribute("data-enhanced", "yes");
    const read = vi.spyOn(paragraph, "attributes", "get");
    const result = morphChildren(host, [
      paragraph,
      ...nodes("<p>Tail extended</p>"),
    ]);
    expect(result).toEqual(live);
    expect(paragraph.getAttribute("data-enhanced")).toBe("yes");
    expect(read).not.toHaveBeenCalled();
    expect(host.textContent).toBe("Selected textTail extended");
  });

  it("reserves retained identities before matching newly inserted peers", () => {
    const host = document.createElement("div");
    const [selected] = morphChildren(host, nodes("<p>Selected</p>"));
    if (!selected) throw new Error("Missing child");
    const result = morphChildren(host, [
      ...nodes("<p>Inserted before</p>"),
      selected,
    ]);
    expect(result[1]).toBe(selected);
    expect(selected.textContent).toBe("Selected");
    expect(host.innerHTML).toBe("<p>Inserted before</p><p>Selected</p>");
    expect(() => morphChildren(host, [selected, selected])).toThrow(
      "Duplicate retained morph child",
    );
  });

  it("reuses repeated declarative protected nodes without a custom key hook", () => {
    const host = document.createElement("div");
    const frame = (text: string) =>
      nodes(
        `<button data-chrome>Copy</button><p>${text}</p><span data-chrome>Menu</span>`,
      );
    morphChildren(host, frame("First"), options);
    const button = host.firstElementChild;
    button?.setAttribute("data-state", "copied");
    for (const text of ["Second", "Third", "Fourth"]) {
      morphChildren(host, frame(text), options);
      expect(host.querySelectorAll("[data-chrome]")).toHaveLength(2);
      expect(host.firstElementChild).toBe(button);
      expect(button?.getAttribute("data-state")).toBe("copied");
      expect(host.querySelector("p")?.textContent).toBe(text);
    }
  });

  it("positions new content before unmatched trailing controls and preserves them on removal", () => {
    const host = document.createElement("div");
    morphChildren(
      host,
      nodes("<p>First</p><button data-chrome>Copy</button>"),
      options,
    );
    const button = host.lastChild;
    morphChildren(host, nodes("<p>First</p><p>Second</p>"), options);
    expect(Array.from(host.children, (node) => node.tagName)).toEqual([
      "P",
      "P",
      "BUTTON",
    ]);
    morphChildren(host, [], options);
    expect(Array.from(host.childNodes)).toEqual([button]);
  });

  it.each([
    "<p>New</p><button data-chrome>Replacement</button>",
    "<button data-chrome>Replacement</button><p>New</p>",
  ])("positions managed content around an all-protected tree: %s", (html) => {
    const host = document.createElement("div");
    morphChildren(
      host,
      nodes("<button data-chrome>Original</button>"),
      options,
    );
    const button = host.firstChild;
    morphChildren(host, nodes(html), options);
    expect(Array.from(host.children, (node) => node.tagName)).toEqual(
      nodes(html).map((node) => node.nodeName),
    );
    expect(host.querySelector("button")).toBe(button);
    expect(button?.textContent).toBe("Original");
  });

  it("shares protected-node matching with whole-tree morphs", () => {
    const host = document.createElement("div");
    host.innerHTML =
      "<section><button data-chrome>Enhanced</button><p>Old</p></section>";
    const button = host.querySelector("button");
    const target = document.createElement("div");
    target.innerHTML =
      "<section><button data-chrome>Plain</button><p>New</p></section>";
    morph(host, target, options);
    expect(host.querySelectorAll("button")).toHaveLength(1);
    expect(host.querySelector("button")).toBe(button);
    expect(button?.textContent).toBe("Enhanced");
  });

  it("reorders retained child identities and preserves text and comments", () => {
    const host = document.createElement("div");
    const [first, second] = morphChildren(
      host,
      nodes("<p>First</p><p>Second</p>"),
    );
    if (!first || !second) throw new Error("Missing initial children");
    const result = morphChildren(host, [
      second,
      ...nodes("<!--between-->text"),
      first,
    ]);
    expect(Array.from(host.childNodes)).toEqual(result);
    expect(result[0]).toBe(second);
    expect(result.at(-1)).toBe(first);
    expect(host.innerHTML).toBe("<p>Second</p><!--between-->text<p>First</p>");
  });
});
