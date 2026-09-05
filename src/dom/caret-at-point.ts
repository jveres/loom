// Resolve a caret from viewport coordinates using the document's available
// caretPositionFromPoint or caretRangeFromPoint API. Returns undefined when
// neither API exists or the point misses.

export interface CaretPoint {
  node: Node;
  offset: number;
}

type CaretChannels = Document & {
  caretPositionFromPoint?(
    x: number,
    y: number,
  ): { offsetNode: Node; offset: number } | null;
  caretRangeFromPoint?(x: number, y: number): Range | null;
};

export function caretAtPoint(
  doc: Document,
  x: number,
  y: number,
): CaretPoint | undefined {
  const channels = doc as CaretChannels;
  const position = channels.caretPositionFromPoint?.(x, y);
  if (position) return { node: position.offsetNode, offset: position.offset };
  const range = channels.caretRangeFromPoint?.(x, y);
  return range
    ? { node: range.startContainer, offset: range.startOffset }
    : undefined;
}
