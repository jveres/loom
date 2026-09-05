// @vitest-environment happy-dom
import { keyedChild, onUnmount, remove } from "loom/dom";
// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  document.body.replaceChildren();
});
describe("keyedChild", () => {
  it("rebuilds the single child only when the key moves", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const place = keyedChild(host);
    const build = vi.fn(() => document.createElement("span"));
    place("a", build);
    const first = host.firstChild;
    place("a", build);
    expect(build).toHaveBeenCalledOnce();
    expect(host.firstChild).toBe(first); // no repaint on a same-key pass
    place("b", build);
    expect(build).toHaveBeenCalledTimes(2);
    expect(host.childNodes.length).toBe(1);
    expect(host.firstChild).not.toBe(first);
  });
  it("tears the replaced child down the Loom way, and the host's teardown releases the last", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const place = keyedChild(host);
    const torn: string[] = [];
    const build = (key: string) => () => {
      const el = document.createElement("span");
      onUnmount(el, () => torn.push(key));
      return el;
    };
    place("a", build("a"));
    place("b", build("b"));
    expect(torn).toEqual(["a"]);
    remove(host);
    expect(torn).toEqual(["a", "b"]);
  });
});
