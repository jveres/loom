/**
 * Loom - a tiny runtime reactive UI core.
 *
 * Reactive data is plain objects, render effects are explicit, and DOM bindings
 * own their teardown so structural patches can safely remove subtrees.
 */

/* ---------------------------------------------------------------- scheduler */

type SchedulerMode = "microtask" | "manual";
type DuplicateKeyPolicy = "throw" | "ignore";
let duplicateKeys: DuplicateKeyPolicy = "throw";
const queuedSlots: Slot<unknown>[] = [];

function report(err: unknown): void {
  if (typeof globalThis.reportError === "function") globalThis.reportError(err);
  else console.error(err);
}

export interface Disposable {
  readonly disposed: boolean;
  dispose(): void;
}

export interface SchedulerHandle {
  flush(): void;
  configure(options: { mode?: SchedulerMode }): void;
  run<T>(fn: () => T): T;
}

class Scheduler implements SchedulerHandle {
  mode: SchedulerMode = "microtask";
  private queued = new Set<EffectRunner>();
  private flushing = new Set<EffectRunner>();
  private pending = false;

  configure(options: { mode?: SchedulerMode }): void {
    if (options.mode) this.mode = options.mode;
  }

  run<T>(fn: () => T): T {
    const prev = currentScheduler;
    currentScheduler = this;
    try {
      return fn();
    } finally {
      currentScheduler = prev;
    }
  }

  schedule(effect: EffectRunner): void {
    this.queued.add(effect);
    if (this.mode === "microtask" && !this.pending) {
      this.pending = true;
      queueMicrotask(() => this.flush());
    }
  }

  flush(): void {
    this.pending = false;
    let batchSize = 0;
    const start = now();
    let passes = 0;
    while (this.queued.size) {
      if (passes++ > 100) {
        report(new Error("Loom flush exceeded 100 passes."));
        break;
      }
      const run = this.queued;
      this.queued = this.flushing;
      this.flushing = run;
      batchSize += this.flushing.size;
      try {
        for (const effect of this.flushing) {
          try {
            effect.run();
          } catch (err) {
            report(err);
          }
        }
      } finally {
        this.flushing.clear();
      }
    }
    if (batchSize) emitFlush({ batchSize, durationMs: now() - start });
    for (const slot of queuedSlots) slot.queued = false;
    queuedSlots.length = 0;
  }
}

function now(): number {
  return typeof performance === "undefined" ? Date.now() : performance.now();
}

const defaultScheduler = new Scheduler();
let currentScheduler: Scheduler = defaultScheduler;

export interface ConfigureOptions {
  scheduler?: SchedulerMode;
  duplicateKeys?: DuplicateKeyPolicy;
}

export function configure(options: ConfigureOptions): void {
  if (options.scheduler) defaultScheduler.mode = options.scheduler;
  if (options.duplicateKeys) duplicateKeys = options.duplicateKeys;
}

export function flush(): void {
  defaultScheduler.flush();
}

export function createScheduler(options?: {
  mode?: SchedulerMode;
}): SchedulerHandle {
  const scheduler = new Scheduler();
  if (options?.mode) scheduler.mode = options.mode;
  return scheduler;
}

/* ------------------------------------------------------------- observability */

export type Dependency =
  | {
      readonly kind: "state";
      readonly root: object;
      readonly proxy: object;
      readonly key: PropertyKey;
      readonly path: readonly PropertyKey[];
      readonly label?: string;
      readonly namespace?: string;
    }
  | {
      readonly kind: "signal";
      readonly label?: string;
      readonly namespace?: string;
    }
  | {
      readonly kind: "computed";
      readonly label?: string;
      readonly namespace?: string;
    };

export interface MutationEvent {
  readonly kind: "set" | "delete" | "array";
  readonly root: object;
  readonly proxy: object;
  readonly path: readonly PropertyKey[];
  readonly key: PropertyKey;
  readonly prev: unknown;
  readonly next: unknown;
  readonly label?: string;
  readonly namespace?: string;
}

export interface DependencyEvent {
  readonly effect: EffectHandle;
  readonly dependency: Dependency;
}

export interface EffectEvent {
  readonly effect: EffectHandle;
  readonly label?: string;
}

export interface FlushEvent {
  readonly batchSize: number;
  readonly durationMs: number;
}

export interface PatchEvent {
  readonly kind: "patch" | "list";
  readonly size: number;
  readonly container: Element;
}

export interface Observer {
  mutation?: (event: MutationEvent) => void;
  dependency?: (event: DependencyEvent) => void;
  effect?: (event: EffectEvent) => void;
  flush?: (event: FlushEvent) => void;
  patch?: (event: PatchEvent) => void;
}

const observers = new Set<Observer>();

export function observe(observer: Observer): Disposable {
  observers.add(observer);
  const handle: Disposable = {
    disposed: false,
    dispose() {
      if (this.disposed) return;
      (this as { disposed: boolean }).disposed = true;
      observers.delete(observer);
    },
  };
  currentScope?.own(handle);
  return handle;
}

function emitMutation(event: MutationEvent): void {
  for (const observer of observers) observer.mutation?.(event);
}

function emitDependency(effect: EffectRunner, slot: Slot<unknown>): void {
  if (!observers.size) return;
  const dependency = slot.info;
  for (const observer of observers)
    observer.dependency?.({ effect, dependency });
}

function emitEffect(effect: EffectRunner): void {
  if (!observers.size) return;
  for (const observer of observers)
    observer.effect?.({ effect, label: effect.label });
}

function emitFlush(event: FlushEvent): void {
  for (const observer of observers) observer.flush?.(event);
}

function emitPatch(event: PatchEvent): void {
  for (const observer of observers) observer.patch?.(event);
}

/* ------------------------------------------------------------- slots/effects */

let activeEffect: EffectRunner | null = null;

class Slot<T> {
  value: T;
  subs = new Set<EffectRunner>();
  queued = false;
  readonly info: Dependency;

  constructor(value: T, info: Dependency) {
    this.value = value;
    this.info = info;
  }

  get(): T {
    if (activeEffect) {
      activeEffect.track(this);
      emitDependency(activeEffect, this);
    }
    return this.value;
  }

  set(value: T): void {
    if (Object.is(value, this.value)) return;
    this.value = value;
    this.notify();
  }

  notify(): void {
    if (!this.subs.size) return;
    if (this.queued) return;
    this.queued = true;
    queuedSlots.push(this);
    for (const effect of this.subs) effect.scheduler.schedule(effect);
  }
}

type Cleanup = () => void;
type EffectFn = (onCleanup: (cleanup: Cleanup) => void) => undefined | Cleanup;

export interface EffectOptions {
  label?: string;
  scheduler?: SchedulerHandle;
}

export interface EffectHandle extends Disposable {
  readonly label?: string;
}

const SOURCE_SLOT = Symbol("loom.sourceSlot");

interface InternalSource {
  readonly [SOURCE_SLOT]: Slot<unknown>;
}

export interface Signal {
  readonly label?: string;
  read(): void;
  bump(): void;
}

export interface Computed<T> extends Disposable {
  readonly label?: string;
  readonly value: T;
}

export type EffectDep = Signal | Computed<unknown>;

function sourceSlot(dep: EffectDep): Slot<unknown> {
  const slot = (dep as unknown as InternalSource)[SOURCE_SLOT];
  if (!(slot instanceof Slot)) throw new TypeError("Invalid Loom effect dep.");
  return slot;
}

class EffectRunner implements EffectHandle {
  readonly fn: EffectFn;
  readonly label?: string;
  readonly scheduler: Scheduler;
  readonly explicitDeps: readonly Slot<unknown>[] | null;
  readonly deps = new Set<Slot<unknown>>();
  private cleanups: Cleanup[] = [];
  private disposeCleanups: Cleanup[] = [];
  disposed = false;

  constructor(
    fn: EffectFn,
    deps: readonly Slot<unknown>[] | null,
    options: EffectOptions = {},
  ) {
    this.fn = fn;
    this.label = options.label;
    this.scheduler =
      options.scheduler instanceof Scheduler
        ? options.scheduler
        : currentScheduler;
    this.explicitDeps = deps;
    if (deps) {
      for (const dep of deps) {
        dep.subs.add(this);
        this.deps.add(dep);
      }
    }
    currentScope?.own(this);
    try {
      this.run();
    } catch (err) {
      this.dispose();
      throw err;
    }
  }

  track(slot: Slot<unknown>): void {
    if (this.explicitDeps || this.deps.has(slot)) return;
    slot.subs.add(this);
    this.deps.add(slot);
  }

  addDisposeCleanup(cleanup: Cleanup): void {
    this.disposeCleanups.push(cleanup);
  }

  run(): void {
    if (this.disposed) return;
    this.runCleanups();
    if (!this.explicitDeps) this.clearDeps();
    emitEffect(this);
    const prev = activeEffect;
    activeEffect = this.explicitDeps ? null : this;
    try {
      const addCleanup = (cleanup: Cleanup): void => {
        this.cleanups.push(cleanup);
      };
      const returned = this.fn(addCleanup);
      if (typeof returned === "function") this.cleanups.push(returned);
    } finally {
      activeEffect = prev;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.runCleanups();
    for (const cleanup of this.disposeCleanups.splice(0)) {
      try {
        cleanup();
      } catch (err) {
        report(err);
      }
    }
    this.clearDeps();
  }

  private clearDeps(): void {
    for (const dep of this.deps) dep.subs.delete(this);
    this.deps.clear();
  }

  private runCleanups(): void {
    for (const cleanup of this.cleanups.splice(0)) {
      try {
        cleanup();
      } catch (err) {
        report(err);
      }
    }
  }
}

export function effect(fn: EffectFn, options?: EffectOptions): EffectHandle;
export function effect(
  fn: EffectFn,
  deps: readonly EffectDep[],
  options?: EffectOptions,
): EffectHandle;
export function effect(
  fn: EffectFn,
  depsOrOptions?: readonly EffectDep[] | EffectOptions,
  maybeOptions?: EffectOptions,
): EffectHandle {
  const hasDeps = Array.isArray(depsOrOptions);
  const deps = hasDeps
    ? (depsOrOptions as readonly EffectDep[]).map(sourceSlot)
    : null;
  const options = hasDeps
    ? maybeOptions
    : (depsOrOptions as EffectOptions | undefined);
  return new EffectRunner(fn, deps, options);
}

export function depsOf(handle: EffectHandle): readonly Dependency[] {
  const runner = handle as EffectRunner;
  if (!(runner instanceof EffectRunner) || runner.disposed) return [];
  return [...runner.deps].map((dep) => dep.info);
}

export function untrack<T>(fn: () => T): T {
  const prev = activeEffect;
  activeEffect = null;
  try {
    return fn();
  } finally {
    activeEffect = prev;
  }
}

export interface SignalOptions {
  label?: string;
  namespace?: string;
}

export function signal(options: SignalOptions = {}): Signal {
  const slot = new Slot(0, {
    kind: "signal",
    label: options.label,
    namespace: options.namespace,
  });
  return {
    [SOURCE_SLOT]: slot,
    label: options.label,
    read() {
      slot.get();
    },
    bump() {
      slot.set(slot.value + 1);
    },
  } as Signal & InternalSource;
}

export interface ComputedOptions {
  label?: string;
  namespace?: string;
}

class ComputedImpl<T> implements Computed<T>, InternalSource {
  readonly label?: string;
  readonly [SOURCE_SLOT]: Slot<unknown>;
  private readonly runner: EffectHandle;

  constructor(read: () => T, options: ComputedOptions = {}) {
    this.label = options.label;
    this[SOURCE_SLOT] = new Slot(undefined, {
      kind: "computed",
      label: options.label,
      namespace: options.namespace,
    });
    this.runner = effect(
      () => {
        (this[SOURCE_SLOT] as Slot<T | undefined>).set(read());
      },
      { label: options.label ? `${options.label}:compute` : undefined },
    );
  }

  get value(): T {
    return (this[SOURCE_SLOT] as Slot<T>).get();
  }

  get disposed(): boolean {
    return this.runner.disposed;
  }

  dispose(): void {
    this.runner.dispose();
  }
}

export function computed<T>(
  read: () => T,
  options?: ComputedOptions,
): Computed<T> {
  return new ComputedImpl(read, options);
}

/* ------------------------------------------------------------------- scopes */

export interface ScopeOptions {
  label?: string;
}

export interface ScopeHandle extends Disposable {
  readonly label?: string;
  run<T>(fn: () => T): T;
}

class Scope implements ScopeHandle {
  readonly label?: string;
  private readonly handles = new Set<Disposable>();
  disposed = false;

  constructor(options: ScopeOptions = {}) {
    this.label = options.label;
  }

  own(handle: Disposable): void {
    if (this.disposed) handle.dispose();
    else this.handles.add(handle);
  }

  run<T>(fn: () => T): T {
    const prev = currentScope;
    currentScope = this;
    try {
      return fn();
    } finally {
      currentScope = prev;
    }
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    for (const handle of this.handles) handle.dispose();
    this.handles.clear();
  }
}

let currentScope: Scope | null = null;

export function scope(options?: ScopeOptions): ScopeHandle {
  const s = new Scope(options);
  currentScope?.own(s);
  return s;
}

/* ------------------------------------------------------------------- state */

export interface StateOptions {
  label?: string;
  namespace?: string;
}

interface StateMeta {
  root: object;
  path: readonly PropertyKey[];
  label?: string;
  namespace?: string;
}

const stateMeta = new WeakMap<object, StateMeta>();

function dependencyFor(proxy: object, key: PropertyKey): Dependency {
  const meta = stateMeta.get(proxy) as StateMeta;
  return {
    kind: "state",
    root: meta.root,
    proxy,
    key,
    path: [...meta.path, key],
    label: meta.label,
    namespace: meta.namespace,
  };
}

function mutationFor(
  kind: MutationEvent["kind"],
  proxy: object,
  key: PropertyKey,
  prev: unknown,
  next: unknown,
): MutationEvent {
  const meta = stateMeta.get(proxy) as StateMeta;
  return {
    kind,
    root: meta.root,
    proxy,
    path: meta.path,
    key,
    prev,
    next,
    label: meta.label,
    namespace: meta.namespace,
  };
}

const ARRAY_MUTATORS = new Set<PropertyKey>([
  "push",
  "pop",
  "shift",
  "unshift",
  "splice",
  "sort",
  "reverse",
  "fill",
  "copyWithin",
]);

let arrayMutationDepth = 0;

function wrapArrayMethod(
  proxy: object,
  target: unknown[],
  name: string,
  method: (...args: unknown[]) => unknown,
): (...args: unknown[]) => unknown {
  return function (this: unknown, ...args: unknown[]): unknown {
    const before = target.length;
    arrayMutationDepth++;
    try {
      return method.apply(this, args);
    } finally {
      arrayMutationDepth--;
      if (arrayMutationDepth === 0)
        emitMutation(mutationFor("array", proxy, name, before, target.length));
    }
  };
}

function arrayIndex(key: PropertyKey): number | null {
  if (typeof key !== "string" || key === "") return null;
  const n = Number(key);
  return Number.isInteger(n) && n >= 0 && n <= 4294967294 && String(n) === key
    ? n
    : null;
}

export function state<T extends object>(obj: T, options: StateOptions = {}): T {
  const slots = new Map<PropertyKey, Slot<unknown>>();
  const kids = new Map<PropertyKey, object>();
  let methodCache:
    | Map<PropertyKey, (...args: unknown[]) => unknown>
    | undefined;
  const proxy = new Proxy(obj, {
    get(target, key) {
      const value = Reflect.get(target, key);
      if (typeof key === "symbol") return value;
      if (typeof value === "function") {
        if (Array.isArray(target) && ARRAY_MUTATORS.has(key)) {
          methodCache ??= new Map();
          let wrapped = methodCache.get(key);
          if (!wrapped) {
            wrapped = wrapArrayMethod(
              proxy,
              target as unknown[],
              key as string,
              value as (...args: unknown[]) => unknown,
            );
            methodCache.set(key, wrapped);
          }
          return wrapped;
        }
        return value;
      }
      if (activeEffect) {
        let slot = slots.get(key);
        if (!slot) {
          slot = new Slot(value, dependencyFor(proxy, key));
          slots.set(key, slot);
        }
        slot.get();
      }
      if (value !== null && typeof value === "object") {
        let child = kids.get(key);
        if (!child) {
          child = state(value);
          const meta = stateMeta.get(proxy) as StateMeta;
          stateMeta.set(child, {
            root: meta.root,
            path: [...meta.path, key],
            label: meta.label,
            namespace: meta.namespace,
          });
          kids.set(key, child);
        }
        return child;
      }
      return value;
    },
    set(target, key, value) {
      const old = Reflect.get(target, key);
      if (Object.is(value, old)) return true;
      const isArray = Array.isArray(target);
      const oldLength = isArray ? target.length : -1;
      if (!Reflect.set(target, key, value)) return false;
      const next = Reflect.get(target, key);
      if (old !== null && typeof old === "object") kids.delete(key);
      slots.get(key)?.set(next);
      if (arrayMutationDepth === 0)
        emitMutation(mutationFor("set", proxy, key, old, next));
      if (!isArray) return true;
      if (key === "length" && typeof old === "number") {
        const nextLength = Reflect.get(target, "length") as number;
        if (nextLength >= old) return true;
        for (const [slotKey, slot] of slots) {
          const index = arrayIndex(slotKey);
          if (index !== null && index >= nextLength && index < old)
            slot.set(undefined);
        }
        return true;
      }
      const index = arrayIndex(key);
      if (index !== null && index >= oldLength)
        slots.get("length")?.set(Reflect.get(target, "length"));
      return true;
    },
    deleteProperty(target, key) {
      const prev = Reflect.get(target, key);
      const slot = slots.get(key);
      if (!Reflect.deleteProperty(target, key)) return false;
      kids.delete(key);
      slot?.set(undefined);
      if (arrayMutationDepth === 0)
        emitMutation(mutationFor("delete", proxy, key, prev, undefined));
      return true;
    },
  });
  stateMeta.set(proxy, {
    root: proxy,
    path: [],
    label: options.label,
    namespace: options.namespace,
  });
  return proxy;
}

/* -------------------------------------------------------------- DOM builder */

export type Child =
  | Node
  | string
  | number
  | boolean
  | null
  | undefined
  | Child[];

export type ClassBinding = {
  readonly kind: "class";
  readonly name: string;
  readonly read: () => unknown;
};

export type AttrBinding = {
  readonly kind: "attr";
  readonly name: string;
  readonly read: () => unknown;
};

export type Props = Record<string, unknown> & {
  class?: string | ClassBinding | (string | ClassBinding | null | undefined)[];
  className?:
    | string
    | ClassBinding
    | (string | ClassBinding | null | undefined)[];
  key?: string | number;
};

const SVG_NS = "http://www.w3.org/2000/svg";
const SVG_TAGS = new Set([
  "svg",
  "g",
  "defs",
  "symbol",
  "use",
  "marker",
  "mask",
  "clipPath",
  "pattern",
  "linearGradient",
  "radialGradient",
  "stop",
  "filter",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "text",
  "tspan",
  "textPath",
  "image",
  "foreignObject",
]);

const eventProps = new WeakMap<Element, Map<string, EventListener>>();

export function h<K extends keyof SVGElementTagNameMap>(
  tag: K,
  props?: Props | null,
  children?: Child,
): SVGElementTagNameMap[K];
export function h<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props?: Props | null,
  children?: Child,
): HTMLElementTagNameMap[K];
export function h(tag: string, props?: Props | null, children?: Child): Element;
export function h(
  tag: string,
  props: Props | null = null,
  children?: Child,
): Element {
  const node: Element = SVG_TAGS.has(tag)
    ? document.createElementNS(SVG_NS, tag)
    : document.createElement(tag);
  if (props) applyProps(node, props);
  appendChild(node, children);
  return node;
}

function applyProps(node: Element, props: Props): void {
  for (const name in props) {
    if (!Object.hasOwn(props, name)) continue;
    const value = props[name];
    if (value == null || value === false) continue;
    if (name === "key") {
      key(node, value as string | number);
      continue;
    }
    if (name === "class" || name === "className") {
      applyClassProp(node, value);
      continue;
    }
    if (name === "style") {
      applyStyle(node, value);
      continue;
    }
    if (isAttrBinding(value)) {
      setReactiveAttr(node, value.name, value.read);
      continue;
    }
    if (name.startsWith("on") && typeof value === "function") {
      setEventProp(node, name.slice(2).toLowerCase(), value as EventListener);
      continue;
    }
    if (typeof value === "function") {
      setReactiveAttr(node, name, value as () => unknown);
      continue;
    }
    setAttr(node, name, value);
  }
}

function setEventProp(
  node: Element,
  type: string,
  listener: EventListener,
): void {
  node.addEventListener(type, listener);
  let events = eventProps.get(node);
  if (!events) {
    events = new Map();
    eventProps.set(node, events);
  }
  events.set(type, listener);
}

function syncEvents(live: Element, next: Element): void {
  const liveEvents = eventProps.get(live);
  const nextEvents = eventProps.get(next);
  if (!liveEvents && !nextEvents) return;
  if (liveEvents)
    for (const [type, listener] of liveEvents)
      if (nextEvents?.get(type) !== listener) {
        live.removeEventListener(type, listener);
        liveEvents.delete(type);
      }
  if (nextEvents)
    for (const [type, listener] of nextEvents) {
      if (liveEvents?.get(type) === listener) continue;
      setEventProp(live, type, listener);
    }
}

function applyStyle(node: Element, value: unknown): void {
  if (typeof value === "string") {
    node.setAttribute("style", value);
    return;
  }
  if (!value || typeof value !== "object") return;
  const style = (node as HTMLElement | SVGElement).style;
  const styles = value as Record<string, unknown>;
  for (const name in styles) {
    if (!Object.hasOwn(styles, name)) continue;
    const styleValue = styles[name];
    if (styleValue != null) style.setProperty(name, String(styleValue));
  }
}

function applyClassProp(node: Element, value: unknown): void {
  if (Array.isArray(value)) {
    for (const item of value) applyClassProp(node, item);
    return;
  }
  if (isClassBinding(value)) {
    setReactiveClass(node, value.name, value.read);
    return;
  }
  if (typeof value === "string" && value) {
    const cls = value.trim();
    if (!cls) return;
    if (typeof (node as HTMLElement).className === "string" && !node.className)
      (node as HTMLElement).className = cls;
    else node.classList.add(...cls.split(/\s+/));
  }
}

function isClassBinding(value: unknown): value is ClassBinding {
  return (
    !!value &&
    typeof value === "object" &&
    (value as { kind?: unknown }).kind === "class"
  );
}

function isAttrBinding(value: unknown): value is AttrBinding {
  return (
    !!value &&
    typeof value === "object" &&
    (value as { kind?: unknown }).kind === "attr"
  );
}

function appendChild(parent: Node, child: Child): void {
  if (Array.isArray(child)) {
    for (const c of child) appendChild(parent, c);
    return;
  }
  if (child == null || child === false || child === true) return;
  parent.appendChild(
    child instanceof Node ? child : document.createTextNode(String(child)),
  );
}

function attrValue(value: unknown): string | null {
  if (value == null || value === false) return null;
  if (value === true) return "";
  return String(value);
}

function setAttrValue(node: Element, name: string, value: string | null): void {
  if (value === null) node.removeAttribute(name);
  else node.setAttribute(name, value);
}

function setAttr(node: Element, name: string, value: unknown): void {
  setAttrValue(node, name, attrValue(value));
}

export function key<T extends Element>(node: T, value: string | number): T {
  node.setAttribute("data-loom-key", String(value));
  return node;
}

/* --------------------------------------------------------------- ownership */

const ownedEffects = new WeakMap<Node, EffectHandle[]>();
const boundText = new WeakSet<Node>();

function ownEffect(node: Node, handle: EffectHandle, ownsText = false): void {
  if (ownsText) boundText.add(node);
  const effects = ownedEffects.get(node);
  if (effects) effects.push(handle);
  else ownedEffects.set(node, [handle]);
}

export function dispose(root: Node | null): void {
  if (!(root instanceof Element)) return;
  const stack = [root];
  for (let i = 0; i < stack.length; i++) {
    const node = stack[i] as Element;
    const effects = ownedEffects.get(node);
    if (effects) {
      for (const handle of effects) handle.dispose();
      ownedEffects.delete(node);
    }
    for (
      let child = node.firstElementChild;
      child;
      child = child.nextElementSibling
    )
      stack.push(child);
  }
}

export function remove(node: Element): void {
  dispose(node);
  node.remove();
}

export function effectsOf(node: Node): readonly EffectHandle[] {
  return ownedEffects.get(node) ?? [];
}

/* ---------------------------------------------------------------- bindings */

export interface TextOptions<T = unknown> {
  format?: (value: T) => string;
  onWrite?: (text: string, prevText: string | undefined) => void;
  cleanup?: () => void;
}

function setReactiveText<T>(
  node: Element,
  read: () => T,
  options: TextOptions<T> = {},
): EffectHandle {
  let prevText: string | undefined;
  const format = options.format ?? String;
  const handle = effect(() => {
    const value = read();
    const text = format(value);
    if (text !== prevText) {
      node.textContent = text;
      options.onWrite?.(text, prevText);
      prevText = text;
    }
  }) as EffectRunner;
  if (options.cleanup) handle.addDisposeCleanup(options.cleanup);
  ownEffect(node, handle, true);
  return handle;
}

export function text<T>(
  node: Element,
  read: () => T,
  options?: TextOptions<T>,
): EffectHandle;
export function text<T>(read: () => T, options?: TextOptions<T>): HTMLElement;
export function text<T>(
  nodeOrRead: Element | (() => T),
  readOrOptions?: (() => T) | TextOptions<T>,
  maybeOptions?: TextOptions<T>,
): EffectHandle | HTMLElement {
  if (nodeOrRead instanceof Element)
    return setReactiveText(nodeOrRead, readOrOptions as () => T, maybeOptions);
  const node = document.createElement("span");
  setReactiveText(
    node,
    nodeOrRead,
    readOrOptions as TextOptions<T> | undefined,
  );
  return node;
}

function setReactiveClass(
  node: Element,
  className: string,
  read: () => unknown,
): EffectHandle {
  let prev: boolean | undefined;
  const handle = effect(() => {
    const next = !!read();
    if (next !== prev) {
      node.classList.toggle(className, next);
      prev = next;
    }
  });
  ownEffect(node, handle);
  return handle;
}

export function classed(
  node: Element,
  className: string,
  read: () => unknown,
): EffectHandle;
export function classed(className: string, read: () => unknown): ClassBinding;
export function classed(
  nodeOrClass: Element | string,
  classOrRead: string | (() => unknown),
  maybeRead?: () => unknown,
): EffectHandle | ClassBinding {
  if (nodeOrClass instanceof Element)
    return setReactiveClass(
      nodeOrClass,
      classOrRead as string,
      maybeRead as () => unknown,
    );
  return {
    kind: "class",
    name: nodeOrClass,
    read: classOrRead as () => unknown,
  };
}

function setReactiveAttr(
  node: Element,
  name: string,
  read: () => unknown,
): EffectHandle {
  let prev: string | null | undefined;
  const handle = effect(() => {
    const next = attrValue(read());
    if (next !== prev) {
      setAttrValue(node, name, next);
      prev = next;
    }
  });
  ownEffect(node, handle);
  return handle;
}

export function attr(
  node: Element,
  name: string,
  read: () => unknown,
): EffectHandle;
export function attr(name: string, read: () => unknown): AttrBinding;
export function attr(
  nodeOrName: Element | string,
  nameOrRead: string | (() => unknown),
  maybeRead?: () => unknown,
): EffectHandle | AttrBinding {
  if (nodeOrName instanceof Element)
    return setReactiveAttr(
      nodeOrName,
      nameOrRead as string,
      maybeRead as () => unknown,
    );
  return { kind: "attr", name: nodeOrName, read: nameOrRead as () => unknown };
}

/* ------------------------------------------------------------------ patch */

export function patch(live: Element, next: Element | (() => Element)): Element {
  const built = typeof next === "function" ? next() : next;
  emitPatch({ kind: "patch", size: 1, container: live });
  if (live.tagName !== built.tagName) {
    dispose(live);
    live.replaceWith(built);
    return built;
  }
  patchNode(live, built);
  if (built !== live) dispose(built);
  return live;
}

export function render(container: Element, build: () => Element): Element {
  const next = build();
  const live = container.firstElementChild;
  if (!live) {
    container.appendChild(next);
    return next;
  }
  const current = patch(live, next);
  for (let node = current.nextElementSibling; node; ) {
    const nextSibling = node.nextElementSibling;
    remove(node);
    node = nextSibling;
  }
  return current;
}

function childArray(node: Node): ChildNode[] {
  const out: ChildNode[] = [];
  const kids = node.childNodes;
  for (let i = 0; i < kids.length; i++) {
    out.push(kids[i] as ChildNode);
  }
  return out;
}

function isKeyed(kids: ChildNode[]): kids is Element[] {
  for (const node of kids)
    if (!(node instanceof Element) || !node.hasAttribute("data-loom-key"))
      return false;
  return true;
}

function keyedChildArray(node: Node): Element[] | null {
  const kids = node.childNodes;
  const out: Element[] = new Array(kids.length);
  for (let i = 0; i < kids.length; i++) {
    const child = kids[i];
    if (!(child instanceof Element) || !child.hasAttribute("data-loom-key"))
      return null;
    out[i] = child;
  }
  return out;
}

function patchNode(live: ChildNode, next: ChildNode): void {
  if (boundText.has(live)) {
    /* v8 ignore else -- text() creates bound Element nodes. */
    if (live instanceof Element && next instanceof Element)
      syncElement(live, next);
    return;
  }
  /* v8 ignore if -- callers pre-filter incompatible child node kinds. */
  if (live.nodeType !== next.nodeType) {
    dispose(live);
    live.replaceWith(next);
    return;
  }
  if (!(live instanceof Element) || !(next instanceof Element)) {
    if (live.nodeValue !== next.nodeValue) live.nodeValue = next.nodeValue;
    return;
  }
  syncElement(live, next);
  if (!next.childNodes.length) {
    while (live.firstChild) {
      const child = live.firstChild;
      dispose(child);
      child.remove();
    }
    return;
  }
  if (!live.childNodes.length) {
    while (next.firstChild) live.appendChild(next.firstChild);
    return;
  }
  const current = childArray(live);
  if (isKeyed(current)) {
    const keyedNext = keyedChildArray(next);
    if (keyedNext) {
      patchKeyedChildren(live, current, keyedNext);
      return;
    }
  }
  let i = 0;
  let nextChild: ChildNode | null = next.firstChild;
  while (nextChild) {
    const incoming: ChildNode = nextChild;
    nextChild = nextChild.nextSibling;
    const existing = current[i++];
    if (!existing) {
      live.appendChild(incoming);
      continue;
    }
    const existingBound =
      existing instanceof Element && boundText.has(existing);
    const incomingBound =
      incoming instanceof Element && boundText.has(incoming);
    if (existingBound || incomingBound) {
      const existingKey =
        existing instanceof Element
          ? existing.getAttribute("data-loom-key")
          : null;
      const incomingKey =
        incoming instanceof Element
          ? incoming.getAttribute("data-loom-key")
          : null;
      if (existingBound && incomingBound && existingKey === incomingKey)
        syncElement(existing as Element, incoming as Element);
      else {
        dispose(existing);
        existing.replaceWith(incoming);
      }
      continue;
    }
    const sameKind =
      existing instanceof Element && incoming instanceof Element
        ? existing.tagName === incoming.tagName
        : existing.nodeType === incoming.nodeType;
    if (sameKind) patchNode(existing, incoming);
    else {
      dispose(existing);
      existing.replaceWith(incoming);
    }
  }
  for (let j = i; j < current.length; j++) {
    const extra = current[j] as ChildNode;
    dispose(extra);
    extra.remove();
  }
}

function syncElement(live: Element, next: Element): void {
  syncAttrs(live, next);
  syncEvents(live, next);
}

function syncAttrs(live: Element, next: Element): void {
  for (let i = live.attributes.length - 1; i >= 0; i--) {
    const attr = live.attributes[i];
    if (attr && !next.hasAttribute(attr.name)) live.removeAttribute(attr.name);
  }
  for (let i = 0; i < next.attributes.length; i++) {
    const attr = next.attributes[i];
    if (attr && live.getAttribute(attr.name) !== attr.value)
      live.setAttribute(attr.name, attr.value);
  }
}

function loomKey(node: Element): string {
  return node.getAttribute("data-loom-key") ?? "";
}

function assertUniqueKey(value: string, seen: Set<string>): void {
  if (seen.has(value)) throw new Error(`Duplicate Loom key "${value}".`);
  seen.add(value);
}

function assertUniqueElementKeys(nodes: readonly Element[]): void {
  if (duplicateKeys !== "throw") return;
  const seen = new Set<string>();
  for (const node of nodes) assertUniqueKey(loomKey(node), seen);
}

function modelKeys<Model>(
  models: readonly Model[],
  keyOf: (model: Model) => string,
): string[] | null {
  if (duplicateKeys !== "throw") return null;
  const seen = new Set<string>();
  const keys: string[] = [];
  for (const model of models) {
    const modelKey = keyOf(model);
    assertUniqueKey(modelKey, seen);
    keys.push(modelKey);
  }
  return keys;
}

function patchKeyedChildren(parent: Element, a: Element[], b: Element[]): void {
  const byKey = new Map<string, Element>();
  const seen = duplicateKeys === "throw" ? new Set<string>() : null;
  for (const node of a) {
    const nodeKey = loomKey(node);
    if (seen) assertUniqueKey(nodeKey, seen);
    byKey.set(nodeKey, node);
  }
  assertUniqueElementKeys(b);
  let prev: ChildNode | null = null;
  for (const nextNode of b) {
    const nodeKey = loomKey(nextNode);
    const existing = byKey.get(nodeKey);
    const node = existing ?? nextNode;
    if (existing) {
      byKey.delete(nodeKey);
      patchNode(existing, nextNode);
    }
    const ref: ChildNode | null = prev ? prev.nextSibling : parent.firstChild;
    if (node !== ref) parent.insertBefore(node, ref);
    prev = node;
  }
  for (const node of byKey.values()) remove(node);
}

function patchList<Model>(
  container: Element,
  models: readonly Model[],
  keyOf: (model: Model) => string,
  build: (model: Model, key: string) => Element,
): void {
  emitPatch({ kind: "list", size: models.length, container });
  const keys = modelKeys(models, keyOf);
  if (!container.firstChild) {
    const fragment = document.createDocumentFragment();
    let i = 0;
    for (const model of models) {
      const modelKey = keys ? (keys[i] as string) : keyOf(model);
      i++;
      fragment.appendChild(build(model, modelKey));
    }
    container.appendChild(fragment);
    return;
  }
  const existing = new Map<string, Element>();
  const seen = duplicateKeys === "throw" ? new Set<string>() : null;
  for (const node of container.children) {
    const nodeKey = loomKey(node);
    if (seen) assertUniqueKey(nodeKey, seen);
    existing.set(nodeKey, node);
  }
  let prev: ChildNode | null = null;
  let i = 0;
  for (const model of models) {
    const modelKey = keys ? (keys[i] as string) : keyOf(model);
    i++;
    const existingNode = existing.get(modelKey);
    const node = existingNode ?? build(model, modelKey);
    if (existingNode) existing.delete(modelKey);
    const ref: ChildNode | null = prev
      ? prev.nextSibling
      : container.firstChild;
    if (node !== ref) container.insertBefore(node, ref);
    prev = node;
  }
  for (const node of existing.values()) remove(node);
}

export interface ListOptions<Model> {
  key: (model: Model) => string | number;
  render: (model: Model) => Element;
}

export function list<Model>(
  container: Element,
  models: readonly Model[],
  options: ListOptions<Model>,
): void;
export function list<Model>(
  container: Element,
  models: () => readonly Model[],
  options: ListOptions<Model>,
): EffectHandle;
export function list<Model>(
  container: Element,
  models: readonly Model[] | (() => readonly Model[]),
  options: ListOptions<Model>,
): EffectHandle | undefined {
  const keyOf = (model: Model): string => String(options.key(model));
  const build = (model: Model, modelKey: string): Element =>
    key(options.render(model), modelKey);
  if (typeof models === "function") {
    const handle = effect(() => {
      patchList(container, models(), keyOf, build);
    });
    ownEffect(container, handle);
    return handle;
  }
  patchList(container, models, keyOf, build);
}
