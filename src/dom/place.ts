// A ParentNode that may support the state-preserving move (Chrome 133+; spec "atomic move").
type MovableParent = Node & {
  moveBefore?: (node: Node, ref: Node | null) => void;
};

// Position `node` before `ref` inside `parent`. When the node is already a child of `parent` and
// the platform has `moveBefore`, the move preserves state that a remove+insert resets — iframe
// documents, focus, selection, playing media, running CSS animations. New or reparented nodes (and
// older engines) take the classic insertBefore path.
function placeBefore(parent: Node, node: Node, ref: Node | null): void {
  const movable = parent as MovableParent;
  if (movable.moveBefore !== undefined && node.parentNode === parent) {
    movable.moveBefore(node, ref);
  } else {
    parent.insertBefore(node, ref);
  }
}

/** Position members in the requested relative order, inserting new nodes before `end`.
 * Contiguous regions skip the ordering map; genuine reorders retain a longest increasing
 * subsequence to minimize moves. Existing unrelated siblings remain unmanaged.
 * Moves preserve DOM state when the platform provides moveBefore(). */
export function positionOrdered(
  parent: Node,
  ordered: readonly Node[],
  end: Node | null,
): void {
  const n = ordered.length;
  if (n === 0) return;
  // Unchanged contiguous regions and insertions into them need neither a parent-wide scan nor
  // LIS storage. Check only present members; new nodes can then be inserted around them.
  let previous: Node | undefined;
  let contiguous = true;
  for (const node of ordered) {
    if (node.parentNode !== parent) continue;
    if (previous !== undefined && previous.nextSibling !== node) {
      contiguous = false;
      break;
    }
    previous = node;
  }
  if (contiguous) {
    insertMissing(parent, ordered, end);
    return;
  }
  const desired = new Map<Node, number>();
  for (let i = 0; i < n; i++) desired.set(ordered[i] as Node, i);
  // The members' current DOM order, expressed as desired indexes; track whether that order is
  // already strictly increasing while building it.
  const seq = new Int32Array(n);
  let m = 0;
  let inOrder = true;
  for (
    let child = parent.firstChild;
    child !== null;
    child = child.nextSibling
  ) {
    const want = desired.get(child);
    if (want !== undefined) {
      if (m > 0 && want < (seq[m - 1] as number)) inOrder = false;
      seq[m++] = want;
    }
  }
  // Fast path for the common cases (unchanged order, append-only): every present member already
  // sits in relative order, so nothing moves — just insert the nodes that aren't children yet,
  // skipping the whole LIS scaffold below.
  if (inOrder) {
    insertMissing(parent, ordered, end);
    return;
  }
  const keep = keptIndexes(seq, m, n);
  // Walk back-to-front: kept nodes only advance the reference; everything else moves before it.
  let next: Node | null = end;
  for (let i = n - 1; i >= 0; i--) {
    const node = ordered[i] as Node;
    if (keep[i] === 0) placeBefore(parent, node, next);
    next = node;
  }
}

/** Insert members that aren't children of `parent` yet, walking back-to-front so each lands before
 * its successor (the last before `end`). Present members don't move. */
function insertMissing(
  parent: Node,
  ordered: readonly Node[],
  end: Node | null,
): void {
  let next: Node | null = end;
  for (let i = ordered.length - 1; i >= 0; i--) {
    const node = ordered[i] as Node;
    if (node.parentNode !== parent) placeBefore(parent, node, next);
    next = node;
  }
}

/** Longest increasing subsequence (patience sorting with parent links) of `seq[0..m)`: these
 * members are already in relative order and never move. Returns a flag per desired index. */
function keptIndexes(seq: Int32Array, m: number, n: number): Uint8Array {
  const tails = new Int32Array(m); // seq position of the best tail per LIS length
  const prev = new Int32Array(m);
  let length = 0;
  for (let i = 0; i < m; i++) {
    const value = seq[i] as number;
    let lo = 0;
    let hi = length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((seq[tails[mid] as number] as number) < value) lo = mid + 1;
      else hi = mid;
    }
    prev[i] = lo > 0 ? (tails[lo - 1] as number) : -1;
    tails[lo] = i;
    if (lo === length) length++;
  }
  const keep = new Uint8Array(n);
  for (
    let k = length > 0 ? (tails[length - 1] as number) : -1;
    k >= 0;
    k = prev[k] as number
  ) {
    keep[seq[k] as number] = 1;
  }
  return keep;
}

/** Seat `node` immediately after `ref`. Already seated nodes are untouched; other moves
 * use the platform's state-preserving move when available, otherwise insertBefore(). */
export function placeAfter(ref: Element, node: Node): void {
  const parent = ref.parentNode;
  if (!parent) return;
  if (node.parentNode === parent && ref.nextSibling === node) return;
  placeBefore(parent, node, ref.nextSibling);
}
