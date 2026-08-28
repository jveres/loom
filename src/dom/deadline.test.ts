// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { deadline, remove } from "./index.js";

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
    deadline(owner, window, "click", 500, ran);

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
    deadline(owner, window, "click", 300, ran);

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
    const stop = deadline(owner, window, "click", 100, ran);
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
    deadline(owner, document, "keydown", 100, ran);
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
    deadline(owner, window, "click", 100, () => {
      deadline(owner, window, "click", 100, second);
    });
    window.dispatchEvent(new MouseEvent("click")); // fires the first, arms the second
    expect(second).not.toHaveBeenCalled();
    window.dispatchEvent(new MouseEvent("click"));
    expect(second).toHaveBeenCalledOnce();
  });
});
