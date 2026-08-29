// @vitest-environment happy-dom
// placeAfter: seat a node as a ref's next sibling — a strict no-op
// when already seated (the pre-insert removal of a plain insertBefore
// restarts css animations and drops focus in the moved subtree), a
// state-preserving move otherwise.

import { describe, expect, it, vi } from "vitest";
import { placeAfter } from "./place.js";

describe("placeAfter", () => {
  it("seats the node after the ref", () => {
    const parent = document.createElement("div");
    const a = document.createElement("i");
    const b = document.createElement("i");
    parent.append(a, b);
    const box = document.createElement("s");
    placeAfter(a, box);
    expect(a.nextSibling).toBe(box);
    expect(box.nextSibling).toBe(b);
  });

  it("already seated is a STRICT no-op — no removal, no re-insert", () => {
    const parent = document.createElement("div");
    const a = document.createElement("i");
    const box = document.createElement("s");
    parent.append(a, box);
    const insert = vi.spyOn(parent, "insertBefore");
    placeAfter(a, box);
    expect(insert).not.toHaveBeenCalled();
    expect(a.nextSibling).toBe(box);
  });

  it("re-seats from elsewhere, and a parentless ref does nothing", () => {
    const parent = document.createElement("div");
    const a = document.createElement("i");
    const b = document.createElement("i");
    const box = document.createElement("s");
    parent.append(a, box, b);
    placeAfter(b, box);
    expect(b.nextSibling).toBe(box);
    const orphan = document.createElement("i");
    placeAfter(orphan, box); // ref without a parent: no-op
    expect(b.nextSibling).toBe(box);
  });
});
