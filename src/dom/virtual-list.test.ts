// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { onUnmount } from "./index.js";
import { type ListSource, virtualList } from "./virtual-list.js";

const ROW = 10;
const VIEW = 100;

// Mount a vlist inside a scroller with stubbed geometry (happy-dom does no
// layout): the scroller viewport is VIEW px tall and `scrolled` px into the
// list — the two rects are what reconcile() derives the window from.
function mount(
  overscan = 0,
  render: (n: number, reuse: HTMLElement | null) => HTMLElement = (
    n,
    reuse,
  ) => {
    const row = reuse ?? document.createElement("div");
    row.textContent = String(n);
    return row;
  },
) {
  const scroller = document.createElement("div");
  document.body.append(scroller);
  const vl = virtualList<number>({
    rowHeight: ROW,
    overscan,
    key: (n) => n,
    render,
  });
  scroller.append(vl.el);
  let scrolled = 0;
  Object.defineProperty(scroller, "clientHeight", { get: () => VIEW });
  scroller.getBoundingClientRect = () => ({ top: 0, height: VIEW }) as DOMRect;
  vl.el.getBoundingClientRect = () => ({ top: -scrolled }) as DOMRect;
  const rows = () =>
    [...vl.el.children].filter((c) => c.textContent !== "") as HTMLElement[];
  return { vl, rows, setScroll: (px: number) => (scrolled = px) };
}

describe("virtualList", () => {
  it("mounts only the visible window, not the whole list", () => {
    const { vl, rows } = mount();
    vl.setItems(Array.from({ length: 1000 }, (_, i) => i));
    expect(rows().length).toBe(VIEW / ROW); // 10 of 1000
    expect(rows()[0]?.textContent).toBe("0");
    vl.destroy();
  });

  it("windows follow scroll and reuse row elements", () => {
    const { vl, rows, setScroll } = mount();
    const items = Array.from({ length: 1000 }, (_, i) => i);
    vl.setItems(items);
    const firstWindow = rows();

    setScroll(500); // rows 50..59
    vl.refresh();
    const texts = rows().map((r) => r.textContent);
    expect(texts[0]).toBe("50");
    expect(texts.length).toBe(10);

    // Same items re-set: identical keys keep identical elements (reuse).
    setScroll(0);
    vl.setItems(items);
    const again = rows();
    expect(again[0]).not.toBe(firstWindow[0]); // 0 was evicted at 500 and rebuilt…
    vl.setItems(items);
    expect(rows()[0]).toBe(again[0]); // …but a re-render in place reuses it
    vl.destroy();
  });

  it("accepts a lazy ListSource and skips undefined holes", () => {
    const { vl, rows } = mount();
    const source: ListSource<number> = {
      length: 100,
      at: (i) => (i === 3 ? undefined : i),
    } as ListSource<number>;
    vl.setItems(source);
    const texts = rows().map((r) => r.textContent);
    expect(texts).not.toContain("3"); // hole skipped, no crash
    expect(texts).toContain("4");
    vl.destroy();
  });

  it("destroy clears rows and survives further calls", () => {
    const { vl, rows } = mount();
    vl.setItems([1, 2, 3]);
    expect(rows().length).toBe(3);
    vl.destroy();
    expect(vl.el.children.length).toBe(0);
    vl.refresh(); // must not throw after destroy
  });

  it("does not rerender unchanged stationary rows during refresh or scroll", () => {
    let renders = 0;
    const { vl, setScroll } = mount(0, (n, reuse) => {
      renders++;
      const row = reuse ?? document.createElement("div");
      row.textContent = String(n);
      return row;
    });
    vl.setItems(Array.from({ length: 100 }, (_, i) => i));
    expect(renders).toBe(10);

    vl.refresh();
    expect(renders).toBe(10);

    setScroll(10); // rows 1..10: only the entering row needs rendering
    vl.refresh();
    expect(renders).toBe(11);
    vl.destroy();
  });

  it("disposes owned row lifecycles on replacement, eviction, and destroy", () => {
    const disposed: number[] = [];
    let replace = false;
    const { vl, setScroll } = mount(0, (n, reuse) => {
      if (reuse && !replace) return reuse;
      const row = document.createElement("div");
      row.textContent = String(n);
      onUnmount(row, () => disposed.push(n));
      return row;
    });
    const items = Array.from({ length: 100 }, (_, i) => i);
    vl.setItems(items);

    replace = true;
    vl.setItems(items);
    expect(disposed).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);

    replace = false;
    setScroll(500);
    vl.refresh();
    expect(disposed).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
    ]);

    vl.destroy();
    expect(disposed).toEqual([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 50, 51, 52,
      53, 54, 55, 56, 57, 58, 59,
    ]);
  });
});
