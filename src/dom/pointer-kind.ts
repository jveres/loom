// pointerKind(doc) — a pooled read of the kind of pointer the user is
// using right now: the pointerType of the last pointerover or
// pointerdown seen on the document, "" before any.
//
// CSS `(hover: none)` and `(hover: hover)` describe the device's PRIMARY
// pointer, not the one in use. An iPad says `hover: none` because touch
// is its primary pointer, though its pencil and a trackpad hover; a
// laptop with a touch screen says `hover: hover` though a finger does
// not. This read lets CSS key hover rules to the pointer actually in
// use: `bindAttr(document.documentElement, "data-pointer", () =>
// pointerKind()() || null)` and `:root[data-pointer="touch"] …`.
//
// pointerover reports a hovering pointer before it presses; pointerdown
// reports a finger, which has no hover. Both are read in the capture
// phase so a handler that stops propagation cannot hide the switch. An
// event that names another pointerType keeps the last kind.
//
// source()-backed and pooled per document: listeners exist only while
// the read is observed, and N readers share one listener pair.
import { type Read, sharedSource } from "../loom.js";

export type PointerKind = "mouse" | "pen" | "touch" | "";

const kinds = new WeakMap<Document, Read<PointerKind>>();
const known = new Set<string>(["mouse", "pen", "touch"]);
const listenerOptions = { capture: true, passive: true } as const;

export function pointerKind(doc: Document = document): Read<PointerKind> {
  const found = kinds.get(doc);
  if (found) return found;
  const signal = sharedSource<PointerKind>((set) => {
    const seen = (event: Event): void => {
      const type = (event as PointerEvent).pointerType;
      if (known.has(type)) set(type as PointerKind);
    };
    doc.addEventListener("pointerover", seen, listenerOptions);
    doc.addEventListener("pointerdown", seen, listenerOptions);
    return () => {
      doc.removeEventListener("pointerover", seen, listenerOptions);
      doc.removeEventListener("pointerdown", seen, listenerOptions);
    };
  }, "");
  kinds.set(doc, signal);
  return signal;
}
