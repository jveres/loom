// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { effect } from "../loom.js";
import { mediaRead } from "./index.js";

// A drivable matchMedia fake — happy-dom's list cannot be flipped
// from a test. flip() changes matches and fires the change listeners
// like the OS would.
class FakeList {
  matches = false;
  readonly listeners = new Set<() => void>();
  addEventListener(_type: string, cb: () => void): void {
    this.listeners.add(cb);
  }
  removeEventListener(_type: string, cb: () => void): void {
    this.listeners.delete(cb);
  }
  flip(next: boolean): void {
    this.matches = next;
    for (const cb of [...this.listeners]) cb();
  }
}

const lists = new Map<string, FakeList>();
vi.stubGlobal("matchMedia", (query: string): FakeList => {
  let list = lists.get(query);
  if (!list) {
    list = new FakeList();
    lists.set(query, list);
  }
  return list;
});

afterEach(() => {
  lists.clear();
});

// The pool caches per query for the module's lifetime — every test
// uses its own query string.
describe("mediaRead(query)", () => {
  it("pools one signal per query string", () => {
    expect(mediaRead("(a)")).toBe(mediaRead("(a)"));
    expect(mediaRead("(a)")).not.toBe(mediaRead("(b)"));
  });

  it("tracks the query as a reactive boolean", () => {
    const read = mediaRead("(c)");
    const seen: boolean[] = [];
    const stop = effect(() => {
      seen.push(read());
    });
    expect(seen).toEqual([false]);
    lists.get("(c)")?.flip(true);
    expect(seen).toEqual([false, true]);
    stop();
  });

  it("resyncs on reconnect — an unobserved flip cannot wedge the next notification", () => {
    const read = mediaRead("(d)");
    const list = (): FakeList => {
      const l = lists.get("(d)");
      if (!l) throw new Error("list not created");
      return l;
    };
    const first = effect(() => {
      read();
    });
    expect(list().listeners.size).toBe(1);
    first();
    // Last subscriber gone: the listener detaches (costs zero).
    expect(list().listeners.size).toBe(0);

    // The OS flips while nobody watches — the cached false is stale.
    list().flip(true);

    // Reconnect RESYNCS (the connect-time push): without it, the
    // stale cache would also swallow the flip back to false through
    // source()'s value dedupe.
    const seen: boolean[] = [];
    const second = effect(() => {
      seen.push(read());
    });
    expect(seen).toEqual([true]);
    list().flip(false);
    expect(seen).toEqual([true, false]);
    second();
  });
});
