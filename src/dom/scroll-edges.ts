// scrollEdges(el, options?) — the scroll-position verdict as a signal:
// { start, end } — is there content scrolled past the start edge, is
// there more past the end? The read scrollFade computes internally,
// exposed for hosts that paint their own edge chrome (overlay fades,
// chevrons). Subscriber-counted: the scroll listener and the observers
// exist only while observed. Box and content changes resync (a resize,
// rows added or removed) through loom's pooled observers.
import { type Read, sharedSource } from "../loom.js";
import { connectMutation } from "./observe-mutation.js";
import { connectSize } from "./observe-size.js";

export interface ScrollEdges {
  readonly start: boolean;
  readonly end: boolean;
}

export interface ScrollEdgesOptions {
  /** "y" (default) or "x". */
  readonly axis?: "x" | "y";
  /** Slack in px before an edge counts as scrolled (default 4). */
  readonly epsilon?: number;
}

const NONE: ScrollEdges = { start: false, end: false };

export function scrollEdges(
  el: Element,
  options: ScrollEdgesOptions = {},
): Read<ScrollEdges> {
  const horizontal = options.axis === "x";
  const epsilon = options.epsilon ?? 4;
  return sharedSource<ScrollEdges>((set) => {
    let current = NONE;
    const sync = (): void => {
      const scrolled = horizontal ? el.scrollLeft : el.scrollTop;
      const overflow = horizontal
        ? el.scrollWidth - el.clientWidth
        : el.scrollHeight - el.clientHeight;
      const next = {
        start: scrolled > epsilon,
        end: overflow - scrolled > epsilon,
      };
      if (next.start === current.start && next.end === current.end) return;
      current = next;
      set(next);
    };
    el.addEventListener("scroll", sync, { passive: true });
    const stopSize = connectSize(el, sync);
    const stopContent = connectMutation(el, sync, {
      childList: true,
      subtree: true,
      characterData: true,
    });
    sync();
    return () => {
      el.removeEventListener("scroll", sync);
      stopSize();
      stopContent();
    };
  }, NONE);
}
