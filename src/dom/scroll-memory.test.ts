// @vitest-environment happy-dom

import { remove } from "loom/dom";
import { scrollMemory } from "loom/layout";
import { keyedStates } from "loom/model";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

const microtask = (): Promise<void> => Promise.resolve();
afterEach(() => {
  vi.useRealTimers();
  document.body.replaceChildren();
});
describe("scrollMemory", () => {
  it("persists per key from the host's scroll events and restores after the swap", async () => {
    vi.useFakeTimers();
    const host = document.createElement("div");
    document.body.append(host);
    const cells = keyedStates<Record<string, number>>();
    const memory = scrollMemory(host, (key) => cells.value(`scroll:${key}`, 0));
    memory.restore("a");
    await microtask();
    vi.advanceTimersByTime(50); // the restore window closes next frame
    host.scrollTop = 120;
    host.dispatchEvent(new Event("scroll"));
    expect(cells.value("scroll:a", 0)()).toBe(120);
    memory.restore("b"); // the swap clamps to 0 and fires BEFORE the restore microtask
    host.scrollTop = 0;
    host.dispatchEvent(new Event("scroll"));
    expect(cells.value("scroll:a", 0)()).toBe(120); // the clamp never persisted
    await microtask();
    expect(host.scrollTop).toBe(0); // b's seed
    memory.restore("a");
    await microtask();
    expect(host.scrollTop).toBe(120);
  });
  it("dies with the host: no persistence, no pending restore", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const cells = keyedStates<Record<string, number>>();
    const memory = scrollMemory(host, (key) => cells.value(key, 0));
    cells.value("a", 0)(77);
    memory.restore("a");
    remove(host);
    await microtask();
    expect(host.scrollTop).toBe(0);
    host.scrollTop = 5;
    host.dispatchEvent(new Event("scroll"));
    expect(cells.value("a", 0)()).toBe(77);
  });
});
