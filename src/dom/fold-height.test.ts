// @vitest-environment happy-dom

import { heightFold } from "loom/motion";
import { afterEach, describe, expect, it, vi } from "vitest";

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
    const fold = heightFold(el);
    fold.set(false);
    await microtask(); // no transition -> microtask settle
    expect(el.hidden).toBe(true);
    expect(el.style.height).toBe("0px");

    fold.set(true);
    expect(el.hidden).toBe(false);
    expect(el.style.height).toBe("120px");
    await microtask();
    expect(el.style.height).toBe(""); // auto: later content growth is never clipped

    fold.set(false);
    expect(el.style.height).toBe("0px");
    expect(el.hidden).toBe(false); // still animating (until settle)
    await microtask();
    expect(el.hidden).toBe(true);
  });

  it("EVERY expand measures at auto — content that changed while folded animates to its NEW height (no cache to go stale)", async () => {
    let height = 120;
    const el = box(() => height);
    const fold = heightFold(el);
    fold.set(true);
    await microtask();
    fold.set(false); // folded over 120px of content
    await microtask();
    height = 300; // the content changed while folded
    fold.set(true);
    // A cached 120 would animate short and snap to auto on settle.
    expect(el.style.height).toBe("300px");
  });

  it("an INTERRUPTED collapse never poisons the next expand — it measures at auto", async () => {
    let height = 120;
    const el = box(() => height);
    const fold = heightFold(el);
    // happy-dom computes longhands only.
    el.style.transitionProperty = "height";
    el.style.transitionDuration = "100ms";
    vi.useFakeTimers();
    fold.set(true); // expanding…
    height = 47; // …mid-flight the box reads a PARTIAL
    fold.set(false); // interrupt: collapse now
    vi.advanceTimersByTime(200); // settle the collapse
    expect(el.hidden).toBe(true);

    height = 120; // the real open height again
    fold.set(true);
    // A partial would animate to 47; the measure finds 120.
    expect(el.style.height).toBe("120px");
    vi.useRealTimers();
  });

  it("onStart/onSettle bracket the animation (the observer-mute seam)", async () => {
    const el = box(() => 80);
    const calls: string[] = [];
    const fold = heightFold(el, {
      onStart: (open) => calls.push(`start:${open}`),
      onSettle: (open) => calls.push(`settle:${open}`),
    });
    fold.set(false);
    expect(calls).toEqual(["start:false"]);
    await microtask();
    expect(calls).toEqual(["start:false", "settle:false"]);
  });
});
