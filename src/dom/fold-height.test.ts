// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { foldHeight } from "./fold-height.js";

const microtask = (): Promise<void> => Promise.resolve();

const box = (height: () => number): HTMLElement => {
  const el = document.createElement("div");
  Object.defineProperty(el, "offsetHeight", {
    configurable: true,
    get: height,
  });
  document.body.append(el);
  return el;
};

afterEach(() => {
  document.body.replaceChildren();
});

describe("foldHeight", () => {
  it("expands measure-at-auto, settles to height:auto; collapses to 0, hides on settle", async () => {
    const el = box(() => 120);
    foldHeight(el, false);
    await microtask(); // no transition -> microtask settle
    expect(el.hidden).toBe(true);
    expect(el.style.height).toBe("0px");

    foldHeight(el, true);
    expect(el.hidden).toBe(false);
    expect(el.style.height).toBe("120px");
    await microtask();
    expect(el.style.height).toBe(""); // auto: later content growth is never clipped

    foldHeight(el, false);
    expect(el.style.height).toBe("0px");
    expect(el.hidden).toBe(false); // still animating (until settle)
    await microtask();
    expect(el.hidden).toBe(true);
  });

  it("the SECOND expand rides the height cached at collapse — no measure-at-auto", async () => {
    let reads = 0;
    const el = box(() => {
      reads++;
      return 120;
    });
    foldHeight(el, true);
    await microtask();
    foldHeight(el, false); // caches 120
    await microtask();
    const before = reads;
    foldHeight(el, true);
    expect(el.style.height).toBe("120px");
    // ONE read only — the 0px reflow kick; the expensive
    // measure-at-AUTO (full layout at natural height) is skipped.
    expect(reads).toBe(before + 1);
  });

  it("an INTERRUPTED collapse drops the cache — the next expand re-measures at auto", async () => {
    let height = 120;
    const el = box(() => height);
    // happy-dom computes longhands only.
    el.style.transitionProperty = "height";
    el.style.transitionDuration = "100ms";
    vi.useFakeTimers();
    foldHeight(el, true); // expanding…
    height = 47; // …mid-flight the box reads a PARTIAL
    foldHeight(el, false); // interrupt: collapse now
    vi.advanceTimersByTime(200); // settle the collapse
    expect(el.hidden).toBe(true);

    height = 120; // the real open height again
    foldHeight(el, true);
    // A poisoned cache would animate to 47; the re-measure finds 120.
    expect(el.style.height).toBe("120px");
    vi.useRealTimers();
  });

  it("onStart/onSettle bracket the animation (the observer-mute seam)", async () => {
    const el = box(() => 80);
    const calls: string[] = [];
    foldHeight(el, false, {
      onStart: (open) => calls.push(`start:${open}`),
      onSettle: (open) => calls.push(`settle:${open}`),
    });
    expect(calls).toEqual(["start:false"]);
    await microtask();
    expect(calls).toEqual(["start:false", "settle:false"]);
  });
});
