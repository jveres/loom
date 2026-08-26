// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { coalesced, remove } from "./index.js";

describe("coalesced", () => {
  it("runs once per microtask however many requests land in the task, then again on the next", async () => {
    const run = vi.fn();
    const request = coalesced(run);
    request();
    request();
    request();
    expect(run).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(run).toHaveBeenCalledTimes(1);
    request();
    await Promise.resolve();
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("an owner's disposal drops a queued and every later request", async () => {
    const owner = document.createElement("div");
    document.body.append(owner);
    const run = vi.fn();
    const request = coalesced(run, owner);
    request();
    remove(owner);
    await Promise.resolve();
    request();
    await Promise.resolve();
    expect(run).not.toHaveBeenCalled();
  });
});
