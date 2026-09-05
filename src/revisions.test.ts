import { describe, expect, it, onTestFinished } from "vitest";
import { batch, computed, effect, scope, state } from "./loom.js";
import { revisions } from "./revisions.js";

describe("revisions", () => {
  it("rejects an empty separator before ancestor traversal", () => {
    expect(() => revisions({ separator: "" })).toThrow(RangeError);
  });

  it("prunes only matching idle paths and reports retained size", () => {
    const bus = revisions();
    bus.read("old.a");
    bus.read("old.b");
    bus.read("keep");
    bus.invalidate("old.a");

    expect(bus.prune("old.")).toBe(2);
    expect(bus.size).toBe(1);
    expect(bus.read("old.a")).toBe(0);
    expect(bus.prune((path) => path === "keep")).toBe(1);
    expect(bus.prune()).toBe(1);
    expect(bus.size).toBe(0);
  });

  it("keeps direct, computed, and paused subscribers on their original cells", () => {
    const bus = revisions();
    const direct: number[] = [];
    const derived: number[] = [];
    const paused: number[] = [];
    const read = computed(() => bus.read("derived"));
    const owner = scope(() => {
      effect(() => {
        direct.push(bus.read("direct"));
      });
      effect(() => {
        derived.push(read());
      });
    });
    onTestFinished(owner.stop);
    const sleeper = scope(() => {
      effect(() => {
        paused.push(bus.read("paused"));
      });
    });
    onTestFinished(sleeper.stop);
    sleeper.pause();

    expect(bus.prune()).toBe(0);
    batch(() => {
      bus.invalidate("direct", "derived", "paused");
      expect(bus.prune()).toBe(0);
    });
    sleeper.resume();

    expect(direct).toEqual([0, 1]);
    expect(derived).toEqual([0, 1]);
    expect(paused).toEqual([0, 1]);
    owner.stop();
    sleeper.stop();
    expect(bus.prune()).toBe(3);
  });

  it("pruning does not subscribe its caller and can release abandoned branches", () => {
    const bus = revisions();
    const branch = state(true);
    const owner = scope(() => {
      effect(() => bus.read(branch() ? "left" : "right"));
    });
    onTestFinished(owner.stop);
    let prunes = 0;
    const stop = effect(() => {
      bus.prune();
      prunes++;
    });
    onTestFinished(stop);

    bus.invalidate("left");
    expect(prunes).toBe(1);
    branch(false);
    expect(bus.prune()).toBe(1);

    expect(bus.size).toBe(1);
    expect(bus.prune()).toBe(0);
  });
  it("a write invalidates its exact path and dotted ancestors, never a sibling", () => {
    const bus = revisions({ label: "test.rev" });
    const runs = { root: 0, a: 0, ab: 0, ax: 0 };
    const stops = [
      effect(() => {
        bus.read("");
        runs.root += 1;
      }),
      effect(() => {
        bus.read("a");
        runs.a += 1;
      }),
      effect(() => {
        bus.read("a.b");
        runs.ab += 1;
      }),
      effect(() => {
        bus.read("a.x");
        runs.ax += 1;
      }),
    ];
    expect(runs).toEqual({ root: 1, a: 1, ab: 1, ax: 1 });

    bus.invalidate("a.b.c");
    expect(runs).toEqual({ root: 2, a: 2, ab: 2, ax: 1 });

    bus.invalidate("a.x");
    expect(runs).toEqual({ root: 3, a: 3, ab: 2, ax: 2 });

    // A subtree clear touching several leaves runs each dependent once.
    bus.invalidate("a.b.c", "a.b.d", "a.x");
    expect(runs).toEqual({ root: 4, a: 4, ab: 3, ax: 3 });
    for (const stop of stops) stop();
  });

  it("the one-key form: read('') / invalidate('')", () => {
    const bus = revisions();
    let runs = 0;
    const stop = effect(() => {
      bus.read("");
      runs += 1;
    });
    bus.invalidate("");
    bus.invalidate("anything.at.all"); // every path's ancestor is the root
    expect(runs).toBe(3);
    stop();
  });

  it("honours a custom separator", () => {
    const bus = revisions({ separator: "/" });
    let runs = 0;
    const stop = effect(() => {
      bus.read("pages/home");
      runs += 1;
    });
    bus.invalidate("pages/home/title");
    expect(runs).toBe(2);
    bus.invalidate("pages.home.title"); // not a descendant under "/"
    expect(runs).toBe(2);
    stop();
  });
});
