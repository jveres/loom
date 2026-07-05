// scrollFade(el, { size?, axis? }) — soft-edge masks on a scrollable container: content fades
// out at an edge exactly while more content lies beyond it. Behavior only,
// no styling opinions: the effect is a mask-image on the element itself,
// driven by scroll position and kept current across resizes and content
// changes. Returns a disposer that removes listeners and clears the mask.

export interface ScrollFadeOptions {
  /** Fade length in px (default 14). */
  readonly size?: number;
  /** Scroll axis to fade (default "y"). */
  readonly axis?: "x" | "y";
}

const EPSILON = 4;

export function scrollFade(
  el: HTMLElement,
  options: ScrollFadeOptions = {},
): () => void {
  const size = options.size ?? 14;
  const horizontal = options.axis === "x";
  const direction = horizontal ? "to right" : "to bottom";
  let start = -1;
  let end = -1;

  const sync = (): void => {
    const scrolled = horizontal ? el.scrollLeft : el.scrollTop;
    const overflow = horizontal
      ? el.scrollWidth - el.clientWidth
      : el.scrollHeight - el.clientHeight;
    const nextStart = scrolled > EPSILON ? size : 0;
    const nextEnd = overflow - scrolled > EPSILON ? size : 0;
    if (nextStart === start && nextEnd === end) return;
    start = nextStart;
    end = nextEnd;
    // No-fade state is an OPAQUE mask, not no mask: clearing mask-image moves
    // the element off the masked raster path, and the compositing flip when a
    // fade first appears shows up as a one-frame flash (found by seam, which
    // worked around it with a permanent base mask in CSS).
    const mask =
      start === 0 && end === 0
        ? "linear-gradient(#000 0 0)"
        : `linear-gradient(${direction}, transparent 0, #000 ${start}px, #000 calc(100% - ${end}px), transparent 100%)`;
    el.style.maskImage = mask;
    // Safari still needs the prefixed property.
    el.style.webkitMaskImage = mask;
  };

  el.addEventListener("scroll", sync, { passive: true });
  // Box changes (panel resize) and content changes (rows added/removed,
  // branches expanded) both move the scrollable extent.
  const observer = new ResizeObserver(sync);
  observer.observe(el);
  for (const child of el.children) observer.observe(child);
  const mutations = new MutationObserver(() => {
    observer.disconnect();
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    sync();
  });
  mutations.observe(el, { childList: true });
  sync();

  return () => {
    el.removeEventListener("scroll", sync);
    observer.disconnect();
    mutations.disconnect();
    el.style.maskImage = "";
    el.style.webkitMaskImage = "";
  };
}
