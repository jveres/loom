import { scope, state } from "loom";
import { pending, resource } from "loom/async";
import { describe, expect, it } from "vitest";

// A hand-rolled deferred so tests control exactly when each fetch settles.
function deferred<T>(): {
  promise: Promise<T>;
  resolve: (v: T) => void;
  reject: (e: unknown) => void;
} {
  let resolve!: (v: T) => void;
  let reject!: (e: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}
const settle = () => new Promise((r) => setTimeout(r, 0));
describe("loom/async resource", () => {
  it("resolves value and clears loading", async () => {
    const d = deferred<string>();
    const r = resource(() => d.promise);
    expect(r()).toBeUndefined();
    expect(r.loading()).toBe(true);
    d.resolve("data");
    await settle();
    expect(r()).toBe("data");
    expect(r.loading()).toBe(false);
    expect(r.error()).toBeUndefined();
    r.stop();
  });
  it("captures rejections and clears them on the next success", async () => {
    let fail = true;
    const r = resource(() =>
      fail ? Promise.reject(new Error("boom")) : Promise.resolve(1),
    );
    await settle();
    expect(r.error()).toBeInstanceOf(Error);
    expect(r.loading()).toBe(false);
    fail = false;
    r.refresh();
    expect(r.loading()).toBe(true);
    await settle();
    expect(r()).toBe(1);
    expect(r.error()).toBeUndefined();
    r.stop();
  });
  it("captures a synchronous fetcher throw and can recover", async () => {
    const failure = new Error("sync boom");
    let fail = true;
    const r = resource(() => {
      if (fail) throw failure;
      return Promise.resolve(7);
    });
    expect(r()).toBeUndefined();
    expect(r.loading()).toBe(true);
    await settle();
    expect(r.error()).toBe(failure);
    expect(r.loading()).toBe(false);
    fail = false;
    r.refresh();
    expect(r.loading()).toBe(true);
    await settle();
    expect(r()).toBe(7);
    expect(r.error()).toBeUndefined();
    expect(r.loading()).toBe(false);
    r.stop();
  });
  it("refetches when a tracked read changes, passing the previous value", async () => {
    const page = state(1);
    const seen: Array<number | undefined> = [];
    const r = resource<number>((previous) => {
      seen.push(previous);
      return Promise.resolve(page() * 10);
    });
    await settle();
    expect(r()).toBe(10);
    page(2); // tracked dep -> automatic refetch
    expect(r.loading()).toBe(true);
    expect(r()).toBe(10); // stale value stays readable while refetching
    await settle();
    expect(r()).toBe(20);
    expect(seen).toEqual([undefined, 10]);
    r.stop();
  });
  it("drops out-of-order responses (stale fetch loses)", async () => {
    const page = state(1);
    const pending: Array<{
      resolve: (v: number) => void;
    }> = [];
    const r = resource(() => {
      page();
      const d = deferred<number>();
      pending.push(d);
      return d.promise;
    });
    page(2); // second fetch starts before the first settles
    pending[0]?.resolve(111); // the stale response arrives late...
    await settle();
    expect(r()).toBeUndefined(); // ...and is dropped
    expect(r.loading()).toBe(true);
    pending[1]?.resolve(222);
    await settle();
    expect(r()).toBe(222);
    expect(r.loading()).toBe(false);
    r.stop();
  });
  it("aborts the in-flight signal on refetch, without polluting error()", async () => {
    const page = state(1);
    const signals: AbortSignal[] = [];
    const r = resource((_prev, signal) => {
      page();
      signals.push(signal);
      // Reject on abort like fetch() does — the resource must swallow its own aborts.
      return new Promise<number>((_resolve, reject) => {
        signal.addEventListener("abort", () =>
          reject(new DOMException("aborted", "AbortError")),
        );
      });
    });
    expect(signals[0]?.aborted).toBe(false);
    page(2); // supersedes the first fetch
    expect(signals[0]?.aborted).toBe(true); // ...which is cancelled, not just ignored
    expect(signals[1]?.aborted).toBe(false);
    await settle();
    expect(r.error()).toBeUndefined(); // the self-inflicted AbortError never surfaces
    expect(r.loading()).toBe(true); // still waiting on the live fetch
    r.stop();
  });
  it("aborts the in-flight signal on stop()", () => {
    const signals: AbortSignal[] = [];
    const r = resource(
      (_prev, signal) =>
        new Promise<number>(() => {
          signals.push(signal);
        }),
    );
    expect(signals[0]?.aborted).toBe(false);
    r.stop();
    expect(signals[0]?.aborted).toBe(true);
  });
  it("still reports an external abort as an error", async () => {
    const r = resource(() =>
      Promise.reject(new DOMException("aborted", "AbortError")),
    );
    await settle();
    // An abort the resource did NOT initiate is a real failure of this fetch — surfaced.
    expect(r.error()).toBeInstanceOf(DOMException);
    r.stop();
  });
  it("ready latches on the first success and never resets", async () => {
    const page = state(1);
    const pendingFetches: Array<{
      resolve: (v: number) => void;
    }> = [];
    const r = resource(() => {
      page();
      const d = deferred<number>();
      pendingFetches.push(d);
      return d.promise;
    });
    expect(r.ready()).toBe(false); // first fetch in flight
    pendingFetches[0]?.resolve(10);
    await settle();
    expect(r.ready()).toBe(true);
    page(2); // refetch: loading returns, ready holds
    expect(r.loading()).toBe(true);
    expect(r.ready()).toBe(true);
    pendingFetches[1]?.resolve(20);
    await settle();
    expect(r.ready()).toBe(true);
    r.stop();
  });
  it("a first-fetch rejection leaves ready false until a success", async () => {
    let fail = true;
    const r = resource(() =>
      fail ? Promise.reject(new Error("boom")) : Promise.resolve(1),
    );
    await settle();
    expect(r.error()).toBeInstanceOf(Error);
    expect(r.ready()).toBe(false); // failed — still no data to show
    fail = false;
    r.refresh();
    await settle();
    expect(r.ready()).toBe(true);
    r.stop();
  });
  it("pending() aggregates loading across resources", async () => {
    const a = deferred<number>();
    const b = deferred<number>();
    const ra = resource(() => a.promise);
    const rb = resource(() => b.promise);
    const anyPending = pending(ra, rb);
    expect(anyPending()).toBe(true);
    a.resolve(1);
    await settle();
    expect(anyPending()).toBe(true); // rb still in flight
    b.resolve(2);
    await settle();
    expect(anyPending()).toBe(false);
    ra.refresh(); // one refetch flips the aggregate back on
    expect(anyPending()).toBe(true);
    await settle();
    expect(anyPending()).toBe(false);
    ra.stop();
    rb.stop();
  });
  it("ready still latches while the owning scope is paused", async () => {
    // pause() suspends effect re-runs (no new fetches), not data arrival: a fetch already in
    // flight settles and flips the latch, and consumers catch up on resume.
    const d = deferred<number>();
    let r!: ReturnType<typeof resource<number>>;
    const s = scope(() => {
      r = resource(() => d.promise);
    });
    s.pause();
    d.resolve(5);
    await settle();
    expect(r()).toBe(5);
    expect(r.ready()).toBe(true);
    s.stop();
  });
  it("ready stays readable (and frozen) after the owning scope stops", async () => {
    const d = deferred<number>();
    let r!: ReturnType<typeof resource<number>>;
    const s = scope(() => {
      r = resource(() => d.promise);
    });
    s.stop(); // disposes the driving effect and aborts the in-flight fetch
    d.resolve(5);
    await settle();
    expect(r.ready()).toBe(false); // the aborted first fetch never latched it
  });
  it("stops with an owning scope and ignores late settles after disposal", async () => {
    const d = deferred<number>();
    let r!: ReturnType<typeof resource<number>>;
    const s = scope(() => {
      r = resource(() => d.promise);
    });
    s.stop();
    d.resolve(5);
    await settle();
    expect(r()).toBeUndefined(); // disposed before the settle -> nothing written
    expect(r.loading()).toBe(true); // frozen at its pre-disposal reading
  });
});
