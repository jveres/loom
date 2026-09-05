import { effect, state } from "loom";
import { lens } from "loom/model";
import { describe, expect, it } from "vitest";

describe("lens", () => {
  it("reads the member (tracked) and writes a copy of the record", () => {
    const settings = state({ theme: "light", width: 280 });
    const theme = lens(settings, "theme");
    const seen: string[] = [];
    const stop = effect(() => {
      seen.push(theme());
    });
    expect(seen).toEqual(["light"]);
    const before = settings();
    theme("dark");
    expect(settings()).toEqual({ theme: "dark", width: 280 });
    expect(settings()).not.toBe(before); // identity moves
    expect(seen).toEqual(["light", "dark"]);
    settings({ theme: "light", width: 300 });
    expect(seen).toEqual(["light", "dark", "light"]);
    stop();
  });
  it("an equal member is a no-op write; tuples copy as arrays", () => {
    const pair = state<[number, number]>([1, 2]);
    const second = lens(pair, 1);
    let writes = 0;
    const stop = effect(() => {
      pair();
      writes += 1;
    });
    second(2);
    expect(writes).toBe(1);
    second(5);
    expect(pair()).toEqual([1, 5]);
    expect(Array.isArray(pair())).toBe(true);
    expect(writes).toBe(2);
    stop();
  });
});
