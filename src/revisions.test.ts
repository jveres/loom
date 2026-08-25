import { describe, expect, it } from "vitest";
import { effect } from "./loom.js";
import { revisions } from "./revisions.js";

describe("revisions", () => {
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
