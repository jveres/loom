// @vitest-environment happy-dom
// placeAfter: seat a node as a ref's next sibling — a strict no-op
// when already seated (the pre-insert removal of a plain insertBefore
// restarts css animations and drops focus in the moved subtree), a
// state-preserving move otherwise.

import { describe, expect, it, vi } from "vitest";
import { placeAfter, positionOrdered } from "./place.js";

function permutations(values: readonly number[]): number[][] {
  if (values.length === 0) return [[]];
  return values.flatMap((value, index) =>
    permutations(values.filter((_, i) => i !== index)).map((rest) => [
      value,
      ...rest,
    ]),
  );
}

// An exhaustive subset oracle, independent of the production patience-sorting algorithm.
function minimumMoves(order: readonly number[]): number {
  let longest = 0;
  for (let bits = 0; bits < 1 << order.length; bits++) {
    const subsequence = order.filter((_, i) => bits & (1 << i));
    if (
      subsequence.every(
        (value, i) => i === 0 || value > (subsequence[i - 1] as number),
      )
    ) {
      longest = Math.max(longest, subsequence.length);
    }
  }
  return order.length - longest;
}

describe("positionOrdered", () => {
  it("retains minimal moves for every five-node permutation", () => {
    for (const order of permutations([0, 1, 2, 3, 4])) {
      const parent = document.createElement("div");
      const nodes = order.map(() => document.createElement("i"));
      parent.append(...nodes);
      Object.defineProperty(parent, "moveBefore", { value: undefined });
      const insert = vi.spyOn(parent, "insertBefore");
      const desired = order.map((index) => nodes[index] as Node);

      positionOrdered(parent, desired, null);

      expect([...parent.childNodes]).toEqual(desired);
      expect(insert).toHaveBeenCalledTimes(minimumMoves(order));
    }
  });

  it("inserts around a contiguous region without moving its neighbors or existing rows", () => {
    const parent = document.createElement("div");
    const before = document.createElement("b");
    const a = document.createElement("i");
    const b = document.createElement("i");
    const end = document.createComment("end");
    const after = document.createElement("b");
    parent.append(before, a, b, end, after);
    const added = [0, 1, 2].map(() => document.createElement("s"));
    const desired = [
      added[0] as Node,
      a,
      added[1] as Node,
      b,
      added[2] as Node,
    ];
    const insert = vi.spyOn(parent, "insertBefore");

    positionOrdered(parent, desired, end);

    expect([...parent.childNodes]).toEqual([before, ...desired, end, after]);
    expect(insert).toHaveBeenCalledTimes(3);
    insert.mockClear();
    positionOrdered(parent, desired, end);
    expect(insert).not.toHaveBeenCalled();
  });

  it("preserves relative placement when unmanaged siblings interrupt a region", () => {
    const parent = document.createElement("div");
    const a = document.createElement("i");
    const b = document.createElement("i");
    const unrelated = document.createElement("b");
    parent.append(a, unrelated, b);
    const insert = vi.spyOn(parent, "insertBefore");
    positionOrdered(parent, [a, b], null);
    expect([...parent.childNodes]).toEqual([a, unrelated, b]);
    expect(insert).not.toHaveBeenCalled();
  });
});

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
