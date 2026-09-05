// @vitest-environment happy-dom
import { observeSize } from "loom/browser";
// @vitest-environment happy-dom
// The box-option contract: ResizeObserver's default content-box never
// fires on padding-only changes, so a consumer measuring border boxes
// (an editor's page-margin marker) must be able to observe the border
// box. The shared observer holds ONE observation per element — an
// explicit options re-observes and the last explicit box wins.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  it("keeps subscriptions for different boxes independent", () => {
    const el = document.createElement("div");
    document.body.append(el);
    const stopDefault = observeSize(el, () => {});
    expect(observed).toEqual([{ el, options: { box: "content-box" } }]);
    // A second default-box observer piggybacks on the existing
    // observation; only an EXPLICIT options replaces it.
    const stopSecond = observeSize(el, () => {});
    expect(observed).toHaveLength(1);
    const stopBorder = observeSize(el, () => {}, { box: "border-box" });
    expect(unobserved).toEqual([]);
    expect(observed).toEqual([
      { el, options: { box: "content-box" } },
      { el, options: { box: "border-box" } },
    ]);
    stopDefault();
    stopSecond();
    stopBorder();
  });
  it("the observer is the element's OWN realm's (popup/iframe elements)", () => {
    // A module-global observer constructed in the importing realm
    // forced cross-realm delivery for elements of another window —
    // the frameCoalesced {window} hazard, solved here by deriving
    // the realm from the element itself.
    const foreignObserved: Element[] = [];
    class ForeignRO {
      observe(el: Element): void {
        foreignObserved.push(el);
      }
      unobserve(): void {}
      disconnect(): void {}
    }
    const foreignWin = {
      ResizeObserver: ForeignRO,
    } as unknown as Window & typeof globalThis;
    const foreignDoc = document.implementation.createHTMLDocument();
    Object.defineProperty(foreignDoc, "defaultView", {
      value: foreignWin,
    });
    const el = foreignDoc.createElement("div");
    foreignDoc.body.append(el);
    const stop = observeSize(el, () => {});
    expect(foreignObserved).toEqual([el]);
    // …and the ambient realm's observer never saw it.
    expect(observed).toEqual([]);
    stop();
  });
});
