// scrollFade(el) — soft-edge masks on a scrollable container: content fades
// out at an edge exactly while more content lies beyond it. Behavior only,
// no styling opinions: the effect is a mask-image on the element itself,
// driven by scroll position and kept current across resizes and content
// changes. Returns a disposer that removes listeners and clears the mask.

export interface ScrollFadeOptions {
  /** Fade length in px (default 14). */
  readonly size?: number;
}

const EPSILON = 4;

export function scrollFade(
  el: HTMLElement,
  options: ScrollFadeOptions = {},
): () => void {
  const size = options.size ?? 14;
  let top = -1;
  let bottom = -1;

  const sync = (): void => {
    const nextTop = el.scrollTop > EPSILON ? size : 0;
    const nextBottom =
      el.scrollHeight - el.clientHeight - el.scrollTop > EPSILON ? size : 0;
    if (nextTop === top && nextBottom === bottom) return;
    top = nextTop;
    bottom = nextBottom;
    const mask =
      top === 0 && bottom === 0
        ? ""
        : `linear-gradient(to bottom, transparent 0, #000 ${top}px, #000 calc(100% - ${bottom}px), transparent 100%)`;
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
