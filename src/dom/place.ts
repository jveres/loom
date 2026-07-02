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
