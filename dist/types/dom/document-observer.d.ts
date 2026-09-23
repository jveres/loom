/** The document that owns `node`, or the node itself when it is a document. */
export declare function nodeDocument(node: Node): Document | null;
/** Watch every childList change anywhere in `document` (its own realm's MutationObserver),
 *  calling `onChange` once per mutation batch. The caller disconnects the returned observer. */
export declare function observeDocumentTree(document: Document, onChange: () => void): MutationObserver;
