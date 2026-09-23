import type { Stop } from "../loom.js";
import type { ScrollEdges } from "./scroll-edges.js";
/** Default slack in px before an edge counts as scrolled. */
export declare const EDGE_EPSILON = 4;
/** Whether content lies past `el`'s start edge and past its end edge on one axis. */
export declare function readScrollEdges(el: Element, horizontal: boolean, epsilon: number): ScrollEdges;
/** Call `sync` (untracked) whenever `el`'s scroll position or scrollable extent may have moved:
 *  scrolling, the box resizing, a direct child resizing (a branch expanding, an image loading), or
 *  children being added or removed. `deep` also resyncs on any descendant or text change, for
 *  content that grows without resizing a direct child. Returns a stop that removes every listener
 *  and observer. */
export declare function watchScrollExtent(el: Element, sync: () => void, deep?: boolean): Stop;
