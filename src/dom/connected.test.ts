// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { effect, watch } from "../loom.js";
import { connected } from "./connected.js";

// MutationObserver delivers async; settle a microtask + macrotask round.
async function settle(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("connected", () => {
  it("tracks attach and detach reactively", async () => {
    const el = document.createElement("div");
    const seen: boolean[] = [];
    const stop = effect(() => {
      seen.push(connected(el)());
    });
    expect(seen).toEqual([false]);

    document.body.append(el);
    await vi.waitFor(() => expect(seen).toEqual([false, true]));

    el.remove();
    await vi.waitFor(() => expect(seen).toEqual([false, true, false]));
    stop();
  });

  it("pools one signal per node and resyncs after an unobserved gap", async () => {
    const el = document.createElement("div");
    expect(connected(el)).toBe(connected(el));

    // No subscriber: reading reports the value from subscribe/creation time.
    const stop1 = effect(() => connected(el)());
    stop1(); // last subscriber gone -> observer detached

    document.body.append(el); // changes while unobserved
    await settle();

    // Re-subscribe: connect() resyncs immediately — the connecting read
    // returns the fresh value, no DOM mutation needed.
    let now = false;
    const stop2 = effect(() => {
      now = connected(el)();
    });
    expect(now).toBe(true);
    el.remove();
    await vi.waitFor(() => expect(now).toBe(false));
    stop2();
  });

  it("composes with watch() as the mount idiom", async () => {
    const el = document.createElement("div");
    const mounted: boolean[] = [];
    const stop = watch(connected(el), (on) => mounted.push(on));

    document.body.append(el);
    await vi.waitFor(() => expect(mounted).toEqual([true]));
    el.remove();
    await vi.waitFor(() => expect(mounted).toEqual([true, false]));
    stop();
  });

  it("moves within the document stay true without a spurious false", async () => {
    const el = document.createElement("div");
    const a = document.createElement("section");
    const b = document.createElement("section");
    document.body.append(a, b);
    a.append(el);

    const seen: boolean[] = [];
    const stop = effect(() => {
      seen.push(connected(el)());
    });
    expect(seen).toEqual([true]);

    b.append(el); // reparent: remains connected throughout the batch
    await settle();
    expect(seen).toEqual([true]); // deduped — no false/true flicker
    stop();
  });

  it("observes the node's ownerDocument", async () => {
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    const foreignDocument = iframe.contentDocument;
    expect(foreignDocument).not.toBeNull();
    if (!foreignDocument) return;
    const el = foreignDocument.createElement("div");
    const seen: boolean[] = [];
    const stop = effect(() => {
      seen.push(connected(el)());
    });

    foreignDocument.body.append(el);
    await vi.waitFor(() => expect(seen).toEqual([false, true]));
    el.remove();
    await vi.waitFor(() => expect(seen).toEqual([false, true, false]));
    stop();
    iframe.remove();
  });
});
