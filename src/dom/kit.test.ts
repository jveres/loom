// @vitest-environment happy-dom
// The seam-round-3 kit helpers: bind / observeSize / onmount / persisted.
import { afterEach, describe, expect, it, vi } from "vitest";
import { state } from "../loom.js";
import { bind, h, onMount, remove } from "./index.js";
import { observeIntersection } from "./observe-intersection.js";
import { observeMutation } from "./observe-mutation.js";
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

describe("onMount", () => {
  it("fires once on a microtask when inserted in the same task", async () => {
    const el = h("div");
    const calls: Node[] = [];
    onMount(el, (n) => calls.push(n));
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
    onMount(el, () => fired++);
    await Promise.resolve();
    expect(fired).toBe(1);
    el.remove();
  });

  it("falls back to observation for late insertion, still fires once", async () => {
    const el = h("div");
    let fired = 0;
    onMount(el, () => fired++);
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
    const cancel = onMount(a, () => fired++);
    onMount(b, () => fired++);
    cancel();
    remove(b); // never mounted: teardown must clear the pending entry
    await Promise.resolve();
    document.body.append(a, b);
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(fired).toBe(0);
    a.remove();
    b.remove();
  });

  it("works as the JSX prop in both spellings", async () => {
    const calls: string[] = [];
    const el = h("div", { onmount: () => calls.push("lower") });
    const el2 = h("div", { onMount: () => calls.push("camel") });
    document.body.append(el, el2);
    await Promise.resolve();
    expect(calls).toEqual(["lower", "camel"]);
    el.remove();
    el2.remove();
  });
});

describe("persisted", () => {
  it("loads, validates, and writes through", () => {
    localStorage.setItem("k1", JSON.stringify(41));
    const signal = persisted("k1", 0);
    expect(signal()).toBe(41);

    signal(42);
    expect(localStorage.getItem("k1")).toBe("42");
  });

  it("validate is the load choke point: rejected values fall back to initial", () => {
    localStorage.setItem("k2", JSON.stringify(3.7)); // the fractional-position bug
    const signal = persisted("k2", 0, {
      validate: (v) => Number.isInteger(v),
    });
    expect(signal()).toBe(0);
    localStorage.removeItem("k2");
  });

  it("unparsable storage falls back to initial and does not write back", () => {
    localStorage.setItem("k3", "{not json");
    const signal = persisted("k3", "fallback");
    expect(signal()).toBe("fallback");
    expect(localStorage.getItem("k3")).toBe("{not json"); // load never writes
  });

  it("honors serialize/parse hooks", () => {
    const signal = persisted<Set<string>>("k4", new Set(), {
      serialize: (s) => JSON.stringify([...s]),
      parse: (raw) => new Set(JSON.parse(raw)),
    });
    signal(new Set(["a", "b"]));
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

  it("degrades to a plain signal when storage is absent", () => {
    vi.stubGlobal("localStorage", undefined);
    try {
      const signal = persisted("k5", 7);
      signal(8);
      expect(signal()).toBe(8); // still a working state signal, just unpersisted
    } finally {
      vi.unstubAllGlobals();
    }
    expect(localStorage.getItem("k5")).toBeNull(); // nothing was written
  });

  it("a throwing setItem degrades writes, not the signal", () => {
    const broken = {
      getItem: () => null,
      setItem: () => {
        throw new Error("quota");
      },
    } as unknown as Storage;
    const signal = persisted("k6", 1, { storage: broken });
    signal(2);
    expect(signal()).toBe(2);
  });
});

describe("observeMutation", () => {
  it("delivers records and detaches with the node", async () => {
    const el = h("div");
    const seen: string[] = [];
    observeMutation(
      el,
      (records) => {
        for (const r of records) seen.push(r.type);
      },
      { attributes: true },
    );
    el.setAttribute("data-x", "1");
    await vi.waitFor(() => expect(seen).toEqual(["attributes"]));

    remove(el); // node teardown disconnects
    el.setAttribute("data-x", "2");
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(seen).toEqual(["attributes"]);
  });

  it("manual stop is idempotent with teardown", () => {
    const el = h("div");
    const stop = observeMutation(el, () => {}, { childList: true });
    stop();
    remove(el); // second detach must be harmless
  });
});

describe("observeIntersection", () => {
  let instances: Array<{
    observed: Element[];
    cb: IntersectionObserverCallback;
    disconnected: boolean;
  }> = [];

  function stubIO(): void {
    instances = [];
    vi.stubGlobal(
      "IntersectionObserver",
      class {
        record = {
          observed: [] as Element[],
          cb: (() => {}) as IntersectionObserverCallback,
          disconnected: false,
        };
        constructor(cb: IntersectionObserverCallback) {
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

  afterEach(() => vi.unstubAllGlobals());

  it("pools same-options observers and routes by target", () => {
    stubIO();
    const a = h("div");
    const b = h("div");
    const seen: string[] = [];
    observeIntersection(a, () => seen.push("a"));
    observeIntersection(b, () => seen.push("b"));
    expect(instances.length).toBe(1); // shared default pool

    observeIntersection(a, () => seen.push("a-margin"), {
      rootMargin: "10px",
    });
    expect(instances.length).toBe(2); // distinct options -> distinct pool

    const inst = instances[0];
    inst?.cb(
      [{ target: a } as unknown as IntersectionObserverEntry],
      inst as unknown as IntersectionObserver,
    );
    expect(seen).toEqual(["a"]);

    remove(a);
    remove(b);
    expect(instances[0]?.disconnected).toBe(true);
    expect(instances[1]?.disconnected).toBe(true);
  });

  it("a custom root gets a dedicated observer", () => {
    stubIO();
    const el = h("div");
    const root = h("div");
    observeIntersection(el, () => {}, { root });
    observeIntersection(el, () => {}, { root });
    expect(instances.length).toBe(2); // no pooling across roots
    remove(el);
    expect(instances.every((i) => i.disconnected)).toBe(true);
  });
});
