// scrollFade(el, { size?, axis?, transition? }) — soft-edge masks on a scrollable container: content fades
// out at an edge exactly while more content lies beyond it. Behavior only,
// no styling opinions: the effect is a mask-image on the element itself,
// driven by scroll position and kept current across resizes and content
// changes. Returns a disposer that removes listeners and clears the mask.

export interface ScrollFadeOptions {
  /** Fade length in px (default 14). */
  readonly size?: number;
  /** Scroll axis to fade (default "y"). */
  readonly axis?: "x" | "y";
  /** Edge transition duration in ms (default 0). */
  readonly transition?: number;
}

const EPSILON = 4;
const START_STOP = "--loom-scroll-fade-start";
const END_STOP = "--loom-scroll-fade-end";
const registeredCSS = new WeakSet<object>();

function registerAnimatedStops(): boolean {
  if (typeof CSS === "undefined") return false;
  const css = CSS;
  if (typeof css.registerProperty !== "function") return false;
  if (registeredCSS.has(css)) return true;

  for (const name of [START_STOP, END_STOP]) {
    try {
      css.registerProperty({
        name,
        syntax: "<length>",
        inherits: false,
        initialValue: "0px",
      });
    } catch {
      // Another copy of Loom may already have registered the global name.
    }
  }
  registeredCSS.add(css);
  return true;
}

export function scrollFade(
  el: HTMLElement,
  options: ScrollFadeOptions = {},
): () => void {
  const size = options.size ?? 14;
  const horizontal = options.axis === "x";
  const direction = horizontal ? "to right" : "to bottom";
  const inset = "var(--scroll-fade-inset, 0px)";
  // The END twin: a host pinning content at the trailing edge (a
  // sticky bottom group) exempts it from the mask — the fade zone
  // ends where the pinned region begins, which stays fully opaque.
  const insetEnd = "var(--scroll-fade-inset-end, 0px)";
  const startStop = `var(${START_STOP}, 0px)`;
  const endStop = `var(${END_STOP}, 0px)`;
  const requestedDuration = options.transition ?? 0;
  const duration = Number.isFinite(requestedDuration)
    ? Math.max(0, requestedDuration)
    : 0;
  const view = el.ownerDocument.defaultView;
  const animateStops =
    duration > 0 &&
    view !== null &&
    typeof el.animate === "function" &&
    !view.matchMedia("(prefers-reduced-motion: reduce)").matches &&
    registerAnimatedStops();
  let start = -1;
  let end = -1;
  let startAnimation: Animation | undefined;
  let endAnimation: Animation | undefined;

  // Keep one gradient installed: mask-image itself animates discretely, while
  // registered length properties interpolate without flipping compositing.
  const fade = `linear-gradient(${direction}, #000 0, #000 ${inset}, transparent ${inset}, #000 calc(${inset} + ${startStop}), #000 calc(100% - ${insetEnd} - ${endStop}), transparent calc(100% - ${insetEnd}), #000 calc(100% - ${insetEnd}), #000 100%)`;
  // The mask covers the element's WHOLE paint — a classic scrollbar
  // included, whose ends faded with the content. Mask layers composite
  // ADDITIVELY by default, so a second solid layer sized to the
  // measured scrollbar gutter keeps that strip fully opaque; the fade
  // layer stops where the gutter begins. Gutter 0 (overlay scrollbars)
  // degrades to the single full-bleed fade.
  let gutter = -1;
  const applyMask = (nextGutter: number): void => {
    if (nextGutter === gutter) return;
    gutter = nextGutter;
    const styles = el.style;
    if (gutter <= 0) {
      styles.maskImage = fade;
      styles.webkitMaskImage = fade;
      styles.removeProperty("mask-size");
      styles.removeProperty("mask-position");
      styles.removeProperty("mask-repeat");
      styles.removeProperty("-webkit-mask-size");
      styles.removeProperty("-webkit-mask-position");
      styles.removeProperty("-webkit-mask-repeat");
      return;
    }
    const solid = "linear-gradient(#000, #000)";
    const mask = `${fade}, ${solid}`;
    const size = horizontal
      ? `100% calc(100% - ${gutter}px), 100% ${gutter}px`
      : `calc(100% - ${gutter}px) 100%, ${gutter}px 100%`;
    const position = horizontal ? "0 0, 0 100%" : "0 0, 100% 0";
    for (const prefix of ["", "-webkit-"] as const) {
      styles.setProperty(`${prefix}mask-image`, mask);
      styles.setProperty(`${prefix}mask-size`, size);
      styles.setProperty(`${prefix}mask-position`, position);
      styles.setProperty(`${prefix}mask-repeat`, "no-repeat");
    }
  };
  applyMask(0);

  const setStop = (
    property: string,
    next: number,
    previous: number,
    animation: Animation | undefined,
  ): Animation | undefined => {
    const nextValue = `${next}px`;
    if (!animateStops || view === null || previous < 0) {
      animation?.cancel();
      el.style.setProperty(property, nextValue);
      return undefined;
    }

    const currentValue =
      view.getComputedStyle(el).getPropertyValue(property).trim() ||
      `${previous}px`;
    animation?.cancel();
    el.style.setProperty(property, nextValue);
    if (currentValue === nextValue) return undefined;
    return el.animate(
      [{ [property]: currentValue }, { [property]: nextValue }],
      { duration, easing: "ease-out" },
    );
  };

  const sync = (): void => {
    const scrolled = horizontal ? el.scrollLeft : el.scrollTop;
    const overflow = horizontal
      ? el.scrollWidth - el.clientWidth
      : el.scrollHeight - el.clientHeight;
    // The cross-axis gutter (a classic scrollbar's track) stays
    // unmasked; measured here so classic/overlay and width changes
    // stay current.
    applyMask(
      horizontal
        ? el.offsetHeight - el.clientHeight
        : el.offsetWidth - el.clientWidth,
    );
    // Sticky-header allowance, CSS-driven (--scroll-fade-inset on the
    // host): the first N px stay fully visible — a sticky bar must
    // not be shadowed by its own container's fade — and the start
    // fade runs just below it (content emerging from under the bar). Keep the
    // variable in CSS so scroll events never need computed-style resolution.
    const nextStart = scrolled > EPSILON ? size : 0;
    const nextEnd = overflow - scrolled > EPSILON ? size : 0;
    if (nextStart === start && nextEnd === end) return;
    if (nextStart !== start) {
      startAnimation = setStop(START_STOP, nextStart, start, startAnimation);
    }
    if (nextEnd !== end) {
      endAnimation = setStop(END_STOP, nextEnd, end, endAnimation);
    }
    start = nextStart;
    end = nextEnd;
  };

  el.addEventListener("scroll", sync, { passive: true });
  // Box changes (panel resize) and content changes (rows added/removed,
  // branches expanded) both move the scrollable extent.
  const observer = new ResizeObserver(sync);
  observer.observe(el);
  for (const child of el.children) observer.observe(child);
  const mutations = new MutationObserver((records) => {
    for (const record of records) {
      for (const node of record.removedNodes) {
        if (node.nodeType === 1) observer.unobserve(node as Element);
      }
      for (const node of record.addedNodes) {
        if (node.nodeType === 1) observer.observe(node as Element);
      }
    }
    sync();
  });
  mutations.observe(el, { childList: true });
  sync();

  return () => {
    el.removeEventListener("scroll", sync);
    observer.disconnect();
    mutations.disconnect();
    startAnimation?.cancel();
    endAnimation?.cancel();
    el.style.removeProperty(START_STOP);
    el.style.removeProperty(END_STOP);
    el.style.maskImage = "";
    el.style.webkitMaskImage = "";
    for (const prefix of ["", "-webkit-"] as const) {
      el.style.removeProperty(`${prefix}mask-size`);
      el.style.removeProperty(`${prefix}mask-position`);
      el.style.removeProperty(`${prefix}mask-repeat`);
    }
  };
}
