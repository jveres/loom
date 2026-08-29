/** Position `ordered` in sequence ending before `end` (null = the end
 *  of `parent`), moving as FEW nodes as possible: members on the
 *  longest increasing subsequence of current DOM positions stay put;
 *  only the rest move (the naive cursor walk this replaces degenerated
 *  on a single far swap — ~N moves where two suffice; 4.6 ms vs ~1 ms
 *  on the 1k-row swap bench). New nodes (not yet children) are
 *  inserted; every move is state-preserving (moveBefore where the
 *  platform ships it). The imperative keyed-reconcile seat — each()'s
 *  own ordering pass, exported for callers reconciling by hand
 *  (proposed from seam's canvas bands + outline rows, Aug 29). */
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
