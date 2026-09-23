// scrollEdges(el, options?) — the scroll-position verdict as a signal:
// { start, end } — is there content scrolled past the start edge, is
// there more past the end? The read scrollFade computes internally,
// exposed for hosts that paint their own edge chrome (overlay fades,
// chevrons). Subscriber-counted: the scroll listener and the observers
// exist only while observed. Box, child-size, and any content change
// resync (a resize, a branch expanding, rows added or removed, text edits).
import { type Read, sharedSource } from "../loom.js";
import {
  EDGE_EPSILON,
  readScrollEdges,
  watchScrollExtent,
} from "./scroll-extent.js";

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
  const epsilon = options.epsilon ?? EDGE_EPSILON;
  return sharedSource<ScrollEdges>((set) => {
    let current = NONE;
    const sync = (): void => {
      const next = readScrollEdges(el, horizontal, epsilon);
      if (next.start === current.start && next.end === current.end) return;
      current = next;
      set(next);
    };
    const stop = watchScrollExtent(el, sync, true);
    sync();
    return stop;
  }, NONE);
}
