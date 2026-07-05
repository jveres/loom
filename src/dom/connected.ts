// connected(node) — a reactive DOM-connection signal: true while the node is in the document.
// "On mount" then needs no vocabulary of its own — it's a watch() on a Read<boolean>, and it
// composes with any other cell in one effect ("connected AND visible AND selected").
//
//   own(el, watch(connected(el), (on) => on && measure()));
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
// Nodes currently observed (subscribed signals only): iterated per mutation batch. Entries are
// removed by each source's disconnect, so this map never outlives its subscribers.
const watched = new Map<Node, (value: boolean) => void>();
let observer: MutationObserver | null = null;

function sweep(): void {
  for (const [node, set] of watched) set(node.isConnected);
}

export function connected(node: Node): Read<boolean> {
  const cached = signals.get(node);
  if (cached) return cached;
  const read = source<boolean>((set) => {
    set(node.isConnected); // resync: it may have (dis)connected while unobserved
    watched.set(node, set);
    if (observer === null) {
      observer = new MutationObserver(sweep);
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    }
    return () => {
      watched.delete(node);
      if (watched.size === 0) {
        observer?.disconnect();
        observer = null;
      }
    };
  }, node.isConnected);
  signals.set(node, read);
  return read;
}
