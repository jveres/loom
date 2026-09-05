// @vitest-environment happy-dom
import { state } from "loom";
import { bind, each, h, list, remove } from "loom/dom";
// @vitest-environment happy-dom
import { expect, it, onTestFinished, vi } from "vitest";
import type { Read } from "../loom.js";
import type { ListUpdate } from "./index.js";

type Row = {
  id: number;
  text: string;
};
type Kind = "list" | "each";
function mount(
  kind: Kind,
  rows: Read<readonly Row[]>,
  render: (row: Row) => Element,
  update?: ListUpdate<Row>,
) {
  const options = update ? { update } : {};
  const root =
    kind === "each"
      ? h(
          "div",
          null,
          each(rows, render, (row) => row.id, options),
        )
      : h("div");
  if (kind === "list")
    list(root, rows, { key: (row) => row.id, render, ...options });
  document.body.appendChild(root);
  onTestFinished(() => remove(root));
  return root;
}
it.each<Kind>(["list", "each"])(
  "%s updates immutable replacements while preserving DOM and focus",
  (kind) => {
    const first = { id: 1, text: "first" };
    const second = { id: 2, text: "second" };
    const rows = state<readonly Row[]>([first, second]);
    const render = vi.fn((row: Row) => h("input", { value: row.text }));
    const update = vi.fn((node: Element, row: Row) => {
      (node as HTMLInputElement).value = row.text;
    });
    const root = mount(kind, rows, render, update);
    const input = root.firstElementChild as HTMLInputElement;
    input.focus();
    const replacement = { id: 1, text: "updated" };
    rows([replacement, second]);
    expect(root.firstElementChild).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("updated");
    expect(render).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledExactlyOnceWith(input, replacement, first);
    rows([second, replacement]);
    expect(root.lastElementChild).toBe(input);
    expect(update).toHaveBeenCalledTimes(1);
  },
);
it.each<Kind>(["list", "each"])(
  "%s leaves replacement handling opt-in",
  (kind) => {
    const rows = state<readonly Row[]>([{ id: 1, text: "first" }]);
    const render = vi.fn((row: Row) => h("span", null, row.text));
    const root = mount(kind, rows, render);
    rows([{ id: 1, text: "replacement" }]);
    expect(root.textContent).toBe("first");
    expect(render).toHaveBeenCalledTimes(1);
  },
);
it.each<Kind>(["list", "each"])(
  "%s runs updates untracked and forgets removed items",
  (kind) => {
    const first = { id: 1, text: "first" };
    const replacement = { id: 1, text: "next" };
    const rows = state<readonly Row[]>([first]);
    const unrelated = state(0);
    let reads = 0;
    const update = vi.fn(() => {
      unrelated();
    });
    const render = vi.fn(() => h("span"));
    mount(
      kind,
      () => {
        reads++;
        return rows();
      },
      render,
      update,
    );
    rows([replacement]);
    unrelated(1);
    expect(reads).toBe(2);
    expect(update).toHaveBeenCalledTimes(1);
    rows([]);
    rows([replacement]);
    expect(render).toHaveBeenCalledTimes(2);
    expect(update).toHaveBeenCalledTimes(1);
  },
);
it.each<Kind>(["list", "each"])(
  "%s retains the previous baseline after an update throws and releases staged bindings",
  (kind) => {
    const first = { id: 1, text: "first" };
    const replacement = { id: 1, text: "next" };
    const added = { id: 2, text: "added" };
    const rows = state<readonly Row[]>([first]);
    const tick = state(0);
    const created: Element[] = [];
    let fail = true;
    const update = vi.fn((node: Element, row: Row) => {
      if (fail) throw new Error("update failed");
      node.setAttribute("title", row.text);
    });
    const root = mount(
      kind,
      rows,
      (row) => {
        const node = h("span");
        bind(node, () => {
          node.textContent = `${row.id}:${tick()}`;
        });
        created.push(node);
        return node;
      },
      update,
    );
    const original = root.firstElementChild;
    expect(() => rows([added, replacement])).toThrow("update failed");
    tick(1);
    expect(root.children.length).toBe(1);
    expect(root.firstElementChild).toBe(original);
    expect(created.map((node) => node.textContent)).toEqual(["1:1", "2:0"]);
    fail = false;
    rows([added, replacement]);
    expect(root.children.length).toBe(2);
    expect(root.lastElementChild).toBe(original);
    expect(update).toHaveBeenLastCalledWith(original, replacement, first);
    expect(original?.getAttribute("title")).toBe("next");
  },
);
it.each<Kind>(["list", "each"])(
  "%s validates duplicate keys before calling updates",
  (kind) => {
    const rows = state<readonly Row[]>([{ id: 1, text: "first" }]);
    const update = vi.fn();
    mount(kind, rows, () => h("span"), update);
    expect(() =>
      rows([
        { id: 1, text: "a" },
        { id: 1, text: "b" },
      ]),
    ).toThrow("Duplicate Loom key");
    expect(update).not.toHaveBeenCalled();
  },
);
function checkUpdateTypes() {
  const rows = state<readonly Row[]>([]);
  each(
    rows,
    (row) => h("span", null, row.text),
    (row) => row.id,
    {
      update(node, item, previous) {
        node.textContent = item.text + previous.text;
        // @ts-expect-error item retains the inferred row type
        item.missing;
      },
    },
  );
  list(h("div"), rows, {
    key: (row) => row.id,
    render: (row) => h("span", null, row.text),
    update(node, item, previous) {
      node.textContent = item.text + previous.text;
      // @ts-expect-error previous retains the inferred row type
      previous.missing;
    },
  });
}
void checkUpdateTypes;
