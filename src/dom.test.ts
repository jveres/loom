// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { h, list } from "./dom.js";
import { state } from "./loom.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const HTML_NS = "http://www.w3.org/1999/xhtml";

interface Row {
  readonly id: string;
}

function keys(root: Element): string[] {
  return [...root.children].map(
    (node) => node.getAttribute("data-loom-key") ?? "",
  );
}

function renderRow(row: Row): Element {
  const node = document.createElement("div");
  node.textContent = row.id;
  return node;
}

describe("loom DOM list", () => {
  it("reorders keyed nodes by default", () => {
    const root = document.createElement("section");
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stop = list(root, rows, {
      key: (row) => row.id,
      render: renderRow,
    });

    rows([{ id: "b" }, { id: "a" }]);

    expect(keys(root)).toEqual(["b", "a"]);
    stop();
  });

  it("can skip keyed node reordering for externally positioned layouts", () => {
    const root = document.createElement("section");
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stop = list(root, rows, {
      key: (row) => row.id,
      render: renderRow,
      reorder: () => false,
    });

    const firstA = root.children[0];
    const firstB = root.children[1];
    rows([{ id: "b" }, { id: "a" }]);

    expect(keys(root)).toEqual(["a", "b"]);
    expect(root.children[0]).toBe(firstA);
    expect(root.children[1]).toBe(firstB);

    rows([{ id: "b" }, { id: "a" }, { id: "c" }]);
    expect(keys(root)).toEqual(["a", "b", "c"]);

    rows([{ id: "b" }, { id: "c" }]);
    expect(keys(root)).toEqual(["b", "c"]);
    stop();
  });
});

describe("loom DOM SVG", () => {
  it("creates SVG elements in the SVG namespace", () => {
    const svg = h("svg", { viewBox: "0 0 10 10" }, [
      h("defs", null, h("linearGradient", { id: "g" })),
      h("circle", { cx: 5, cy: 5, r: 4 }),
    ]);

    expect(svg.namespaceURI).toBe(SVG_NS);
    expect(svg.getAttribute("viewBox")).toBe("0 0 10 10");
    const circle = svg.querySelector("circle");
    expect(circle?.namespaceURI).toBe(SVG_NS);
    expect(circle?.getAttribute("r")).toBe("4");
    expect(svg.querySelector("linearGradient")?.namespaceURI).toBe(SVG_NS);
  });

  it("keeps HTML elements in the HTML namespace", () => {
    const div = h("div", null, "hi");
    expect(div.namespaceURI).toBe(HTML_NS);
  });

  it("binds reactive SVG attributes", () => {
    const r = state(4);
    const circle = h("circle", { cx: 5, cy: 5, r: () => r() });
    expect(circle.getAttribute("r")).toBe("4");
    r(7);
    expect(circle.getAttribute("r")).toBe("7");
  });

  it("toggles reactive classes on SVG elements", () => {
    const on = state(false);
    const arc = h("circle", { class: { active: () => on() } });
    expect(arc.classList.contains("active")).toBe(false);
    on(true);
    expect(arc.classList.contains("active")).toBe(true);
  });
});
