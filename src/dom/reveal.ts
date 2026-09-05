export type RevealAxis = "x" | "y";

export interface ScrollOptions {
  readonly axis?: RevealAxis;
  /** Clearance in px kept between el and the box's edge. */
  readonly margin?: number;
  /** "smooth" scrolls with the browser's animation; default instant. */
  readonly behavior?: ScrollBehavior;
}

export interface RevealOptions extends ScrollOptions {
  readonly scroller?: HTMLElement | string;
  readonly align?: "nearest" | "center";
  readonly ifHidden?: boolean;
}

export interface FindScrollerOptions {
  readonly axis?: RevealAxis;
  readonly requireOverflow?: boolean;
}

export function findScroller(
  el: Element,
  options: FindScrollerOptions = {},
): HTMLElement | null {
  const body = el.ownerDocument.body;
  const axis = options.axis ?? "y";
  const realm = el.ownerDocument.defaultView ?? globalThis;
  for (
    let parent = el.parentElement;
    parent && parent !== body;
    parent = parent.parentElement
  ) {
    const style = realm.getComputedStyle(parent);
    const overflow = axis === "x" ? style.overflowX : style.overflowY;
    if (overflow !== "auto" && overflow !== "scroll") continue;
    if (
      options.requireOverflow &&
      !(axis === "x"
        ? parent.scrollWidth > parent.clientWidth
        : parent.scrollHeight > parent.clientHeight)
    )
      continue;
    return parent;
  }
  return null;
}

const edges = (
  box: HTMLElement,
  el: Element,
  axis: RevealAxis,
  margin: number,
): { start: number; end: number; boxStart: number; boxEnd: number } => {
  const b = box.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return axis === "x"
    ? {
        start: r.left - margin,
        end: r.right + margin,
        boxStart: b.left,
        boxEnd: b.right,
      }
    : {
        start: r.top - margin,
        end: r.bottom + margin,
        boxStart: b.top,
        boxEnd: b.bottom,
      };
};

const scrollBy = (
  box: HTMLElement,
  delta: number,
  axis: RevealAxis,
  behavior: ScrollBehavior | undefined,
): void => {
  if (delta === 0) return;
  if (behavior !== undefined && typeof box.scrollTo === "function") {
    box.scrollTo(
      axis === "x"
        ? { left: box.scrollLeft + delta, behavior }
        : { top: box.scrollTop + delta, behavior },
    );
    return;
  }
  if (axis === "x") box.scrollLeft += delta;
  else box.scrollTop += delta;
};

function scrollNearest(
  box: HTMLElement,
  el: Element,
  options: ScrollOptions = {},
): void {
  const axis = options.axis ?? "y";
  const { start, end, boxStart, boxEnd } = edges(
    box,
    el,
    axis,
    options.margin ?? 0,
  );
  if (start < boxStart) {
    scrollBy(
      box,
      Math.max(start - boxStart, end - boxEnd),
      axis,
      options.behavior,
    );
  } else if (end > boxEnd) {
    scrollBy(
      box,
      Math.min(start - boxStart, end - boxEnd),
      axis,
      options.behavior,
    );
  }
}

function scrollCentered(
  box: HTMLElement,
  el: Element,
  options: ScrollOptions = {},
): void {
  const axis = options.axis ?? "y";
  const { start, end, boxStart, boxEnd } = edges(box, el, axis, 0);
  scrollBy(
    box,
    (start + end) / 2 - (boxStart + boxEnd) / 2,
    axis,
    options.behavior,
  );
}

export function reveal(el: Element, options: RevealOptions = {}): boolean {
  const axis = options.axis ?? "y";
  const box =
    typeof options.scroller === "string"
      ? el.closest<HTMLElement>(options.scroller)
      : (options.scroller ?? findScroller(el, { axis, requireOverflow: true }));
  if (!box) return false;
  if (options.ifHidden) {
    const { start, end, boxStart, boxEnd } = edges(box, el, axis, 0);
    if (end > boxStart && start < boxEnd) return true; // a sliver shows
  }
  if (options.align === "center") scrollCentered(box, el, options);
  else scrollNearest(box, el, options);
  return true;
}
