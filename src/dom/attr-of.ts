// Reactive attribute/class/style reads, backed by ONE shared MutationObserver — observe() takes
// per-target options, so each watched element carries an attributeFilter of exactly its
// subscribed names. Subscribing or unsubscribing rebuilds the observation set (drain pending
// records, disconnect, re-observe the survivors) — an O(watched elements) walk paid only when a
// subscription changes, never per mutation. Everything is subscriber-counted through source():
// with nothing observed the observer is disconnected and this module costs zero.
//
// attrRead/classRead/styleRead are the element forms of attr()/classed()/style() in ./index.ts;
// class and style reads derive from the class/style attribute signals, deduped by computed().
import { computed, type Read, source } from "../loom.js";

// Pooled signals: one per (element, attribute). WeakMap — forgotten elements drop their signals.
const signals = new WeakMap<Element, Map<string, Read<string | null>>>();
// Elements with at least one SUBSCRIBED attribute signal, each with its per-attribute setters.
// Entries are removed by each source's disconnect, so this map never outlives its subscribers.
const watched = new Map<Element, Map<string, (value: string | null) => void>>();
let observer: MutationObserver | null = null;

function deliver(records: MutationRecord[]): void {
  for (const record of records) {
    const name = record.attributeName;
    if (name === null) continue;
    const el = record.target as Element;
    watched.get(el)?.get(name)?.(el.getAttribute(name));
  }
}

// Rebuild the observation set after a registry change. disconnect() is the only way to drop a
// target, so drain what's pending, reset, and re-observe every survivor with its exact filter.
function reobserve(): void {
  if (observer === null) {
    if (watched.size === 0) return;
    observer = new MutationObserver(deliver);
  } else {
    deliver(observer.takeRecords());
    observer.disconnect();
    if (watched.size === 0) {
      observer = null;
      return;
    }
  }
  for (const [el, setters] of watched) {
    observer.observe(el, {
      attributes: true,
      attributeFilter: [...setters.keys()],
    });
  }
}

export function attrRead(el: Element, name: string): Read<string | null> {
  let byName = signals.get(el);
  if (!byName) {
    byName = new Map();
    signals.set(el, byName);
  }
  const cached = byName.get(name);
  if (cached) return cached;
  const read = source<string | null>((set) => {
    set(el.getAttribute(name)); // resync: it may have changed while unobserved
    let setters = watched.get(el);
    if (!setters) {
      setters = new Map();
      watched.set(el, setters);
    }
    setters.set(name, set);
    reobserve();
    return () => {
      const current = watched.get(el);
      if (!current) return;
      current.delete(name);
      if (current.size === 0) watched.delete(el);
      reobserve();
    };
  }, el.getAttribute(name));
  byName.set(name, read);
  return read;
}

// Class/style reads: keyed caches so N readers share one derived computed (and through it, one
// attribute subscription).
const classSignals = new WeakMap<Element, Map<string, Read<boolean>>>();
const styleSignals = new WeakMap<Element, Map<string, Read<string>>>();

export function classRead(el: Element, name: string): Read<boolean> {
  let byName = classSignals.get(el);
  if (!byName) {
    byName = new Map();
    classSignals.set(el, byName);
  }
  const cached = byName.get(name);
  if (cached) return cached;
  const classAttr = attrRead(el, "class");
  const read = computed(() => {
    classAttr(); // subscription; the value itself comes from the live classList
    return el.classList.contains(name);
  });
  byName.set(name, read);
  return read;
}

export function styleRead(el: Element, prop: string): Read<string> {
  let byProp = styleSignals.get(el);
  if (!byProp) {
    byProp = new Map();
    styleSignals.set(el, byProp);
  }
  const cached = byProp.get(prop);
  if (cached) return cached;
  const styleAttr = attrRead(el, "style");
  const read = computed(() => {
    styleAttr(); // subscription; the value itself comes from the live inline style
    return (el as ElementCSSInlineStyle & Element).style.getPropertyValue(prop);
  });
  byProp.set(prop, read);
  return read;
}
