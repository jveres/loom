// @vitest-environment happy-dom

import { remove } from "loom/dom";
import { listen } from "loom/events";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
});
describe("listen", () => {
  it("hears the foreign target while the owner lives, and dies with the owner", () => {
    const owner = document.createElement("div");
    document.body.append(owner);
    const heard = vi.fn();
    listen(document, "keydown", heard, {
      owner: owner,
    });
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "a" }));
    expect(heard).toHaveBeenCalledOnce();
    remove(owner);
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "b" }));
    expect(heard).toHaveBeenCalledOnce(); // no zombie listener
  });
  it("the returned Stop removes it early, idempotently", () => {
    const owner = document.createElement("div");
    document.body.append(owner);
    const heard = vi.fn();
    const stop = listen(window, "resize", heard, {
      owner: owner,
    });
    stop();
    stop();
    window.dispatchEvent(new Event("resize"));
    expect(heard).not.toHaveBeenCalled();
    remove(owner);
  });
  it("passes listener options through (capture, once)", () => {
    const owner = document.createElement("div");
    const inner = document.createElement("span");
    owner.append(inner);
    document.body.append(owner);
    const order: string[] = [];
    listen(owner, "click", () => order.push("capture"), {
      owner: owner,
      capture: true,
    });
    inner.addEventListener("click", () => order.push("target"));
    inner.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(order).toEqual(["capture", "target"]);
    const onceHeard = vi.fn();
    listen(document, "focusin", onceHeard, {
      owner: owner,
      ...{ once: true },
    });
    document.dispatchEvent(new Event("focusin"));
    document.dispatchEvent(new Event("focusin"));
    expect(onceHeard).toHaveBeenCalledOnce();
    remove(owner);
  });
});
