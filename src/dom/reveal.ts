// The REVEAL law: scroll the BOX only. `scrollIntoView` scrolls EVERY
// scrollable ancestor, and any ancestor with slack yanks the page —
// with the browser zoomed the window itself gains scroll range, and
// selecting a row scrolled the whole app away. These helpers touch one
// scroller's scrollTop and nothing else.
//
// - scrollParent(el): the nearest overflow auto/scroll ancestor, never
//   the body or the document (the page is never a reveal target).
// - nearestScroller(el): the nearest scroll ancestor WITH slack — the
//   box a reveal can meaningfully move; null when nothing above
//   scrolls, and then NOT scrolling is the law (a caller that must
//   degrade to the window does so knowingly).
// - scrollNearest(box, el): scrollIntoView's "nearest" — the minimal
//   scroll that shows el (taller-than-box aligns its nearer edge).
// - scrollCentered(box, el): land the eye — el's middle at the box's.
// - reveal(el, options): the composed verb — `scroller` (an element, a
//   closest() selector, or the nearest with slack), `align` ("nearest"
//   default, "center"), `ifHidden` (only when NO sliver of el shows in
//   the scrollport — a visible element must never move; a
//   taller-than-viewport one would otherwise snap on every reveal).
//   Returns whether a scroller was found (false = nothing moved).

export interface RevealOptions {
  readonly scroller?: HTMLElement | string;
  readonly align?: "nearest" | "center";
  readonly ifHidden?: boolean;
}

export function scrollParent(el: Element): HTMLElement | null {
  const body = el.ownerDocument.body;
  for (let p = el.parentElement; p && p !== body; p = p.parentElement) {
    const overflow = getComputedStyle(p).overflowY;
    if (overflow === "auto" || overflow === "scroll") return p;
  }
  return null;
}

export function nearestScroller(el: Element): HTMLElement | null {
  for (let box = scrollParent(el); box; box = scrollParent(box)) {
    if (box.scrollHeight > box.clientHeight) return box;
  }
  return null;
}

export function scrollNearest(box: HTMLElement, el: Element): void {
  const b = box.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  if (r.top < b.top) {
    box.scrollTop += Math.max(r.top - b.top, r.bottom - b.bottom);
  } else if (r.bottom > b.bottom) {
    box.scrollTop += Math.min(r.top - b.top, r.bottom - b.bottom);
  }
}

export function scrollCentered(box: HTMLElement, el: Element): void {
  const b = box.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  box.scrollTop += (r.top + r.bottom) / 2 - (b.top + b.bottom) / 2;
}

export function reveal(el: Element, options: RevealOptions = {}): boolean {
  const box =
    typeof options.scroller === "string"
      ? el.closest<HTMLElement>(options.scroller)
      : (options.scroller ?? nearestScroller(el));
  if (!box) return false;
  if (options.ifHidden) {
    const b = box.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    if (r.bottom > b.top && r.top < b.bottom) return true; // a sliver shows
  }
  if (options.align === "center") scrollCentered(box, el);
  else scrollNearest(box, el);
  return true;
}
