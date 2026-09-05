import { type Read, sharedSource } from "../loom.js";

export interface MediaReadOptions {
  readonly window?: Pick<Window, "matchMedia">;
}
const realms = new WeakMap<object, Map<string, Read<boolean>>>();
/** A shared reactive media query, isolated by its window. */
export function mediaRead(
  query: string,
  options?: MediaReadOptions,
): Read<boolean> {
  const realm = options?.window ?? globalThis;
  let signals = realms.get(realm);
  if (!signals) {
    signals = new Map();
    realms.set(realm, signals);
  }
  let signal = signals.get(query);
  if (!signal) {
    const list = realm.matchMedia(query);
    signal = sharedSource<boolean>((set) => {
      const push = (): void => set(list.matches);
      push();
      list.addEventListener("change", push);
      return () => list.removeEventListener("change", push);
    }, list.matches);
    signals.set(query, signal);
  }
  return signal;
}
