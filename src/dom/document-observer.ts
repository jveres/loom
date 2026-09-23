// Document resolution and the whole-tree childList observer shared by connected() and onMount().

/** The document that owns `node`, or the node itself when it is a document. */
export function nodeDocument(node: Node): Document | null {
  return node.nodeType === 9 ? (node as Document) : node.ownerDocument;
}

/** Watch every childList change anywhere in `document` (its own realm's MutationObserver),
 *  calling `onChange` once per mutation batch. The caller disconnects the returned observer. */
export function observeDocumentTree(
  document: Document,
  onChange: () => void,
): MutationObserver {
  const view = document.defaultView as
    | (Window & { readonly MutationObserver?: typeof MutationObserver })
    | null;
  const Observer = view?.MutationObserver ?? globalThis.MutationObserver;
  const observer = new Observer(onChange);
  observer.observe(document.documentElement ?? document, {
    childList: true,
    subtree: true,
  });
  return observer;
}
