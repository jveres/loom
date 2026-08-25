// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { listen, remove } from "./index.js";

afterEach(() => {
  document.body.replaceChildren();
});

describe("listen", () => {
  it("hears the foreign target while the owner lives, and dies with the owner", () => {
    const owner = document.createElement("div");
    document.body.append(owner);
    const heard = vi.fn();
    listen(owner, document, "keydown", heard);

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
    const stop = listen(owner, window, "resize", heard);
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
    listen(owner, owner, "click", () => order.push("capture"), true);
    inner.addEventListener("click", () => order.push("target"));
    inner.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    expect(order).toEqual(["capture", "target"]);

    const onceHeard = vi.fn();
    listen(owner, document, "focusin", onceHeard, { once: true });
    document.dispatchEvent(new Event("focusin"));
    document.dispatchEvent(new Event("focusin"));
    expect(onceHeard).toHaveBeenCalledOnce();
    remove(owner);
  });
});
