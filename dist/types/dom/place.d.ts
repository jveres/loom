/** Position members in the requested relative order, inserting new nodes before `end`.
 * Contiguous regions skip the ordering map; genuine reorders retain a longest increasing
 * subsequence to minimize moves. Existing unrelated siblings remain unmanaged.
 * Moves preserve DOM state when the platform provides moveBefore(). */
export declare function positionOrdered(parent: Node, ordered: readonly Node[], end: Node | null): void;
/** Seat `node` immediately after `ref`. Already seated nodes are untouched; other moves
 * use the platform's state-preserving move when available, otherwise insertBefore(). */
export declare function placeAfter(ref: Element, node: Node): void;
