// caretAtPoint(doc, x, y) — the caret position under a viewport point,
// covering BOTH engine channels: Gecko ships only
// `caretPositionFromPoint`, WebKit only `caretRangeFromPoint`, and
// Chromium ships both. An editor that tries one spelling silently
// falls to its fallback caret in the other engine's browsers
// (proposed from seam's rich-edit entry, Aug 29 — exactly that bug).
// Returns undefined when neither channel exists or the point misses.

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
