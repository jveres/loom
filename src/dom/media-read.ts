// mediaRead(query) — a media query as a reactive boolean, pooled per
// query string: one MediaQueryList and one change listener per
// distinct query, subscriber-counted through source() (with nothing
// observing, the listener is detached and this module costs zero —
// the element-reads shape). Reconnects RESYNC from the live list:
// the OS can flip the query while unobserved, and a stale cached
// value would swallow the next notification through source()'s
// value dedupe.
//
// The pool is keyed by the raw query string — normalize spellings at
// the call site if two must share ("(min-width: 600px)" and
// "(min-width:600px)" are two pool entries).
import { type Read, source } from "../loom.js";

const signals = new Map<string, Read<boolean>>();

export function mediaRead(query: string): Read<boolean> {
  let signal = signals.get(query);
  if (!signal) {
    const list = matchMedia(query);
    signal = source<boolean>((set) => {
      const push = (): void => set(list.matches);
      push(); // resync: it may have changed while unobserved
      list.addEventListener("change", push);
      return () => list.removeEventListener("change", push);
    }, list.matches);
    signals.set(query, signal);
  }
  return signal;
}
