// offsetIn(el, box) — where `el` sits inside `box`'s padding box, as
// numbers you can write straight into the style.left/top of absolute
// chrome parented at `box`: rect difference, corrected for the box's
// border (clientLeft/Top) and its scroll position. The non-scrolling
// twin of reveal()'s edge math. PRECONDITION: `box` must be `el`'s
// containing block (positioned) for the numbers to place anything —
// the caller owns that, exactly as with any absolute child.

export interface OffsetRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export function offsetIn(el: Element, box: HTMLElement): OffsetRect {
  const b = box.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  return {
    left: r.left - b.left - box.clientLeft + box.scrollLeft,
    top: r.top - b.top - box.clientTop + box.scrollTop,
    width: r.width,
    height: r.height,
  };
}
