// runtimeSlot(name, init) — ONE value per runtime for a name, whatever
// module instance asks: keyed by `Symbol.for` on globalThis, so a
// module duplicated by HMR (Vite replaces the module, the old instance
// keeps running) or by a dual-bundle page (two copies of a library)
// still shares the registry — an active-drag set, an inset-owner map,
// a seat factory. `init` runs once, the first time the name is asked.
export function runtimeSlot<T>(name: string, init: () => T): T {
  const key = Symbol.for(`loom.runtimeSlot:${name}`);
  const host = globalThis as unknown as Record<symbol, T | undefined>;
  const found = host[key];
  if (found !== undefined) return found;
  const made = init();
  host[key] = made;
  return made;
}
