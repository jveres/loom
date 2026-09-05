// @vitest-environment happy-dom

import { onUnmount, remove } from "loom/dom";
import { microtaskCoalescer } from "loom/schedule";
// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";

describe("coalesced", () => {
  it("runs once per microtask however many requests land in the task, then again on the next", async () => {
    const run = vi.fn();
    const request = microtaskCoalescer(run);
    request.request();
    request.request();
    request.request();
    expect(run).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(run).toHaveBeenCalledTimes(1);
    request.request();
    await Promise.resolve();
    expect(run).toHaveBeenCalledTimes(2);
  });
  it("an owner's disposal drops a queued and every later request", async () => {
    const owner = document.createElement("div");
    document.body.append(owner);
    const run = vi.fn();
    const request = microtaskCoalescer(run);
    onUnmount(owner, request.stop);
    request.request();
    remove(owner);
    await Promise.resolve();
    request.request();
    await Promise.resolve();
    expect(run).not.toHaveBeenCalled();
  });
});
