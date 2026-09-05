// @vitest-environment happy-dom

import { onUnmount, remove } from "loom/dom";
import { eventOrTimeout } from "loom/schedule";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
  vi.useRealTimers();
});
describe("deadline", () => {
  it("the event wins the race: run receives it once, the timer never fires", () => {
    vi.useFakeTimers();
    const owner = document.createElement("div");
    document.body.append(owner);
    const ran = vi.fn();
    onUnmount(
      owner,
      eventOrTimeout(window, "click", ran, {
        timeoutMs: 500,
      }),
    );
    window.dispatchEvent(new MouseEvent("click"));
    expect(ran).toHaveBeenCalledOnce();
    expect(ran.mock.calls[0]?.[0]).toBeInstanceOf(Event);
    // The loser is torn down — neither the deadline nor a second
    // event runs it again.
    window.dispatchEvent(new MouseEvent("click"));
    vi.advanceTimersByTime(1000);
    expect(ran).toHaveBeenCalledOnce();
  });
  it("the deadline wins: run(undefined) once, the listener is gone", () => {
    vi.useFakeTimers();
    const owner = document.createElement("div");
    document.body.append(owner);
    const ran = vi.fn();
    onUnmount(
      owner,
      eventOrTimeout(window, "click", ran, {
        timeoutMs: 300,
      }),
    );
    vi.advanceTimersByTime(300);
    expect(ran).toHaveBeenCalledOnce();
    expect(ran.mock.calls[0]?.[0]).toBeUndefined();
    window.dispatchEvent(new MouseEvent("click"));
    expect(ran).toHaveBeenCalledOnce();
  });
  it("the Stop cancels the race without running; idempotent", () => {
    vi.useFakeTimers();
    const owner = document.createElement("div");
    document.body.append(owner);
    const ran = vi.fn();
    const stop = onUnmount(
      owner,
      eventOrTimeout(window, "click", ran, {
        timeoutMs: 100,
      }),
    );
    stop();
    stop();
    window.dispatchEvent(new MouseEvent("click"));
    vi.advanceTimersByTime(500);
    expect(ran).not.toHaveBeenCalled();
  });
  it("dies with the owner (the listen law)", () => {
    vi.useFakeTimers();
    const owner = document.createElement("div");
    document.body.append(owner);
    const ran = vi.fn();
    onUnmount(
      owner,
      eventOrTimeout(document, "keydown", ran, {
        timeoutMs: 100,
      }),
    );
    remove(owner);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    vi.advanceTimersByTime(500);
    expect(ran).not.toHaveBeenCalled();
  });
  it("run may re-arm on the same target — the first race is fully down before it runs", () => {
    vi.useFakeTimers();
    const owner = document.createElement("div");
    document.body.append(owner);
    const second = vi.fn();
    onUnmount(
      owner,
      eventOrTimeout(
        window,
        "click",
        () => {
          onUnmount(
            owner,
            eventOrTimeout(window, "click", second, {
              timeoutMs: 100,
            }),
          );
        },
        {
          timeoutMs: 100,
        },
      ),
    );
    window.dispatchEvent(new MouseEvent("click")); // fires the first, arms the second
    expect(second).not.toHaveBeenCalled();
    window.dispatchEvent(new MouseEvent("click"));
    expect(second).toHaveBeenCalledOnce();
  });
});
