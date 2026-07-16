// scrollFade(el, { size?, axis?, transition? }) — soft-edge masks on a scrollable container: content fades
// out at an edge exactly while more content lies beyond it. Behavior only,
// no styling opinions: the effect is a layered mask on the element itself,
// driven by scroll position and kept current across resizes and content
// changes. Returns a disposer that removes listeners and clears the mask.
//
// Mask geometry (after Jhey Tompkins' scroll-mask pens): the fades are
// SUBTRACT layers over an always-opaque base, composited with
// `mask-composite: exclude`. The base spans the whole box, so whatever the
// fade layers don't reach stays opaque — most importantly a classic
// scrollbar's gutter, which the host exempts declaratively by setting
// `--scroll-fade-gutter` to the scrollbar's width (the fades are sized
// that much short of the box on the cross axis). Fail-safe in the right
// direction: a carve narrower than the real scrollbar fades a sliver of
// it, a wider one merely leaves a sliver of content unfaded.

import { effect } from "../loom.js";
import { mediaRead } from "./media-read.js";

export interface ScrollFadeOptions {
  /** Fade length in px (default 14). */
  readonly size?: number;
  /** Scroll axis to fade (default "y"). */
  readonly axis?: "x" | "y";
  /** Edge transition duration in ms (default 0). */
  readonly transition?: number;
}

const EPSILON = 4;
// prefers-reduced-motion is a USER preference — one value across
// every window, so the global pooled read serves iframe-mounted
// elements too (unlike geometry queries, which are per-window).
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";
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
    registerAnimatedStops();
  // LIVE for the fade's lifetime (the one-shot read went stale when
  // the OS setting flipped mid-session): the effect exists ONLY to
  // hold the pooled mediaRead observed (connected, resynced); every
  // stop update reads the source directly, so a flip gates the very
  // next update — no effect-schedule lag.
  const reduceMotion = animateStops ? mediaRead(REDUCE_MOTION) : null;
  const stopReduceMotion = reduceMotion
    ? effect(() => {
        reduceMotion();
      })
    : null;
  let start = -1;
  let end = -1;
  let startAnimation: Animation | undefined;
  let endAnimation: Animation | undefined;

  // Keep one gradient pair installed: mask-image itself animates discretely,
  // while registered length properties interpolate without flipping
  // compositing. The fade layer is the INVERSE of the visible result (its
  // alpha is what `exclude` subtracts from the opaque base): solid exactly
  // where content should vanish, transparent where it stays.
  const gutter = "var(--scroll-fade-gutter, 0px)";
  const fade = `linear-gradient(${direction}, transparent 0, transparent ${inset}, #000 ${inset}, transparent calc(${inset} + ${startStop}), transparent calc(100% - ${insetEnd} - ${endStop}), #000 calc(100% - ${insetEnd}), transparent calc(100% - ${insetEnd}), transparent 100%)`;
  const layers = `${fade}, linear-gradient(#000, #000)`;
  const layerSizes = horizontal
    ? `100% calc(100% - ${gutter}), 100% 100%`
    : `calc(100% - ${gutter}) 100%, 100% 100%`;
  // Longhand camelCase assignments: happy-dom drops setProperty for names
  // it doesn't know, and Safari still needs the prefixed family (with the
  // legacy `xor` keyword standing in for `exclude`; engines that alias the
  // prefixed property to the standard one reject `xor` and keep `exclude`).
  const styles = el.style as CSSStyleDeclaration & Record<string, string>;
  styles.maskImage = layers;
  styles.maskRepeat = "no-repeat";
  styles.maskSize = layerSizes;
  styles.maskComposite = "exclude";
  styles.webkitMaskImage = layers;
  styles.webkitMaskRepeat = "no-repeat";
  styles.webkitMaskSize = layerSizes;
  styles.webkitMaskComposite = "xor";

  const setStop = (
    property: string,
    next: number,
    previous: number,
    animation: Animation | undefined,
  ): Animation | undefined => {
    const nextValue = `${next}px`;
    if (!animateStops || reduceMotion?.() || view === null || previous < 0) {
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
    stopReduceMotion?.();
    el.removeEventListener("scroll", sync);
    observer.disconnect();
    mutations.disconnect();
    startAnimation?.cancel();
    endAnimation?.cancel();
    el.style.removeProperty(START_STOP);
    el.style.removeProperty(END_STOP);
    styles.maskImage = "";
    styles.maskRepeat = "";
    styles.maskSize = "";
    styles.maskComposite = "";
    styles.webkitMaskImage = "";
    styles.webkitMaskRepeat = "";
    styles.webkitMaskSize = "";
    styles.webkitMaskComposite = "";
  };
}
