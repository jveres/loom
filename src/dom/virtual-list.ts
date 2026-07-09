// A minimal fixed-row-height windowing list: only the rows in (and just around) the viewport are
// kept in the DOM. `el` is an in-flow, full-height holder (a spacer sets its height) meant to be
// placed inside an existing scroll container — it does not introduce its own scrollbar; the visible
// window is computed from that parent's scroll position. Rows are positioned with translateY (a
// compositor transform, no per-row layout). `render(item, reuse)` creates a row when reuse is null,
// else updates it in place. Standalone from the full DOM binding entrypoint; it shares only Loom's
// small node-ownership layer so reactive rows are torn down correctly.
//
// Contract: the elements returned by `render` must be absolutely positioned within `el` (which this
// module sets to `position: relative`); this module only sets their `transform`. Rows participate in
// Loom's node ownership: replacement, eviction, and destroy dispose their subtree before removal.

import { dispose, remove } from "./ownership-base.js";

// The backing data: the windower needs only the total count (for scroll height) and random access
// to the items currently in the viewport — never the whole list. A plain array satisfies this
// (`length` + `Array.prototype.at`), or pass a lazy `{ length, at }` to avoid materializing every
// item each update (the visible window builds only ~viewport-height items).
export interface ListSource<T> {
  readonly length: number;
  at(index: number): T | undefined;
}

export interface VirtualList<T> {
  /** The holder element to mount inside a scroll container. */
  readonly el: HTMLElement;
  /** Replace the backing source and re-window. */
  setItems(source: ListSource<T>): void;
  /** Recompute the window against the current scroll position. */
  refresh(): void;
  /** Scroll the parent container to the end of the list. */
  scrollToEnd(): void;
  /** Scroll so the row at `index` is centered in the viewport. */
  scrollToIndex(index: number): void;
  /** Detach listeners and clear mounted rows. */
  destroy(): void;
}

export interface VirtualListOptions<T> {
  /** Uniform row height in pixels. */
  readonly rowHeight: number;
  /** Stable identity for an item, so a row can be reused across windows. */
  readonly key: (item: T) => string | number;
  /** Build a row when `reuse` is null, else update `reuse` in place and return it. */
  readonly render: (item: T, reuse: HTMLElement | null) => HTMLElement;
  /** Extra rows rendered above and below the viewport (default 6). */
  readonly overscan?: number;
}

export function virtualList<T>(options: VirtualListOptions<T>): VirtualList<T> {
  const h = options.rowHeight;
  const overscan = options.overscan ?? 6;
  const el = document.createElement("div");
  el.style.position = "relative";
  const sizer = document.createElement("div");
  sizer.style.cssText = "width:1px;pointer-events:none";
  el.append(sizer);
  let items: ListSource<T> = [];
  interface MountedRow {
    row: HTMLElement;
    /** Source revision/index last rendered; unchanged stationary rows need no render call. */
    revision: number;
    index: number;
  }
  const mounted = new Map<string | number, MountedRow>();
  let scroller: HTMLElement | null = null;
  let raf = 0;
  let revision = 0;

  const throwDisposalErrors = (errors: unknown[]): void => {
    if (errors.length === 1) throw errors[0];
    if (errors.length > 1) {
      throw new AggregateError(
        errors,
        "Multiple virtual-list rows failed to dispose.",
      );
    }
  };

  const reconcile = (): void => {
    const sp = scroller;
    if (!sp) return;
    const vh = sp.clientHeight;
    if (vh === 0) return; // hidden (e.g. inactive tab); reconciles again when shown
    // How far el's top sits above the scroll viewport's top = the scroll offset into the list.
    const offset =
      sp.getBoundingClientRect().top - el.getBoundingClientRect().top;
    const total = items.length;
    let start = Math.floor(offset / h) - overscan;
    if (start < 0) start = 0;
    let end = Math.ceil((offset + vh) / h) + overscan;
    if (end > total) end = total;
    const live = new Set<string | number>();
    const disposalErrors: unknown[] = [];
    for (let i = start; i < end; i++) {
      // `at` is caller-supplied on ListSource; a lazy source whose length/at disagree could return
      // undefined inside the window. Skip rather than feed undefined to key()/render() typed as T.
      const item = items.at(i);
      if (item === undefined) continue;
      const k = options.key(item);
      live.add(k);
      const existing = mounted.get(k);
      if (
        existing !== undefined &&
        existing.revision === revision &&
        existing.index === i
      ) {
        continue;
      }
      const previousRow = existing?.row ?? null;
      const row = options.render(item, previousRow);
      row.style.transform = `translateY(${i * h}px)`;
      if (existing === undefined) {
        el.append(row);
      } else if (row !== existing.row) {
        // render() is meant to update `existing` in place, but tolerate a fresh element too.
        existing.row.before(row);
        // Publish the replacement before cleanup: remove() still detaches the old row when one of
        // its disposers throws, and the list must not retain that detached element afterward.
        mounted.set(k, { row, revision, index: i });
        try {
          remove(existing.row);
        } catch (error) {
          disposalErrors.push(error);
        }
        continue;
      }
      mounted.set(k, { row, revision, index: i });
    }
    for (const [k, entry] of mounted)
      if (!live.has(k)) {
        mounted.delete(k);
        try {
          remove(entry.row);
        } catch (error) {
          disposalErrors.push(error);
        }
      }
    throwDisposalErrors(disposalErrors);
  };

  const schedule = (): void => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      reconcile();
    });
  };

  // The scroll container is resolved on first reconcile (el must be mounted first).
  const ensureScroller = (): void => {
    if (scroller) return;
    const sp = el.parentElement;
    if (!sp) return;
    scroller = sp;
    sp.addEventListener("scroll", schedule, { passive: true });
  };

  return {
    el,
    setItems(next) {
      items = next;
      revision++;
      sizer.style.height = `${items.length * h}px`;
      ensureScroller();
      reconcile();
    },
    refresh() {
      ensureScroller();
      reconcile();
    },
    scrollToEnd() {
      if (scroller) scroller.scrollTop = scroller.scrollHeight;
    },
    scrollToIndex(index) {
      if (!scroller) return;
      scroller.scrollTop = Math.max(
        0,
        index * h - (scroller.clientHeight - h) / 2,
      );
      reconcile();
    },
    destroy() {
      if (raf) cancelAnimationFrame(raf);
      scroller?.removeEventListener("scroll", schedule);
      scroller = null;
      let disposalFailed = false;
      let disposalError: unknown;
      try {
        dispose(el);
      } catch (error) {
        disposalFailed = true;
        disposalError = error;
      }
      mounted.clear();
      el.replaceChildren();
      if (disposalFailed) throw disposalError;
    },
  };
}
