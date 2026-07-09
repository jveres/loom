// connected(node) — a reactive DOM-connection signal: true while the node is in the document.
// Mount state as a signal: it composes with any other signal in one effect ("connected AND
// visible AND selected"), and watch() turns it into connect/disconnect callbacks:
//
//   onUnmount(el, watch(connected(el), (on) => on && measure()));
//
// One shared document-level observer backs every signal, attached only while at least one signal
// is observed (source() connects on first subscriber, disconnects on last) — unused, this module
// costs nothing. While any signal IS live, the observer wakes per childList mutation batch
// anywhere in the document and checks each registered node's isConnected (O(registered) per
// batch; registered stays small by construction). Loom's own text updates are characterData and
// don't wake it; list reorders do. Moves inside shadow roots are invisible to a document-level
// observer — a node that never leaves its shadow root reports its state at subscribe time.
import { type Read, source } from "../loom.js";

// Signal cache: one pooled signal per node, so N readers share one registry entry. WeakMap — a
// forgotten node drops its signal with it.
const signals = new WeakMap<Node, Read<boolean>>();
interface DocumentPool {
  readonly document: Document;
  readonly watched: Map<Node, (value: boolean) => void>;
  observer: MutationObserver | null;
}

const pools = new WeakMap<Document, DocumentPool>();

function nodeDocument(node: Node): Document | null {
  return node.nodeType === 9 ? (node as Document) : node.ownerDocument;
}

function poolFor(document: Document): DocumentPool {
  const found = pools.get(document);
  if (found) return found;
  const pool: DocumentPool = {
    document,
    watched: new Map(),
    observer: null,
  };
  pools.set(document, pool);
  return pool;
}

function observerFor(pool: DocumentPool): MutationObserver {
  if (pool.observer) return pool.observer;
  const view = pool.document.defaultView as
    | (Window & { readonly MutationObserver?: typeof MutationObserver })
    | null;
  const Observer = view?.MutationObserver ?? globalThis.MutationObserver;
  const observer = new Observer(() => {
    for (const [node, set] of pool.watched) set(node.isConnected);
  });
  observer.observe(pool.document.documentElement ?? pool.document, {
    childList: true,
    subtree: true,
  });
  pool.observer = observer;
  return observer;
}

export function connected(node: Node): Read<boolean> {
  const cached = signals.get(node);
  if (cached) return cached;
  const read = source<boolean>((set) => {
    set(node.isConnected); // resync: it may have (dis)connected while unobserved
    const document = nodeDocument(node);
    if (!document) return () => undefined;
    const pool = poolFor(document);
    pool.watched.set(node, set);
    observerFor(pool);
    return () => {
      pool.watched.delete(node);
      if (pool.watched.size === 0) {
        pool.observer?.disconnect();
        pool.observer = null;
      }
    };
  }, node.isConnected);
  signals.set(node, read);
  return read;
}
