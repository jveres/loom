export declare function positionOrdered(parent: Node, ordered: readonly Node[], end: Node | null): void;
/** Seat `node` as `ref`'s NEXT SIBLING, state-preservingly. Already
 *  seated = a strict NO-OP — the pre-insert removal of a plain
 *  insertBefore (even into the same position) restarts running CSS
 *  animations, re-rasterizes backdrop filters and drops focus in
 *  the moved subtree, so callers positioning chrome per keystroke
 *  hand-rolled this guard twice before it moved here (proposed from
 *  seam's editor chrome seat, Aug 29). Where the node is elsewhere,
 *  placement rides placeBefore's moveBefore fast path. */
export declare function placeAfter(ref: Element, node: Node): void;
