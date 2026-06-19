// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { list } from "./dom.js";
import { state } from "./loom.js";

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
