// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Props } from "./loom.js";
import {
  attr,
  classed,
  computed,
  configure,
  createScheduler,
  depsOf,
  dispose,
  effect,
  effectsOf,
  flush,
  h,
  key,
  list,
  observe,
  patch,
  remove,
  render,
  scope,
  signal,
  state,
  text,
  untrack,
} from "./loom.js";

afterEach(() => {
  configure({ scheduler: "microtask", duplicateKeys: "throw" });
  document.body.replaceChildren();
});

describe("state + effect", () => {
  it("auto-tracks reads and batches writes", () => {
    const model = state({ count: 1 }, { label: "counter" });
    let seen = 0;
    let runs = 0;
    effect(() => {
      seen = model.count;
      runs++;
    });

    model.count = 2;
    model.count = 3;
    flush();

    expect(seen).toBe(3);
    expect(runs).toBe(2);
  });

  it("runs cleanup before rerun and on dispose", () => {
    const model = state({ count: 1 });
    const cleanups: string[] = [];
    const handle = effect((onCleanup) => {
      const count = model.count;
      onCleanup(() => cleanups.push(`cleanup ${count}`));
    });

    model.count = 2;
    flush();
    handle.dispose();

    expect(cleanups).toEqual(["cleanup 1", "cleanup 2"]);
  });

  it("supports explicit deps with an untracked body", () => {
    const trigger = signal({ label: "rows" });
    const model = state({ count: 1 });
    let runs = 0;
    let seen = 0;

    effect(() => {
      runs++;
      seen = model.count;
    }, [trigger]);

    model.count = 2;
    flush();
    expect(runs).toBe(1);
    expect(seen).toBe(1);

    trigger.bump();
    flush();
    expect(runs).toBe(2);
    expect(seen).toBe(2);
  });

  it("reports semantic dependencies", () => {
    const model = state({ profile: { age: 1 } }, { label: "user" });
    const handle = effect(() => void model.profile.age, { label: "age view" });

    const deps = depsOf(handle);

    expect(
      deps.some((dep) => dep.kind === "state" && dep.label === "user"),
    ).toBe(true);
    expect(
      deps.some(
        (dep) =>
          dep.kind === "state" &&
          dep.path.map(String).join(".") === "profile.age",
      ),
    ).toBe(true);
  });

  it("does not track reads inside untrack", () => {
    const model = state({ count: 1 });
    let seen = 0;
    let runs = 0;

    effect(() => {
      runs++;
      seen = untrack(() => model.count);
    });

    model.count = 2;
    flush();

    expect(seen).toBe(1);
    expect(runs).toBe(1);
  });

  it("returns empty dependency lists for disposed or invalid handles", () => {
    const model = state({ count: 1 });
    const handle = effect(() => void model.count);

    handle.dispose();

    expect(depsOf(handle)).toEqual([]);
    expect(
      depsOf({
        disposed: false,
        dispose() {},
      }),
    ).toEqual([]);
  });

  it("supports returned cleanups and idempotent disposal", () => {
    const model = state({ count: 1 });
    const cleanups: number[] = [];
    const handle = effect(() => {
      const count = model.count;
      return () => cleanups.push(count);
    });

    model.count = 2;
    flush();
    handle.dispose();
    handle.dispose();

    expect(cleanups).toEqual([1, 2]);
  });

  it("rejects invalid explicit dependencies", () => {
    expect(() =>
      effect(
        () => undefined,
        [
          {
            disposed: false,
            dispose() {},
          } as unknown as ReturnType<typeof signal>,
        ],
      ),
    ).toThrow("Invalid Loom effect dep.");
  });

  it("disposes a failed initial effect before rethrowing", () => {
    expect(() =>
      effect(() => {
        throw new Error("initial failure");
      }),
    ).toThrow("initial failure");
  });

  it("reports cleanup failures and keeps flushing", () => {
    configure({ scheduler: "manual" });
    const reportError = vi.fn<(error: unknown) => void>();
    const originalReportError = globalThis.reportError;
    Object.defineProperty(globalThis, "reportError", {
      configurable: true,
      value: reportError,
    });
    try {
      const model = state({ count: 1 });
      let seen = 0;
      effect(() => {
        seen = model.count;
        return () => {
          throw new Error("cleanup failure");
        };
      });

      model.count = 2;
      flush();

      expect(seen).toBe(2);
      expect(reportError).toHaveBeenCalledWith(expect.any(Error));
    } finally {
      Object.defineProperty(globalThis, "reportError", {
        configurable: true,
        value: originalReportError,
      });
    }
  });
});

describe("signals, computed values, and scopes", () => {
  it("uses signal as a manual invalidation source", () => {
    const tick = signal({ label: "tick" });
    let runs = 0;
    effect(() => {
      tick.read();
      runs++;
    });

    tick.bump();
    tick.bump();
    flush();

    expect(runs).toBe(2);
  });

  it("caches computed values and notifies downstream effects", () => {
    const model = state({ count: 2 });
    let computes = 0;
    const doubled = computed(() => {
      computes++;
      return model.count * 2;
    });
    let seen = 0;
    effect(() => {
      seen = doubled.value;
    });

    model.count = 3;
    flush();

    expect(seen).toBe(6);
    expect(computes).toBe(2);
  });

  it("does not notify downstream effects when computed output is unchanged", () => {
    const model = state({ count: 1 });
    const constant = computed(() => {
      void model.count;
      return "same";
    });
    let runs = 0;
    effect(() => {
      void constant.value;
      runs++;
    });

    model.count = 2;
    flush();

    expect(runs).toBe(1);
  });

  it("disposes effects created inside a scope", () => {
    const model = state({ count: 1 });
    const s = scope({ label: "panel" });
    let seen = 0;

    s.run(() => {
      effect(() => {
        seen = model.count;
      });
    });

    s.dispose();
    model.count = 5;
    flush();

    expect(seen).toBe(1);
  });

  it("exposes computed disposal state", () => {
    const model = state({ count: 1 });
    const doubled = computed(() => model.count * 2, { label: "double" });

    expect(doubled.disposed).toBe(false);
    expect(doubled.value).toBe(2);

    doubled.dispose();
    model.count = 2;
    flush();

    expect(doubled.disposed).toBe(true);
    expect(doubled.value).toBe(2);
  });

  it("immediately disposes handles added to an already disposed scope", () => {
    const model = state({ count: 1 });
    const s = scope();
    s.dispose();
    let seen = 0;

    s.run(() => {
      effect(() => {
        seen = model.count;
      });
    });

    model.count = 2;
    flush();
    s.dispose();

    expect(seen).toBe(0);
  });

  it("disposes nested scopes with their parent scope", () => {
    const model = state({ count: 1 });
    const parent = scope();
    let seen = 0;

    parent.run(() => {
      const child = scope();
      child.run(() => {
        effect(() => {
          seen = model.count;
        });
      });
    });

    parent.dispose();
    model.count = 2;
    flush();

    expect(seen).toBe(1);
  });
});

describe("observe", () => {
  it("observes mutations, dependencies, effects, flushes, and patches", () => {
    configure({ scheduler: "manual" });
    const events: string[] = [];
    const off = observe({
      mutation: (event) => events.push(`mutation:${String(event.key)}`),
      dependency: (event) => events.push(`dep:${event.dependency.kind}`),
      effect: (event) => events.push(`effect:${event.label ?? ""}`),
      flush: (event) => events.push(`flush:${event.batchSize}`),
      patch: (event) => events.push(`patch:${event.kind}`),
    });
    try {
      const model = state({ count: 1 }, { label: "counter" });
      effect(() => void model.count, { label: "view" });
      const box = h("div");
      list(box, [{ id: "a" }], {
        key: (row) => row.id,
        render: () => h("p"),
      });
      patch(h("section"), h("section", { title: "next" }));
      model.count = 2;
      flush();

      expect(events).toContain("mutation:count");
      expect(events).toContain("dep:state");
      expect(events).toContain("effect:view");
      expect(events.some((event) => event.startsWith("flush:"))).toBe(true);
      expect(events).toContain("patch:list");
      expect(events).toContain("patch:patch");
    } finally {
      off.dispose();
      configure({ scheduler: "microtask" });
    }
  });

  it("stops observing after disposal and treats disposal as idempotent", () => {
    const events: string[] = [];
    const off = observe({
      mutation: (event) => events.push(String(event.key)),
    });
    const model = state({ count: 1 });

    off.dispose();
    off.dispose();
    model.count = 2;

    expect(events).toEqual([]);
  });

  it("disposes observers owned by a scope", () => {
    const events: string[] = [];
    const s = scope();
    const model = state({ count: 1 });

    s.run(() => {
      observe({
        mutation: (event) => events.push(String(event.key)),
      });
    });
    s.dispose();
    model.count = 2;

    expect(events).toEqual([]);
  });
});

describe("scheduler", () => {
  it("runs effects through a scoped custom scheduler", () => {
    const scheduler = createScheduler();
    scheduler.configure({ mode: "manual" });
    scheduler.configure({});
    const model = state({ count: 1 });
    let seen = 0;

    scheduler.run(() => {
      effect(() => {
        seen = model.count;
      });
    });

    model.count = 2;
    flush();
    expect(seen).toBe(1);

    scheduler.flush();
    expect(seen).toBe(2);
  });

  it("supports custom scheduler options passed directly to effects", () => {
    const scheduler = createScheduler({ mode: "manual" });
    const model = state({ count: 1 });
    let seen = 0;

    effect(
      () => {
        seen = model.count;
      },
      { scheduler },
    );

    model.count = 2;
    flush();
    expect(seen).toBe(1);

    scheduler.flush();
    expect(seen).toBe(2);
  });

  it("flushes microtask scheduled effects automatically", async () => {
    const model = state({ count: 1 });
    let seen = 0;
    effect(() => {
      seen = model.count;
    });

    model.count = 2;
    await Promise.resolve();

    expect(seen).toBe(2);
  });

  it("reports effect failures during flush", () => {
    configure({ scheduler: "manual" });
    const reportError = vi.fn<(error: unknown) => void>();
    const originalReportError = globalThis.reportError;
    Object.defineProperty(globalThis, "reportError", {
      configurable: true,
      value: reportError,
    });
    try {
      const model = state({ count: 1 });
      effect(() => {
        if (model.count > 1) throw new Error("flush failure");
      });

      model.count = 2;
      flush();

      expect(reportError).toHaveBeenCalledWith(expect.any(Error));
    } finally {
      Object.defineProperty(globalThis, "reportError", {
        configurable: true,
        value: originalReportError,
      });
    }
  });

  it("falls back to console.error when reportError is unavailable", () => {
    configure({ scheduler: "manual" });
    const originalReportError = globalThis.reportError;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    Object.defineProperty(globalThis, "reportError", {
      configurable: true,
      value: undefined,
    });
    try {
      const model = state({ count: 1 });
      effect(() => {
        if (model.count > 1) throw new Error("console failure");
      });

      model.count = 2;
      flush();

      expect(consoleError).toHaveBeenCalledWith(expect.any(Error));
    } finally {
      Object.defineProperty(globalThis, "reportError", {
        configurable: true,
        value: originalReportError,
      });
    }
  });

  it("reports runaway flush loops", () => {
    configure({ scheduler: "manual" });
    const reportError = vi.fn<(error: unknown) => void>();
    const originalReportError = globalThis.reportError;
    Object.defineProperty(globalThis, "reportError", {
      configurable: true,
      value: reportError,
    });
    try {
      let active = false;
      const triggers = Array.from({ length: 103 }, () => signal());
      const handles = triggers.slice(0, -1).map((trigger, index) =>
        effect(() => {
          if (active) triggers[index + 1]?.bump();
        }, [trigger]),
      );

      active = true;
      triggers[0]?.bump();
      flush();
      for (const handle of handles) handle.dispose();

      expect(reportError).toHaveBeenCalledWith(expect.any(Error));
    } finally {
      Object.defineProperty(globalThis, "reportError", {
        configurable: true,
        value: originalReportError,
      });
    }
  });

  it("uses Date.now when performance is unavailable", () => {
    configure({ scheduler: "manual" });
    const originalPerformance = globalThis.performance;
    Object.defineProperty(globalThis, "performance", {
      configurable: true,
      value: undefined,
    });
    try {
      const model = state({ count: 1 });
      let seen = 0;
      let flushes = 0;
      const off = observe({
        flush: () => {
          flushes++;
        },
      });
      try {
        effect(() => {
          seen = model.count;
        });

        model.count = 2;
        flush();

        expect(seen).toBe(2);
        expect(flushes).toBe(1);
      } finally {
        off.dispose();
      }
    } finally {
      Object.defineProperty(globalThis, "performance", {
        configurable: true,
        value: originalPerformance,
      });
    }
  });
});

describe("state objects and arrays", () => {
  it("keeps function values callable and ignores symbol reads", () => {
    const model = state({
      fn() {
        return 42;
      },
    });

    expect(model.fn()).toBe(42);
    expect(Reflect.get(model, Symbol.toStringTag)).toBeUndefined();
  });

  it("does not emit or rerun for identical writes", () => {
    const model = state({ count: 1 });
    const mutations: string[] = [];
    const off = observe({
      mutation: (event) => mutations.push(String(event.key)),
    });
    let runs = 0;
    effect(() => {
      void model.count;
      runs++;
    });

    model.count = 1;
    flush();

    expect(runs).toBe(1);
    expect(mutations).toEqual([]);
    off.dispose();
  });

  it("reports failed reflective writes and deletes", () => {
    const target = {};
    Object.defineProperty(target, "locked", {
      configurable: false,
      value: 1,
      writable: false,
    });
    const model = state(target as { locked: number });

    expect(Reflect.set(model, "locked", 2)).toBe(false);
    expect(Reflect.deleteProperty(model, "locked")).toBe(false);
  });

  it("updates object child proxies after replacement", () => {
    const model = state({ child: { value: 1 } });
    const first = model.child;

    model.child = { value: 2 };

    expect(model.child).not.toBe(first);
    expect(model.child.value).toBe(2);
  });

  it("tracks deletes and clears subscribed slots", () => {
    const model = state<{ value?: number }>({ value: 1 });
    const mutations: string[] = [];
    const off = observe({
      mutation: (event) => mutations.push(`${event.kind}:${String(event.key)}`),
    });
    let seen: number | undefined;
    effect(() => {
      seen = model.value;
    });

    delete model.value;
    flush();

    expect(seen).toBeUndefined();
    expect(mutations).toEqual(["delete:value"]);
    off.dispose();
  });

  it("wraps array mutators, caches wrappers, and emits array mutations", () => {
    const rows = state([1, 2]);
    const mutations: string[] = [];
    const off = observe({
      mutation: (event) => mutations.push(`${event.kind}:${String(event.key)}`),
    });
    const push = rows.push;

    expect(rows.push).toBe(push);

    rows.push(3);

    expect(rows).toEqual([1, 2, 3]);
    expect(mutations).toEqual(["array:push"]);
    off.dispose();
  });

  it("coalesces nested array mutator notifications", () => {
    const rows = state([2, 1]);
    const mutations: string[] = [];
    const off = observe({
      mutation: (event) => mutations.push(`${event.kind}:${String(event.key)}`),
    });
    let reversed = false;

    rows.sort((a, b) => {
      if (!reversed) {
        reversed = true;
        rows.reverse();
      }
      return a - b;
    });

    expect(mutations).toEqual(["array:sort"]);
    off.dispose();
  });

  it("tracks array length growth, sparse index writes, and truncation", () => {
    const rows = state([1, 2, 3]);
    let length = 0;
    let third: number | undefined = 0;
    let blank: unknown;
    effect(() => {
      length = rows.length;
      third = rows[2];
      blank = Reflect.get(rows, "");
    });

    rows.length = 4;
    flush();
    expect(length).toBe(4);
    expect(third).toBe(3);

    rows[4] = 5;
    flush();
    expect(length).toBe(5);

    rows.length = 1;
    flush();
    expect(length).toBe(1);
    expect(third).toBeUndefined();
    expect(blank).toBeUndefined();
  });
});

describe("DOM bindings and structure", () => {
  it("builds elements and binds text, classes, and attributes", () => {
    const model = state({ count: 1, on: false, label: "one" });
    const button = h(
      "button",
      {
        class: ["btn", classed("active", () => model.on)],
        "aria-label": () => model.label,
        title: attr("data-title", () => model.label),
      },
      text(() => model.count),
    );

    model.count = 2;
    model.on = true;
    model.label = "two";
    flush();

    expect(button.textContent).toBe("2");
    expect(button.classList.contains("active")).toBe(true);
    expect(button.getAttribute("aria-label")).toBe("two");
    expect(button.getAttribute("data-title")).toBe("two");
  });

  it("exposes node-owned effects", () => {
    const model = state({ label: "a" });
    const node = text(() => model.label);

    expect(effectsOf(node).length).toBe(1);
  });

  it("patches structure while preserving keyed live text", () => {
    const model = state({ count: 1, title: "old" });
    const build = () =>
      h("article", null, [
        h("h1", null, model.title),
        key(
          text(() => model.count),
          "count",
        ),
      ]);
    const live = build();
    const liveCount = live.querySelector('[data-loom-key="count"]');

    model.title = "new";
    model.count = 2;
    patch(live, build);
    flush();

    expect(live.querySelector("h1")?.textContent).toBe("new");
    expect(live.querySelector('[data-loom-key="count"]')).toBe(liveCount);
    expect(liveCount?.textContent).toBe("2");
  });

  it("updates event handlers during patch", () => {
    const calls: string[] = [];
    const live = h("button", { onclick: () => calls.push("old") }, "x");

    patch(live, h("button", { onclick: () => calls.push("new") }, "x"));
    live.dispatchEvent(new MouseEvent("click"));

    expect(calls).toEqual(["new"]);
  });

  it("renders a single-root container", () => {
    const model = state({ label: "a" });
    const root = h("main");
    const first = render(root, () =>
      h(
        "p",
        null,
        text(() => model.label),
      ),
    );

    model.label = "b";
    flush();
    render(root, () =>
      h(
        "p",
        { class: "next" },
        text(() => model.label),
      ),
    );

    expect(root.firstElementChild).toBe(first);
    expect(root.children.length).toBe(1);
    expect(root.firstElementChild?.className).toBe("next");
    expect(root.textContent).toBe("b");
  });

  it("reconciles keyed lists and disposes removed bindings", () => {
    const rows = [
      state({ id: "a", label: "A" }),
      state({ id: "b", label: "B" }),
    ];
    const box = h("div");
    const renderRow = (row: { id: string; label: string }) =>
      h(
        "p",
        null,
        text(() => row.label),
      );

    list(box, rows, { key: (row) => row.id, render: renderRow });
    const first = box.firstElementChild;
    list(box, rows.slice().reverse(), {
      key: (row) => row.id,
      render: renderRow,
    });

    expect(box.children[1]).toBe(first);
    expect([...box.children].map((node) => node.textContent).join(",")).toBe(
      "B,A",
    );

    const removed = box.children[1] as Element;
    remove(removed);
    const firstRow = rows[0];
    if (!firstRow) throw new Error("missing row");
    firstRow.label = "AA";
    flush();
    expect(removed.textContent).toBe("A");
  });

  it("creates SVG elements in the SVG namespace", () => {
    const svg = h("svg", { viewBox: "0 0 10 10" }, [
      h("circle", { cx: 5, r: 4 }),
    ]);

    expect(svg.namespaceURI).toBe("http://www.w3.org/2000/svg");
    expect(svg.firstElementChild?.namespaceURI).toBe(
      "http://www.w3.org/2000/svg",
    );
  });

  it("applies keys, styles, nested children, and static attr values", () => {
    const style = Object.create({ color: "red" }) as Record<string, unknown>;
    const opacity = "opacity";
    style["background-color"] = "blue";
    style[opacity] = "";
    style["border-color"] = null;
    const node = h(
      "div",
      {
        class: ["alpha", "beta gamma", "   "],
        disabled: true,
        hidden: false,
        key: "card",
        style,
      },
      ["hello", [0, false, true, null, undefined, h("span", null, "child")]],
    );
    const styled = h("p", { style: "color: red" });
    const ignoredStyle = h("p", { style: 1 });
    const inheritedProps = Object.create({ title: "ignored" }) as Props;
    const inheritedNode = h("div", inheritedProps);
    const ignoredClass = h("div", { class: 1 } as unknown as Props);

    expect(node.getAttribute("data-loom-key")).toBe("card");
    expect(node.className).toBe("alpha beta gamma");
    expect(node.getAttribute("disabled")).toBe("");
    expect(node.hasAttribute("hidden")).toBe(false);
    expect((node as HTMLElement).style.backgroundColor).toBe("blue");
    expect((node as HTMLElement).style.color).toBe("");
    expect(node.textContent).toBe("hello0child");
    expect(styled.getAttribute("style")).toBe("color: red");
    expect(ignoredStyle.getAttribute("style")).toBeNull();
    expect(inheritedNode.hasAttribute("title")).toBe(false);
    expect(ignoredClass.className).toBe("");
  });

  it("supports direct text, class, and attr bindings", () => {
    const model = state({ label: "one", on: false, selected: true });
    const node = h("button");
    const writes: string[] = [];
    const textHandle = text(node, () => model.label, {
      cleanup: () => writes.push("cleanup"),
      format: (value) => value.toUpperCase(),
      onWrite: (next, prev) => writes.push(`${prev ?? ""}->${next}`),
    });
    const classHandle = classed(node, "active", () => model.on);
    const attrHandle = attr(node, "aria-selected", () => model.selected);

    model.label = "two";
    model.on = true;
    model.selected = false;
    flush();

    expect(node.textContent).toBe("TWO");
    expect(node.classList.contains("active")).toBe(true);
    expect(node.hasAttribute("aria-selected")).toBe(false);
    expect(writes).toEqual(["->ONE", "ONE->TWO"]);

    textHandle.dispose();
    classHandle.dispose();
    attrHandle.dispose();
    expect(writes).toEqual(["->ONE", "ONE->TWO", "cleanup"]);
  });

  it("does not rewrite text, class, or attr bindings when outputs are unchanged", () => {
    const model = state({ label: "one", on: true, tick: 0 });
    const node = h("button");
    const writes: string[] = [];
    text(
      node,
      () => {
        void model.tick;
        return model.label;
      },
      {
        onWrite: (next) => writes.push(next),
      },
    );
    classed(node, "active", () => {
      void model.tick;
      return model.on;
    });
    attr(node, "data-label", () => {
      void model.tick;
      return model.label;
    });

    model.tick = 1;
    flush();

    expect(writes).toEqual(["one"]);
    expect(node.className).toBe("active");
    expect(node.getAttribute("data-label")).toBe("one");
  });

  it("disposes node-owned cleanup failures through reportError", () => {
    const reportError = vi.fn<(error: unknown) => void>();
    const originalReportError = globalThis.reportError;
    Object.defineProperty(globalThis, "reportError", {
      configurable: true,
      value: reportError,
    });
    try {
      const node = text(() => "value", {
        cleanup: () => {
          throw new Error("dispose cleanup failure");
        },
      });

      remove(node);

      expect(reportError).toHaveBeenCalledWith(expect.any(Error));
    } finally {
      Object.defineProperty(globalThis, "reportError", {
        configurable: true,
        value: originalReportError,
      });
    }
  });

  it("ignores dispose calls for null and text nodes", () => {
    expect(() => dispose(null)).not.toThrow();
    expect(() => dispose(document.createTextNode("x"))).not.toThrow();
    expect(effectsOf(h("div"))).toEqual([]);
  });

  it("patches tag replacements and removes extra rendered roots", () => {
    const wrapper = h("section", null, h("p", null, "old"));
    const live = wrapper.firstElementChild;
    if (!(live instanceof Element)) throw new Error("missing live element");

    const replacement = patch(live, h("article", null, "new"));

    expect(replacement.tagName).toBe("ARTICLE");
    expect(wrapper.firstElementChild).toBe(replacement);

    const root = h("main", null, [h("p", null, "one"), h("p", null, "two")]);
    render(root, () => h("h1", null, "next"));

    expect(root.children.length).toBe(1);
    expect(root.firstElementChild?.tagName).toBe("H1");
  });

  it("patches text, node type, empty, append, and extra-child cases", () => {
    const textLive = h("p", null, "old");
    patch(textLive, h("p", null, "new"));
    expect(textLive.textContent).toBe("new");

    const nodeTypeLive = h("p", null, "old");
    patch(nodeTypeLive, h("p", null, h("span", null, "new")));
    expect(nodeTypeLive.firstElementChild?.tagName).toBe("SPAN");

    const emptyLive = h("div", null, h("span", null, "remove"));
    patch(emptyLive, h("div"));
    expect(emptyLive.childNodes.length).toBe(0);

    const appendLive = h("div");
    patch(appendLive, h("div", null, h("span", null, "append")));
    expect(appendLive.textContent).toBe("append");

    const extraLive = h("div", null, [
      h("span", null, "keep"),
      h("em", null, "remove"),
    ]);
    patch(extraLive, h("div", null, h("span", null, "keep")));
    expect(extraLive.children.length).toBe(1);

    const appendFallbackLive = h("div", null, h("span", null, "first"));
    patch(
      appendFallbackLive,
      h("div", null, [h("span", null, "first"), h("em", null, "second")]),
    );
    expect(appendFallbackLive.children.length).toBe(2);
  });

  it("patches bound text by key and replaces incompatible bound nodes", () => {
    const model = state({ value: "one" });
    const live = h(
      "div",
      null,
      key(
        text(() => model.value),
        "value",
      ),
    );
    const original = live.firstElementChild;

    patch(live, h("div", null, h("span", null, "plain")));

    expect(live.firstElementChild).not.toBe(original);
  });

  it("replaces bound text elements with plain text children", () => {
    const model = state({ value: "one" });
    const live = h(
      "div",
      null,
      text(() => model.value),
    );
    const original = live.firstElementChild;

    patch(live, h("div", null, "plain"));
    model.value = "two";
    flush();

    expect(live.firstElementChild).toBeNull();
    expect(live.textContent).toBe("plain");
    expect(original?.textContent).toBe("one");
  });

  it("replaces plain text children with bound text elements", () => {
    const model = state({ value: "one" });
    const live = h("div", null, "plain");

    patch(
      live,
      h(
        "div",
        null,
        text(() => model.value),
      ),
    );
    model.value = "two";
    flush();

    expect(live.firstElementChild?.textContent).toBe("two");
  });

  it("syncs attrs when patching a bound text element directly", () => {
    const model = state({ value: "one" });
    const live = text(() => model.value);

    const patched = patch(live, h("span", { title: "next" }, "ignored"));

    expect(patched).toBe(live);
    expect(live.getAttribute("title")).toBe("next");
    expect(live.textContent).toBe("one");
  });

  it("patches different child element kinds by replacement", () => {
    const live = h("div", null, h("span", null, "old"));

    patch(live, h("div", null, h("em", null, "new")));

    expect(live.firstElementChild?.tagName).toBe("EM");
  });

  it("syncs attributes and event handlers during patch", () => {
    const calls: string[] = [];
    const same = () => calls.push("same");
    const live = h(
      "button",
      { "data-old": "x", onclick: same, title: "old" },
      "x",
    );

    patch(live, h("button", { onclick: same, title: "new" }, "x"));
    live.dispatchEvent(new MouseEvent("click"));

    expect(calls).toEqual(["same"]);
    expect(live.hasAttribute("data-old")).toBe(false);
    expect(live.getAttribute("title")).toBe("new");

    patch(live, h("button", null, "x"));
    live.dispatchEvent(new MouseEvent("click"));

    expect(calls).toEqual(["same"]);
  });

  it("adds event handlers to nodes that did not have one", () => {
    const calls: string[] = [];
    const live = h("button", null, "x");

    patch(live, h("button", { onclick: () => calls.push("next") }, "x"));
    live.dispatchEvent(new MouseEvent("click"));

    expect(calls).toEqual(["next"]);
  });

  it("falls back from keyed patching when next children are not fully keyed", () => {
    const live = h("ul", null, [
      key(h("li", null, "A"), "a"),
      key(h("li", null, "B"), "b"),
    ]);

    patch(live, h("ul", null, [h("li", null, "plain")]));

    expect(live.children.length).toBe(1);
    expect(live.textContent).toBe("plain");
  });

  it("patches keyed children by moving, updating, adding, and removing", () => {
    const live = h("ul", null, [
      key(h("li", null, "A"), "a"),
      key(h("li", null, "B"), "b"),
    ]);
    const first = live.children[0];

    patch(
      live,
      h("ul", null, [
        key(h("li", null, "B2"), "b"),
        key(h("li", null, "C"), "c"),
        key(h("li", null, "A2"), "a"),
      ]),
    );

    expect(live.children.length).toBe(3);
    expect(live.children[2]).toBe(first);
    expect([...live.children].map((node) => node.textContent)).toEqual([
      "B2",
      "C",
      "A2",
    ]);
  });

  it("throws for duplicate keyed children when configured to throw", () => {
    const live = h("ul", null, [
      key(h("li", null, "A"), "a"),
      key(h("li", null, "B"), "b"),
    ]);

    expect(() =>
      patch(
        live,
        h("ul", null, [
          key(h("li", null, "A"), "a"),
          key(h("li", null, "A again"), "a"),
        ]),
      ),
    ).toThrow('Duplicate Loom key "a".');
  });

  it("ignores duplicate keyed children when configured to ignore", () => {
    configure({ duplicateKeys: "ignore" });
    const live = h("ul", null, [
      key(h("li", null, "A"), "a"),
      key(h("li", null, "B"), "b"),
    ]);

    patch(
      live,
      h("ul", null, [
        key(h("li", null, "A"), "a"),
        key(h("li", null, "A again"), "a"),
      ]),
    );

    expect([...live.children].map((node) => node.textContent)).toEqual([
      "A",
      "A again",
    ]);
  });

  it("reconciles reactive lists and disposes stale rows", () => {
    const model = state({
      rows: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
    });
    const box = h("div");
    const handle = list(box, () => model.rows, {
      key: (row) => row.id,
      render: (row) => h("p", null, row.label),
    });

    model.rows = [
      { id: "b", label: "B2" },
      { id: "c", label: "C" },
    ];
    flush();

    expect([...box.children].map((node) => node.textContent)).toEqual([
      "B",
      "C",
    ]);

    handle.dispose();
    model.rows = [{ id: "d", label: "D" }];
    flush();

    expect([...box.children].map((node) => node.textContent)).toEqual([
      "B",
      "C",
    ]);
  });

  it("throws for duplicate list keys and can ignore them by configuration", () => {
    const rows = [
      { id: "a", label: "A" },
      { id: "a", label: "A again" },
    ];
    const box = h("div");

    expect(() =>
      list(box, rows, {
        key: (row) => row.id,
        render: (row) => h("p", null, row.label),
      }),
    ).toThrow('Duplicate Loom key "a".');

    configure({ duplicateKeys: "ignore" });
    list(box, rows, {
      key: (row) => row.id,
      render: (row) => h("p", null, row.label),
    });
    list(box, rows.slice().reverse(), {
      key: (row) => row.id,
      render: (row) => h("p", null, row.label),
    });

    expect(box.children.length).toBe(3);
  });

  it("ignores duplicate existing list keys when configured to ignore", () => {
    configure({ duplicateKeys: "ignore" });
    const box = h("div", null, [
      h("p", null, "unkeyed"),
      key(h("p", null, "A"), "a"),
      key(h("p", null, "A again"), "a"),
    ]);

    list(
      box,
      [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      {
        key: (row) => row.id,
        render: (row) => h("p", null, row.label),
      },
    );

    expect([...box.children].map((node) => node.textContent)).toEqual([
      "A again",
      "B",
      "A",
    ]);
  });

  it("throws when existing list children contain duplicate keys", () => {
    const box = h("div", null, [
      key(h("p", null, "A"), "a"),
      key(h("p", null, "A again"), "a"),
    ]);

    expect(() =>
      list(box, [{ id: "a", label: "A" }], {
        key: (row) => row.id,
        render: (row) => h("p", null, row.label),
      }),
    ).toThrow('Duplicate Loom key "a".');
  });
});
