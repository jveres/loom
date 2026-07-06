// @vitest-environment happy-dom
// The seam-round-3 kit helpers: bind / observeSize / onmount / persisted.
import { afterEach, describe, expect, it, vi } from "vitest";
import { state } from "../loom.js";
import { bind, h, onmount, remove } from "./index.js";
import { observeSize } from "./observe-size.js";
import { persisted } from "./persisted.js";

describe("bind", () => {
  it("is effect + node lifetime + attribution in one call", () => {
    const label = state("a");
    const el = h("div");
    bind(el, () => {
      el.textContent = label();
    });
    expect(el.textContent).toBe("a");
    label("b");
    expect(el.textContent).toBe("b");

    remove(el); // node teardown disposes the binding
    label("c");
    expect(el.textContent).toBe("b");
  });

  it("returns the stop for early manual disposal", () => {
    const value = state(0);
    const el = h("div");
    let runs = 0;
    const stop = bind(el, () => {
      value();
      runs++;
    });
    stop();
    value(1);
    expect(runs).toBe(1);
    remove(el); // second disposal via teardown must be harmless
  });

  it("runs the effect cleanup on re-run and teardown", () => {
    const value = state(0);
    const el = h("div");
    const cleanups: number[] = [];
    bind(el, () => {
      const v = value();
      return () => cleanups.push(v);
    });
    value(1);
    expect(cleanups).toEqual([0]);
    remove(el);
    expect(cleanups).toEqual([0, 1]);
  });
});

describe("observeSize", () => {
  // happy-dom does no layout, so drive the shared observer through a stub.
  let instances: Array<{
    observed: Element[];
    cb: ResizeObserverCallback;
    disconnected: boolean;
  }> = [];

  function stubRO(): void {
    instances = [];
    vi.stubGlobal(
      "ResizeObserver",
      class {
        record = {
          observed: [] as Element[],
          cb: (() => {}) as ResizeObserverCallback,
          disconnected: false,
        };
        constructor(cb: ResizeObserverCallback) {
          this.record.cb = cb;
          instances.push(this.record);
        }
        observe(el: Element): void {
          this.record.observed.push(el);
        }
        unobserve(el: Element): void {
          this.record.observed = this.record.observed.filter((e) => e !== el);
        }
        disconnect(): void {
          this.record.disconnected = true;
        }
      },
    );
  }

  function fire(el: Element): void {
    const inst = instances.at(-1);
    inst?.cb(
      [{ target: el } as ResizeObserverEntry],
      inst as unknown as ResizeObserver,
    );
  }

  afterEach(() => vi.unstubAllGlobals());

  it("shares one observer, routes entries, and tears down with the node", () => {
    stubRO();
    const a = h("div");
    const b = h("div");
    const seen: string[] = [];
    observeSize(a, () => seen.push("a"));
    observeSize(a, () => seen.push("a2")); // second cb, same element
    observeSize(b, () => seen.push("b"));
    expect(instances.length).toBe(1); // ONE observer app-wide

    fire(a);
    fire(b);
    expect(seen).toEqual(["a", "a2", "b"]);

    remove(a); // node teardown detaches both of a's callbacks
    fire(a);
    expect(seen).toEqual(["a", "a2", "b"]);

    remove(b); // last watcher gone -> observer disconnected
    expect(instances[0]?.disconnected).toBe(true);
  });

  it("manual stop detaches just that callback", () => {
    stubRO();
    const el = h("div");
    const seen: string[] = [];
    const stop = observeSize(el, () => seen.push("one"));
    observeSize(el, () => seen.push("two"));
    stop();
    fire(el);
    expect(seen).toEqual(["two"]);
    remove(el);
  });
});

describe("onmount", () => {
  it("fires once on a microtask when inserted in the same task", async () => {
    const el = h("div");
    const calls: Node[] = [];
    onmount(el, (n) => calls.push(n));
    document.body.append(el); // same-task insertion — the documented contract
    expect(calls).toEqual([]); // not synchronous
    await Promise.resolve();
    expect(calls).toEqual([el]);
    el.remove();
  });

  it("fires for an already-connected element", async () => {
    const el = h("div");
    document.body.append(el);
    let fired = 0;
    onmount(el, () => fired++);
    await Promise.resolve();
    expect(fired).toBe(1);
    el.remove();
  });

  it("falls back to observation for late insertion, still fires once", async () => {
    const el = h("div");
    let fired = 0;
    onmount(el, () => fired++);
    await Promise.resolve(); // microtask passes disconnected -> pending
    expect(fired).toBe(0);
    document.body.append(el);
    await vi.waitFor(() => expect(fired).toBe(1));
    el.remove();
  });

  it("cancel and loom teardown both drop a pending hook", async () => {
    const a = h("div");
    const b = h("div");
    let fired = 0;
    const cancel = onmount(a, () => fired++);
    onmount(b, () => fired++);
    cancel();
    remove(b); // never mounted: teardown must clear the pending entry
    await Promise.resolve();
    document.body.append(a, b);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fired).toBe(0);
    a.remove();
    b.remove();
  });

  it("is not a JSX prop (kept out of the h() baseline by design)", async () => {
    const calls: string[] = [];
    // A function prop named onmount is wired as a plain event listener like any
    // other on<name> prop — the mount hook is import-only.
    const el = h("div", { onmount: () => calls.push("mount") });
    document.body.append(el);
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(calls).toEqual([]);
    el.remove();
  });
});

describe("persisted", () => {
  it("loads, validates, and writes through", () => {
    localStorage.setItem("k1", JSON.stringify(41));
    const cell = persisted("k1", 0);
    expect(cell()).toBe(41);

    cell(42);
    expect(localStorage.getItem("k1")).toBe("42");
  });

  it("validate is the load choke point: rejected values fall back to initial", () => {
    localStorage.setItem("k2", JSON.stringify(3.7)); // the fractional-position bug
    const cell = persisted("k2", 0, {
      validate: (v) => Number.isInteger(v),
    });
    expect(cell()).toBe(0);
    localStorage.removeItem("k2");
  });

  it("unparsable storage falls back to initial and does not write back", () => {
    localStorage.setItem("k3", "{not json");
    const cell = persisted("k3", "fallback");
    expect(cell()).toBe("fallback");
    expect(localStorage.getItem("k3")).toBe("{not json"); // load never writes
  });

  it("honors serialize/parse hooks", () => {
    const cell = persisted<Set<string>>("k4", new Set(), {
      serialize: (s) => JSON.stringify([...s]),
      parse: (raw) => new Set(JSON.parse(raw)),
    });
    cell(new Set(["a", "b"]));
    expect(localStorage.getItem("k4")).toBe('["a","b"]');

    const again = persisted<Set<string>>("k4-copy", new Set(), {
      parse: (raw) => new Set(JSON.parse(raw)),
    });
    void again;
    const reloaded = persisted<Set<string>>("k4", new Set(), {
      serialize: (s) => JSON.stringify([...s]),
      parse: (raw) => new Set(JSON.parse(raw)),
    });
    expect([...reloaded()]).toEqual(["a", "b"]);
    localStorage.removeItem("k4");
  });

  it("degrades to a plain cell when storage is absent", () => {
    vi.stubGlobal("localStorage", undefined);
    try {
      const cell = persisted("k5", 7);
      cell(8);
      expect(cell()).toBe(8); // still a working state cell, just unpersisted
    } finally {
      vi.unstubAllGlobals();
    }
    expect(localStorage.getItem("k5")).toBeNull(); // nothing was written
  });

  it("a throwing setItem degrades writes, not the cell", () => {
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    } as unknown as Storage;
    const cell = persisted("k6", 1, { storage: broken });
    cell(2);
    expect(cell()).toBe(2);
  });
});
