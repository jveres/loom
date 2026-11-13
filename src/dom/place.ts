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
  // LIS storage. Checking `previous.nextSibling === node` first halves DOM getter crossings on
  // contiguous lists because a sibling of `previous` already shares `previous.parentNode === parent`.
  let previous: Node | undefined;
  let contiguous = true;
  let hasMissing = false;
  for (let i = 0; i < n; i++) {
    const node = ordered[i] as Node;
    if (previous !== undefined && previous.nextSibling === node) {
      previous = node;
      continue;
    }
    if (node.parentNode !== parent) {
      hasMissing = true;
      continue;
    }
    if (previous !== undefined) {
      contiguous = false;
      break;
    }
    previous = node;
  }
  if (contiguous) {
    if (hasMissing) sweep(parent, ordered, 0, n - 1, end);
    return;
  }

  // Trim matching prefix/suffix and resolve opposite-end swaps directly against the live DOM
  // before allocating Map + TypedArrays for LIS.
  let head = 0;
  let tail = n - 1;
  let afterTail: Node | null = end;
  let domBack: Node | null = end ? end.previousSibling : parent.lastChild;
  let domFront: Node | null = domBack ? parent.firstChild : null;

  while (head <= tail && domFront && domBack) {
    if (ordered[head] === domFront) {
      head++;
      domFront = domFront === domBack ? null : domFront.nextSibling;
    } else if (ordered[tail] === domBack) {
      afterTail = domBack;
      tail--;
      domBack = domBack === domFront ? null : domBack.previousSibling;
    } else if (
      head < tail &&
      ordered[head] === domBack &&
      ordered[tail] === domFront &&
      (head + 1 === tail ||
        (domFront.nextSibling !== domBack &&
          (ordered[head + 1] as Node).parentNode === parent))
    ) {
      if (head + 1 === tail) {
        placeBefore(parent, domFront, afterTail);
        return;
      }
      const nextFront = domFront.nextSibling;
      const prevBack = domBack.previousSibling;
      placeBefore(parent, domBack, domFront);
      placeBefore(parent, domFront, afterTail);
      afterTail = domFront;
      domFront = nextFront;
      domBack = prevBack;
      head++;
      tail--;
    } else {
      break;
    }
  }

  if (head > tail) return;

  const span = tail - head + 1;
  const desired = new Map<Node, number>();
  for (let i = 0; i < span; i++) desired.set(ordered[head + i] as Node, i);
  // Current DOM order of members in `ordered[head..tail]`, expressed as 0..span-1 offsets.
  const seq = new Int32Array(span);
  let m = 0;
  let inOrder = true;
  for (
    let child: Node | null = domFront;
    child !== null && child !== afterTail;
    child = child.nextSibling
  ) {
    const want = desired.get(child);
    if (want !== undefined) {
      if (m > 0 && want < (seq[m - 1] as number)) inOrder = false;
      seq[m++] = want;
    }
  }
  // Fast path when present members already sit in relative order (e.g. unmanaged siblings between
  // them): insert only the nodes that aren't children yet, skipping LIS allocation.
  if (!inOrder || m < span) {
    sweep(
      parent,
      ordered,
      head,
      tail,
      afterTail,
      inOrder ? undefined : keptIndexes(seq, m, span),
    );
  }
}

function sweep(
  parent: Node,
  ordered: readonly Node[],
  head: number,
  tail: number,
  end: Node | null,
  keep?: Uint8Array,
): void {
  let next: Node | null = end;
  for (let i = tail; i >= head; i--) {
    const node = ordered[i] as Node;
    if (keep ? keep[i - head] === 0 : node.parentNode !== parent) {
      placeBefore(parent, node, next);
    }
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
  if (parent && (node.parentNode !== parent || ref.nextSibling !== node)) {
    placeBefore(parent, node, ref.nextSibling);
  }
}
