// @vitest-environment happy-dom
import { state } from "loom";
import {
  bind,
  each,
  h,
  list,
  match,
  onUnmount,
  remove,
  resourceGroup,
  when,
} from "loom/dom";
// @vitest-environment happy-dom
import { expect, it, onTestFinished, vi } from "vitest";
import type { Read } from "../loom.js";

type Kind = "list" | "each";
function mount(
  kind: Kind,
  rows: Read<readonly number[]>,
  render: (id: number) => Element,
) {
  if (kind === "each") {
    const root = h(
      "div",
      null,
      each(rows, render, (id) => id),
    );
    const stop = () => remove(root);
    onTestFinished(stop);
    return { root, stop };
  }
  const root = h("div");
  const stop = list(root, rows, { key: (id) => id, render });
  onTestFinished(stop);
  return { root, stop };
}
it.each<Kind>(["list", "each"])(
  "%s validates all keys before rendering",
  (kind) => {
    const rendered: number[] = [];
    expect(() =>
      mount(
        kind,
        () => [1, 1],
        (id) => {
          rendered.push(id);
          return h("span");
        },
      ),
    ).toThrow("Duplicate Loom key");
    expect(rendered).toEqual([]);
  },
);
it.each<Kind>(["list", "each"])(
  "%s releases rows a failing renderer never returns",
  (kind) => {
    const tick = state(0);
    const created: Element[] = [];
    const cleaned: number[] = [];
    expect(() =>
      mount(
        kind,
        () => [1, 2],
        (id) => {
          const row = h("span");
          created.push(row);
          bind(row, () => {
            row.textContent = String(tick());
          });
          onUnmount(row, () => {
            cleaned.push(id);
          });
          if (id === 2) throw new Error("renderer failed");
          return row;
        },
      ),
    ).toThrow("renderer failed");
    tick(1);
    expect(created.map((row) => row.textContent)).toEqual(["0", "0"]);
    expect(cleaned.sort()).toEqual([1, 2]);
  },
);
it.each<Kind>(["list", "each"])(
  "%s preserves live rows after failed additions and can retry",
  (kind) => {
    const rows = state<readonly number[]>([1]);
    const tick = state(0);
    const created: Element[] = [];
    let fail = true;
    const { root } = mount(kind, rows, (id) => {
      const row = h("span");
      created.push(row);
      bind(row, () => {
        row.textContent = `${id}:${tick()}`;
      });
      if (id === 3 && fail) throw new Error("renderer failed");
      return row;
    });
    const first = root.firstElementChild;
    expect(() => rows([1, 2, 3])).toThrow("renderer failed");
    tick(1);
    expect(root.children.length).toBe(1);
    expect(root.firstElementChild).toBe(first);
    expect(created.map((row) => row.textContent)).toEqual([
      "1:1",
      "2:0",
      "3:0",
    ]);
    fail = false;
    rows([1, 2, 3]);
    expect([...root.children].map((row) => row.textContent)).toEqual([
      "1:1",
      "2:1",
      "3:1",
    ]);
  },
);
it.each<Kind>(["list", "each"])(
  "%s cleans up additions after insertion fails",
  (kind) => {
    const rows = state<readonly number[]>([1]);
    const tick = state(0);
    const created: Element[] = [];
    const { root } = mount(kind, rows, (id) => {
      const row = h("span");
      created.push(row);
      bind(row, () => {
        row.textContent = `${id}:${tick()}`;
      });
      return row;
    });
    const insert = vi.spyOn(root, "insertBefore").mockImplementationOnce(() => {
      throw new DOMException("insertion failed", "HierarchyRequestError");
    });
    expect(() => rows([1, 2])).toThrow("insertion failed");
    insert.mockRestore();
    tick(1);
    expect(created.map((row) => row.textContent)).toEqual(["1:1", "2:0"]);
    rows([1, 2]);
    expect([...root.children].map((row) => row.textContent)).toEqual([
      "1:1",
      "2:1",
    ]);
  },
);
it.each<Kind>(["list", "each"])(
  "%s completes stale-row removal despite cleanup failures",
  (kind) => {
    const rows = state<readonly number[]>([1, 2, 3]);
    const cleaned: number[] = [];
    const { root } = mount(kind, rows, (id) => {
      const row = h("span", null, String(id));
      onUnmount(row, () => {
        cleaned.push(id);
        if (id === 1) throw new Error("cleanup failed");
      });
      return row;
    });
    expect(() => rows([3])).toThrow("cleanup failed");
    expect([...root.children].map((row) => row.textContent)).toEqual(["3"]);
    expect(cleaned).toEqual([1, 2]);
    rows([1, 3]);
    expect([...root.children].map((row) => row.textContent)).toEqual([
      "1",
      "3",
    ]);
    // The new row's intentionally throwing cleanup is asserted explicitly.
    expect(() => rows([])).toThrow("cleanup failed");
  },
);
it("list stop attempts every cleanup and remains terminal after a failure", () => {
  const rows = state<readonly number[]>([1, 2]);
  const cleaned: number[] = [];
  const { root, stop } = mount("list", rows, (id) => {
    const row = h("span");
    onUnmount(row, () => {
      cleaned.push(id);
      if (id === 1) throw new Error("cleanup failed");
    });
    return row;
  });
  expect(stop).toThrow("cleanup failed");
  stop();
  rows([3]);
  expect(cleaned).toEqual([1, 2]);
  expect(root.children.length).toBe(0);
});
it("conditional branches preserve the old branch and release failed construction", () => {
  const selected = state("old");
  const tick = state(0);
  const abandoned: Element[] = [];
  let fail = true;
  const root = h(
    "div",
    null,
    match(selected, {
      old: () => h("span", null, () => `old:${tick()}`),
      next: () => {
        const node = h("span", null, () => `next:${tick()}`);
        abandoned.push(node);
        if (fail) throw new Error("branch failed");
        return node;
      },
    }),
  );
  onTestFinished(() => remove(root));
  expect(() => selected("next")).toThrow("branch failed");
  tick(1);
  expect(root.textContent).toBe("old:1");
  expect(abandoned[0]?.textContent).toBe("next:0");
  fail = false;
  selected("old");
  selected("next");
  expect(root.textContent).toBe("next:1");
});
it("conditional swaps finish removal and retain the new branch after cleanup fails", () => {
  const open = state(true);
  const cleaned: number[] = [];
  const root = h(
    "div",
    null,
    when(
      open,
      () =>
        [1, 2].map((id) => {
          const row = h("span", null, String(id));
          onUnmount(row, () => {
            cleaned.push(id);
            if (id === 1) throw new Error("cleanup failed");
          });
          return row;
        }),
      () => h("span", null, "closed"),
    ),
  );
  onTestFinished(() => remove(root));
  expect(() => open(false)).toThrow("cleanup failed");
  expect(cleaned).toEqual([1, 2]);
  expect(root.textContent).toBe("closed");
});
it("construction rollback composes with resource groups and nested slots", () => {
  const tick = state(0);
  const created: Element[] = [];
  const cleaned: string[] = [];
  expect(() =>
    resourceGroup(() =>
      mount(
        "list",
        () => [1],
        () => {
          const row = h(
            "div",
            null,
            when(
              () => true,
              () => {
                const nested = h("span", null, tick);
                created.push(nested);
                onUnmount(nested, () => {
                  cleaned.push("nested");
                });
                return nested;
              },
            ),
          );
          created.push(row);
          throw new Error("outer failed");
        },
      ),
    ),
  ).toThrow("outer failed");
  tick(1);
  expect(created.map((node) => node.textContent)).toEqual(["0", "0"]);
  expect(cleaned).toEqual(["nested"]);
});
it("allows a public resource group inside a list renderer", () => {
  const tick = state(0);
  const { root, stop } = mount(
    "list",
    () => [1],
    () => resourceGroup(() => h("span", null, tick)).value,
  );
  tick(1);
  expect(root.textContent).toBe("1");
  stop();
  tick(2);
  expect(root.children.length).toBe(0);
});
it("reports both construction and rollback errors after all resources stop", () => {
  const tick = state(0);
  const created: Element[] = [];
  const cleaned: number[] = [];
  const failure = new Error("render failed");
  const cleanupFailure = new Error("cleanup failed");
  let caught: unknown;
  try {
    mount(
      "list",
      () => [1, 2],
      (id) => {
        const row = h("span", null, tick);
        created.push(row);
        onUnmount(row, () => {
          cleaned.push(id);
          if (id === 2) throw cleanupFailure;
        });
        if (id === 2) throw failure;
        return row;
      },
    );
  } catch (error) {
    caught = error;
  }
  tick(1);
  expect(caught).toBeInstanceOf(AggregateError);
  expect((caught as AggregateError).errors).toEqual([failure, cleanupFailure]);
  expect(cleaned.sort()).toEqual([1, 2]);
  expect(created.map((node) => node.textContent)).toEqual(["0", "0"]);
});
it("conditional insertion failure releases the staged branch and preserves the old one", () => {
  const open = state(false);
  const tick = state(0);
  let staged: Element | undefined;
  const root = h(
    "div",
    null,
    when(
      open,
      () => {
        staged = h("span", null, tick);
        return staged;
      },
      () => h("span", null, "old"),
    ),
  );
  onTestFinished(() => remove(root));
  const insert = vi.spyOn(root, "insertBefore").mockImplementationOnce(() => {
    throw new DOMException("insertion failed", "HierarchyRequestError");
  });
  expect(() => open(true)).toThrow("insertion failed");
  insert.mockRestore();
  tick(1);
  expect(root.textContent).toBe("old");
  expect(staged?.textContent).toBe("0");
  open(false);
  open(true);
  expect(root.textContent).toBe("1");
});
