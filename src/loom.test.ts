// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import {
  attr,
  classed,
  computed,
  configure,
  depsOf,
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
} from "./loom.js";

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
      model.count = 2;
      flush();

      expect(events).toContain("mutation:count");
      expect(events).toContain("dep:state");
      expect(events).toContain("effect:view");
      expect(events.some((event) => event.startsWith("flush:"))).toBe(true);
      expect(events).toContain("patch:list");
    } finally {
      off.dispose();
      configure({ scheduler: "microtask" });
    }
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
});
