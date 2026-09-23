// Shared scroll-extent tracking for scrollEdges() and scrollFade(): the edge verdict and the
// observation that keeps it current.
import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import type { ScrollEdges } from "./scroll-edges.js";

/** Default slack in px before an edge counts as scrolled. */
export const EDGE_EPSILON = 4;

/** Whether content lies past `el`'s start edge and past its end edge on one axis. */
export function readScrollEdges(
  el: Element,
  horizontal: boolean,
  epsilon: number,
): ScrollEdges {
  const scrolled = horizontal ? el.scrollLeft : el.scrollTop;
  const overflow = horizontal
    ? el.scrollWidth - el.clientWidth
    : el.scrollHeight - el.clientHeight;
  return { start: scrolled > epsilon, end: overflow - scrolled > epsilon };
}

/** Call `sync` (untracked) whenever `el`'s scroll position or scrollable extent may have moved:
 *  scrolling, the box resizing, a direct child resizing (a branch expanding, an image loading), or
 *  children being added or removed. `deep` also resyncs on any descendant or text change, for
 *  content that grows without resizing a direct child. Returns a stop that removes every listener
 *  and observer. */
export function watchScrollExtent(
  el: Element,
  sync: () => void,
  deep = false,
): Stop {
  const run = (): void => untrack(sync);
  const realm = (el.ownerDocument.defaultView ??
    globalThis) as typeof globalThis;
  const sizes = new realm.ResizeObserver(run);
  let children: MutationObserver | undefined;
  const stop = (): void => {
    el.removeEventListener("scroll", run);
    sizes.disconnect();
    children?.disconnect();
  };
  el.addEventListener("scroll", run, { passive: true });
  try {
    sizes.observe(el);
    for (const child of el.children) sizes.observe(child);
    children = new realm.MutationObserver((records) => {
      for (const record of records) {
        if (record.target !== el) continue; // only direct children carry a size observation
        for (const node of record.removedNodes) {
          if (node.nodeType === 1) sizes.unobserve(node as Element);
        }
        for (const node of record.addedNodes) {
          if (node.nodeType === 1) sizes.observe(node as Element);
        }
      }
      run();
    });
    children.observe(
      el,
      deep
        ? { childList: true, subtree: true, characterData: true }
        : { childList: true },
    );
  } catch (error) {
    // Roll back a partial setup so the caller's failure path leaves nothing attached.
    stop();
    throw error;
  }
  return stop;
}
