// A ParentNode that may support the state-preserving move (Chrome 133+; spec "atomic move").
type MovableParent = Node & {
  moveBefore?: (node: Node, ref: Node | null) => void;
};

// Position `node` before `ref` inside `parent`. When the node is already a child of `parent` and
// the platform has `moveBefore`, the move preserves state that a remove+insert resets — iframe
// documents, focus, selection, playing media, running CSS animations. New or reparented nodes (and
// older engines) take the classic insertBefore path.
export function placeBefore(parent: Node, node: Node, ref: Node | null): void {
  const movable = parent as MovableParent;
  if (movable.moveBefore !== undefined && node.parentNode === parent) {
    movable.moveBefore(node, ref);
  } else {
    parent.insertBefore(node, ref);
  }
}

export // Position `ordered` in sequence ending before `end` (null = the end of `parent`), moving as few
// nodes as possible: members on the longest increasing subsequence of current DOM positions stay
// put; only the rest move. The naive cursor walk this replaces degenerated on a single far swap —
// moving ~N nodes where two suffice (measured 4.6 ms vs ~1 ms on the 1k-row swap bench). New nodes
// (not yet children) are inserted; every move is state-preserving via placeBefore.
function positionOrdered(
  parent: Node,
  ordered: readonly Node[],
  end: Node | null,
): void {
  const n = ordered.length;
  if (n === 0) return;
  const desired = new Map<Node, number>();
  for (let i = 0; i < n; i++) desired.set(ordered[i] as Node, i);
  // The members' current DOM order, expressed as desired indexes; track whether that order is
  // already strictly increasing while building it.
  const seq: number[] = [];
  const seqNodes: Node[] = [];
  let inOrder = true;
  for (
    let child = parent.firstChild;
    child !== null;
    child = child.nextSibling
  ) {
    const want = desired.get(child);
    if (want !== undefined) {
      if (want < (seq[seq.length - 1] ?? -1)) inOrder = false;
      seq.push(want);
      seqNodes.push(child);
    }
  }
  // Fast path for the common cases (unchanged order, append-only): every present member already
  // sits in relative order, so nothing moves — just insert the nodes that aren't children yet,
  // skipping the whole LIS scaffold below.
  if (inOrder) {
    let next: Node | null = end;
    for (let i = n - 1; i >= 0; i--) {
      const node = ordered[i] as Node;
      if (node.parentNode !== parent) placeBefore(parent, node, next);
      next = node;
    }
    return;
  }
  // Longest increasing subsequence (patience sorting with parent links): these nodes are already
  // in relative order and never move.
  const keep = new Set<Node>();
  const tails: number[] = []; // seq position of the best tail per LIS length
  const tailValues: number[] = [];
  const prev: number[] = new Array(seq.length).fill(-1);
  for (let i = 0; i < seq.length; i++) {
    const value = seq[i] as number;
    let lo = 0;
    let hi = tailValues.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((tailValues[mid] as number) < value) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) prev[i] = tails[lo - 1] as number;
    tails[lo] = i;
    tailValues[lo] = value;
  }
  for (
    let k = tails.length > 0 ? (tails[tails.length - 1] as number) : -1;
    k >= 0;
    k = prev[k] as number
  ) {
    keep.add(seqNodes[k] as Node);
  }
  // Walk back-to-front: kept nodes only advance the reference; everything else moves before it.
  let next: Node | null = end;
  for (let i = n - 1; i >= 0; i--) {
    const node = ordered[i] as Node;
    if (!keep.has(node)) placeBefore(parent, node, next);
    next = node;
  }
}
