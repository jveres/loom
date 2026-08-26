// The REVEAL law: scroll the BOX only. `scrollIntoView` scrolls EVERY
// scrollable ancestor, and any ancestor with slack yanks the page —
// with the browser zoomed the window itself gains scroll range, and
// selecting a row scrolled the whole app away. These helpers touch one
// scroller's scroll position and nothing else.
//
// - scrollParent(el, axis?): the nearest overflow auto/scroll ancestor
//   on the axis (y default), never the body or the document (the page
//   is never a reveal target).
// - nearestScroller(el, axis?): the nearest scroll ancestor WITH slack
//   — the box a reveal can meaningfully move; null when nothing above
//   scrolls, and then NOT scrolling is the law (a caller that must
//   degrade to the window does so knowingly).
// - scrollNearest(box, el, options?): scrollIntoView's "nearest" — the
//   minimal scroll that shows el (taller-than-box aligns its nearer
//   edge), with `margin` px of clearance (a fade mask, a sticky
//   header) and an optional smooth `behavior`.
// - scrollCentered(box, el, options?): land the eye — el's middle at
//   the box's.
// - reveal(el, options): the composed verb — `scroller` (an element, a
//   closest() selector, or the nearest with slack), `align` ("nearest"
//   default, "center"), `ifHidden` (only when NO sliver of el shows in
//   the scrollport — a visible element must never move; a
//   taller-than-viewport one would otherwise snap on every reveal),
//   `axis` ("y" default, "x" for a strip), `margin`, `behavior`.
//   Returns whether a scroller was found (false = nothing moved).

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

export function scrollParent(
  el: Element,
  axis: RevealAxis = "y",
): HTMLElement | null {
  const body = el.ownerDocument.body;
  for (let p = el.parentElement; p && p !== body; p = p.parentElement) {
    const style = getComputedStyle(p);
    const overflow = axis === "x" ? style.overflowX : style.overflowY;
    if (overflow === "auto" || overflow === "scroll") return p;
  }
  return null;
}

export function nearestScroller(
  el: Element,
  axis: RevealAxis = "y",
): HTMLElement | null {
  for (let box = scrollParent(el, axis); box; box = scrollParent(box, axis)) {
    const slack =
      axis === "x"
        ? box.scrollWidth > box.clientWidth
        : box.scrollHeight > box.clientHeight;
    if (slack) return box;
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

export function scrollNearest(
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

export function scrollCentered(
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
      : (options.scroller ?? nearestScroller(el, axis));
  if (!box) return false;
  if (options.ifHidden) {
    const { start, end, boxStart, boxEnd } = edges(box, el, axis, 0);
    if (end > boxStart && start < boxEnd) return true; // a sliver shows
  }
  if (options.align === "center") scrollCentered(box, el, options);
  else scrollNearest(box, el, options);
  return true;
}
