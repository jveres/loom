// @vitest-environment happy-dom

// The box-option contract: ResizeObserver's default content-box never
// fires on padding-only changes, so a consumer measuring border boxes
// (an editor's page-margin marker) must be able to observe the border
// box. The shared observer holds ONE observation per element — an
// explicit options re-observes and the last explicit box wins.

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { observeSize } from "./observe-size.js";

const observed: Array<{
  el: Element;
  options: ResizeObserverOptions | undefined;
}> = [];
const unobserved: Element[] = [];

beforeEach(() => {
  observed.length = 0;
  unobserved.length = 0;
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe(el: Element, options?: ResizeObserverOptions): void {
        observed.push({ el, options });
      }
      unobserve(el: Element): void {
        unobserved.push(el);
      }
      disconnect(): void {}
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("observeSize", () => {
  it("forwards ResizeObserverOptions to the observation", () => {
    const el = document.createElement("div");
    document.body.append(el);
    const stop = observeSize(el, () => {}, { box: "border-box" });
    expect(observed).toEqual([{ el, options: { box: "border-box" } }]);
    stop();
  });

  it("an explicit box re-observes an already-watched element", () => {
    const el = document.createElement("div");
    document.body.append(el);
    const stopDefault = observeSize(el, () => {});
    expect(observed).toEqual([{ el, options: undefined }]);

    // A second default-box observer piggybacks on the existing
    // observation; only an EXPLICIT options replaces it.
    const stopSecond = observeSize(el, () => {});
    expect(observed).toHaveLength(1);

    const stopBorder = observeSize(el, () => {}, { box: "border-box" });
    expect(unobserved).toEqual([el]);
    expect(observed).toEqual([
      { el, options: undefined },
      { el, options: { box: "border-box" } },
    ]);
    stopDefault();
    stopSecond();
    stopBorder();
  });
});
