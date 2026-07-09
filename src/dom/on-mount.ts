// onMount(el, fn) — the mount hook, with an explicit timing contract: `fn` runs once, on a
// microtask after the task that inserted the element — inserted and measurable (layout on
// demand), **not yet painted** — so measure-then-classify work causes no flash. The `onMount`
// JSX prop is this function as a prop, the symmetric twin of `onUnmount`. (The prop wiring pulls
// this module into every h() bundle — +231 B gzip, accepted deliberately with the 5500 B
// minimal-dom budget: the lifecycle pair belongs in the baseline prop vocabulary.)
//
// Cost model: the common case — caller inserts the element in the same synchronous task, or it is
// already connected — resolves entirely on the microtask, no observers anywhere. Only an element
// still disconnected at the microtask checkpoint falls back to a shared document-level
// MutationObserver, and that observer is transient: it exists exactly while such elements are
// pending and disconnects when the last one mounts (or is torn down / cancelled first — a pending
// entry is dropped by `remove()`/`dispose()` like any node-owned resource, so an element that
// never mounts doesn't pin the observer).
import type { Stop } from "../loom.js";
import { onUnmount } from "./ownership-base.js";

interface DocumentPool {
  readonly document: Document;
  readonly pending: Map<Node, Set<(node: Node) => void>>;
  observer: MutationObserver | null;
}

const pools = new WeakMap<Document, DocumentPool>();

function nodeDocument(node: Node): Document | null {
  return node.nodeType === 9 ? (node as Document) : node.ownerDocument;
}

function sweep(pool: DocumentPool): void {
  for (const [node, fns] of pool.pending) {
    if (!node.isConnected) continue;
    pool.pending.delete(node);
    for (const fn of fns) fn(node);
  }
  if (pool.pending.size === 0) {
    pool.observer?.disconnect();
    pool.observer = null;
  }
}

function enqueue(
  node: Node,
  fn: (node: Node) => void,
): DocumentPool | undefined {
  const document = nodeDocument(node);
  if (!document) return undefined;
  let pool = pools.get(document);
  if (!pool) {
    pool = { document, pending: new Map(), observer: null };
    pools.set(document, pool);
  }
  let fns = pool.pending.get(node);
  if (!fns) {
    fns = new Set();
    pool.pending.set(node, fns);
  }
  fns.add(fn);
  pool.observer ??= (() => {
    const view = document.defaultView as
      | (Window & { readonly MutationObserver?: typeof MutationObserver })
      | null;
    const Observer = view?.MutationObserver ?? globalThis.MutationObserver;
    const mo = new Observer(() => sweep(pool as DocumentPool));
    mo.observe(document.documentElement ?? document, {
      childList: true,
      subtree: true,
    });
    return mo;
  })();
  return pool;
}

export function onMount(node: Node, fn: (node: Node) => void): Stop {
  let cancelled = false;
  let pendingPool: DocumentPool | undefined;
  let release: Stop = () => undefined;
  const run = (n: Node): void => {
    if (cancelled) return;
    cancelled = true; // once
    try {
      fn(n);
    } finally {
      // A successful (or throwing) one-shot no longer needs to be retained by its mounted node.
      release();
    }
  };
  queueMicrotask(() => {
    if (cancelled) return;
    if (node.isConnected) run(node);
    else pendingPool = enqueue(node, run);
  });
  const cancel = (): void => {
    cancelled = true;
    const fns = pendingPool?.pending.get(node);
    if (fns) {
      fns.delete(run);
      if (fns.size === 0) {
        pendingPool?.pending.delete(node);
        if (pendingPool?.pending.size === 0) {
          pendingPool.observer?.disconnect();
          pendingPool.observer = null;
        }
      }
    }
  };
  // A node torn down the Loom way before it ever mounts must not pin the transient observer.
  release = onUnmount(node, cancel);
  return release;
}
