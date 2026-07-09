// Reactive attribute/class/style reads, backed by ONE shared MutationObserver. Adding the first
// subscription for an element observes only that target; its callback filters records through the
// subscribed-name map. MutationObserver has no unobserve(target), so final-target removals are
// batched into one microtask rebuild instead of repeatedly walking all survivors. Everything is
// subscriber-counted through source(): with nothing observed the observer is disconnected and this
// module costs zero.
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
let rebuildQueued = false;

function deliver(records: MutationRecord[]): void {
  for (const record of records) {
    const name = record.attributeName;
    if (name === null) continue;
    const el = record.target as Element;
    watched.get(el)?.get(name)?.(el.getAttribute(name));
  }
}

function observeTarget(el: Element): void {
  observer ??= new MutationObserver(deliver);
  observer.observe(el, { attributes: true });
}

// MutationObserver can update an existing target's options but cannot stop observing one target.
// Coalesce any number of final-target removals, then rebuild the survivors once.
function scheduleRebuild(): void {
  if (rebuildQueued) return;
  rebuildQueued = true;
  queueMicrotask(() => {
    rebuildQueued = false;
    const current = observer;
    if (current === null) return;
    deliver(current.takeRecords());
    current.disconnect();
    if (watched.size === 0) {
      observer = null;
      return;
    }
    for (const el of watched.keys()) observeTarget(el);
  });
}

function addSetter(
  el: Element,
  name: string,
  set: (value: string | null) => void,
): void {
  let setters = watched.get(el);
  if (!setters) {
    setters = new Map();
    watched.set(el, setters);
    observeTarget(el);
  }
  setters.set(name, set);
}

function removeSetter(el: Element, name: string): void {
  const current = watched.get(el);
  if (!current) return;
  current.delete(name);
  if (current.size !== 0) return;
  watched.delete(el);
  scheduleRebuild();
}

// Kept separate from attrSource so subscriber setup/teardown stays symmetric and the registry
// cannot retain an element after its last source disconnects.
function connectAttribute(
  el: Element,
  name: string,
  set: (value: string | null) => void,
): () => void {
  addSetter(el, name, set);
  return () => removeSetter(el, name);
}

export function attrRead(el: Element, name: string): Read<string | null> {
  return memo(signals, el, name, () => attrSource(el, name));
}

function attrSource(el: Element, name: string): Read<string | null> {
  return source<string | null>((set) => {
    set(el.getAttribute(name)); // resync: it may have changed while unobserved
    return connectAttribute(el, name, set);
  }, el.getAttribute(name));
}

// Keyed caches so N readers share one derived computed (and through it, one attribute
// subscription). One get-or-create for all three read kinds.
function memo<V>(
  cache: WeakMap<Element, Map<string, V>>,
  el: Element,
  key: string,
  make: () => V,
): V {
  let byKey = cache.get(el);
  if (!byKey) {
    byKey = new Map();
    cache.set(el, byKey);
  }
  let value = byKey.get(key);
  if (value === undefined) {
    value = make();
    byKey.set(key, value);
  }
  return value;
}

const classSignals = new WeakMap<Element, Map<string, Read<boolean>>>();
const styleSignals = new WeakMap<Element, Map<string, Read<string>>>();

export function classRead(el: Element, name: string): Read<boolean> {
  return memo(classSignals, el, name, () => {
    const classAttr = attrRead(el, "class");
    return computed(() => {
      classAttr(); // subscription; the value itself comes from the live classList
      return el.classList.contains(name);
    });
  });
}

export function styleRead(el: Element, prop: string): Read<string> {
  return memo(styleSignals, el, prop, () => {
    const styleAttr = attrRead(el, "style");
    return computed(() => {
      styleAttr(); // subscription; the value itself comes from the live inline style
      return (el as ElementCSSInlineStyle & Element).style.getPropertyValue(
        prop,
      );
    });
  });
}
