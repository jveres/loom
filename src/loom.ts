import {
  createReactiveSystem,
  type Link,
  type ReactiveNode,
} from "alien-signals/system";

const Mutable = 1;
const Watching = 2;
const RecursedCheck = 4;
const Recursed = 8;
const Dirty = 16;
const Pending = 32;
const HasChildEffect = 64;

export interface State<T> {
  (): T;
  (next: T): void;
}

export type Read<T> = () => T;
export type Stop = () => void;
export type EffectFn = () => void;
type CleanupEffectFn = () => Stop;
type InternalEffectFn = EffectFn | CleanupEffectFn;

type FieldKey<T extends object> = Extract<keyof T, string>;

export type Fields<T extends object> = {
  readonly [K in FieldKey<T>]: State<T[K]>;
};

type NodeBase = ReactiveNode & {
  deps?: Link | undefined;
  depsTail?: Link | undefined;
  subs?: Link | undefined;
  subsTail?: Link | undefined;
};

interface StateNode<T> extends NodeBase {
  currentValue: T;
  pendingValue: T;
}

interface ComputedNode<T> extends NodeBase {
  value: T | undefined;
  getter(previousValue?: T): T;
}

interface EffectNode extends NodeBase {
  fn: InternalEffectFn;
  cleanup: Stop | undefined;
}

let cycle = 0;
let runDepth = 0;
let batchDepth = 0;
let notifyIndex = 0;
let queuedLength = 0;
let activeSub: NodeBase | undefined;
const queued: Array<EffectNode | undefined> = [];

const { link, unlink, propagate, checkDirty, shallowPropagate } =
  createReactiveSystem({
    update(node) {
      if ("getter" in node)
        return updateComputed(node as ComputedNode<unknown>);
      if ("currentValue" in node)
        return updateState(node as StateNode<unknown>);
      node.flags = Mutable;
      return true;
    },
    notify(node) {
      queueEffect(node as EffectNode);
    },
    unwatched(node) {
      if ("getter" in node) {
        if (node.depsTail !== undefined) {
          node.flags = Mutable | Dirty;
          disposeDeps(node as ComputedNode<unknown>);
        }
      } else if ("currentValue" in node) {
        return;
      } else if ("fn" in node) {
        stopEffect.call(node as EffectNode);
      } else {
        disposeDeps(node as NodeBase);
      }
    },
  });

export function state<T>(initial: T): State<T> {
  return stateOper.bind(createStateNode(initial)) as State<T>;
}

export const signal = state;

export function computed<T>(getter: (previousValue?: T) => T): Read<T> {
  return computedOper.bind(createComputedNode(getter)) as Read<T>;
}

export function effect(fn: CleanupEffectFn): Stop;
export function effect(fn: EffectFn): Stop;
export function effect(fn: InternalEffectFn): Stop {
  const node = createEffectNode(fn);
  const previous = setActiveSub(node);
  if (previous !== undefined) {
    link(node, previous, 0);
    previous.flags |= HasChildEffect;
  }
  try {
    runDepth++;
    node.cleanup = node.fn() as Stop | undefined;
  } finally {
    runDepth--;
    activeSub = previous;
    node.flags &= ~RecursedCheck;
  }
  return stopEffect.bind(node);
}

export function batch<T>(fn: () => T): T {
  batchDepth++;
  try {
    return fn();
  } finally {
    if (--batchDepth === 0) flush();
  }
}

export function trigger(source: Read<unknown>): void {
  const sub = createWatcherNode();
  const previous = setActiveSub(sub);
  try {
    source();
  } finally {
    activeSub = previous;
    sub.flags = 0;
    let dep = sub.deps;
    while (dep !== undefined) {
      const node = dep.dep;
      dep = unlink(dep, sub);
      const subs = node.subs;
      if (subs !== undefined) {
        propagate(subs, runDepth > 0);
        shallowPropagate(subs);
      }
    }
    if (batchDepth === 0) flush();
  }
}

export function untrack<T>(fn: () => T): T {
  const previous = setActiveSub(undefined);
  try {
    return fn();
  } finally {
    setActiveSub(previous);
  }
}

export function update<T>(source: State<T>, fn: (value: T) => T): void {
  source(fn(source()));
}

export function mutate<T extends object>(
  source: State<T>,
  fn: (value: T) => void,
): void {
  fn(source());
  trigger(source);
}

export function fields<T extends object>(initial: T): Fields<T> {
  if (!isPlainObject(initial)) {
    throw new TypeError("fields() expects a plain object.");
  }
  const out = {} as { [K in FieldKey<T>]: State<T[K]> };
  const keys = Object.keys(initial) as Array<FieldKey<T>>;
  for (let index = 0; index < keys.length; index++) {
    const key = keys[index] as FieldKey<T>;
    out[key] = state(initial[key]);
  }
  return out;
}

function createStateNode<T>(initial: T): StateNode<T> {
  return nodeShape<StateNode<T>>({
    currentValue: initial,
    pendingValue: initial,
    subs: undefined,
    subsTail: undefined,
    flags: Mutable,
  });
}

function createComputedNode<T>(
  getter: (previousValue?: T) => T,
): ComputedNode<T> {
  return nodeShape<ComputedNode<T>>({
    value: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 0,
    getter,
  });
}

function createEffectNode(fn: InternalEffectFn): EffectNode {
  return nodeShape<EffectNode>({
    fn,
    cleanup: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: Watching | RecursedCheck,
  });
}

function createWatcherNode(): NodeBase {
  return nodeShape<NodeBase>({
    deps: undefined,
    depsTail: undefined,
    flags: Watching,
  });
}

function nodeShape<TNode extends NodeBase>(node: object): TNode {
  return node as unknown as TNode;
}

function setActiveSub(sub: NodeBase | undefined): NodeBase | undefined {
  const previous = activeSub;
  activeSub = sub;
  return previous;
}

function stateOper<T>(this: StateNode<T>, ...value: [] | [T]): T | undefined {
  if (value.length) {
    const next = value[0] as T;
    if (this.pendingValue !== next) {
      this.pendingValue = next;
      this.flags = Mutable | Dirty;
      const subs = this.subs;
      if (subs !== undefined) {
        propagate(subs, runDepth > 0);
        if (batchDepth === 0) flush();
      }
    }
    return undefined;
  }

  if (this.flags & Dirty) {
    if (updateState(this)) {
      const subs = this.subs;
      if (subs !== undefined) shallowPropagate(subs);
    }
  }

  const sub = activeSub;
  if (sub !== undefined) link(this, sub, cycle);
  return this.currentValue;
}

function computedOper<T>(this: ComputedNode<T>): T {
  const flags = this.flags;
  let shouldUpdate = (flags & Dirty) !== 0;
  if (!shouldUpdate && flags & Pending) {
    shouldUpdate = checkDirty(this.deps as Link, this);
    if (!shouldUpdate) this.flags = flags & ~Pending;
  }

  if (shouldUpdate) {
    if (updateComputed(this)) {
      const subs = this.subs;
      if (subs !== undefined) shallowPropagate(subs);
    }
  } else if (!flags) {
    this.flags = Mutable | RecursedCheck;
    const previous = setActiveSub(this);
    try {
      this.value = this.getter();
    } finally {
      activeSub = previous;
      this.flags &= ~RecursedCheck;
    }
  }

  const sub = activeSub;
  if (sub !== undefined) link(this, sub, cycle);
  return this.value as T;
}

function updateComputed<T>(node: ComputedNode<T>): boolean {
  if (node.flags & HasChildEffect) disposeChildDeps(node);
  clearDepsTail(node);
  node.flags = Mutable | RecursedCheck;
  const previous = setActiveSub(node);
  try {
    cycle++;
    const oldValue = node.value;
    const newValue = node.getter(oldValue);
    node.value = newValue;
    return oldValue !== newValue;
  } finally {
    activeSub = previous;
    node.flags &= ~RecursedCheck;
    purgeDeps(node);
  }
}

function updateState<T>(node: StateNode<T>): boolean {
  node.flags = Mutable;
  const oldValue = node.currentValue;
  node.currentValue = node.pendingValue;
  return oldValue !== node.currentValue;
}

function queueEffect(effect: EffectNode): void {
  let current: EffectNode | undefined = effect;
  let insertIndex = queuedLength;
  let firstInsertedIndex = insertIndex;
  while (current !== undefined) {
    queued[insertIndex++] = current;
    current.flags &= ~Watching;
    current = current.subs?.sub as EffectNode | undefined;
    if (current === undefined || !(current.flags & Watching)) break;
  }

  queuedLength = insertIndex;
  while (firstInsertedIndex < --insertIndex) {
    const left = queued[firstInsertedIndex];
    queued[firstInsertedIndex++] = queued[insertIndex];
    queued[insertIndex] = left;
  }
}

function runEffect(node: EffectNode): void {
  const flags = node.flags;
  if (
    flags & Dirty ||
    (flags & Pending && checkDirty(node.deps as Link, node))
  ) {
    if (flags & HasChildEffect) disposeChildDeps(node);
    if (node.cleanup) {
      runCleanup(node);
      if (!node.flags) return;
    }
    clearDepsTail(node);
    node.flags = Watching | RecursedCheck;
    const previous = setActiveSub(node);
    try {
      cycle++;
      runDepth++;
      node.cleanup = node.fn() as Stop | undefined;
    } finally {
      runDepth--;
      activeSub = previous;
      node.flags &= ~RecursedCheck;
      purgeDeps(node);
    }
  } else if (node.deps !== undefined) {
    node.flags = Watching | (flags & HasChildEffect);
  }
}

function flush(): void {
  try {
    while (notifyIndex < queuedLength) {
      const node = queued[notifyIndex];
      queued[notifyIndex++] = undefined;
      if (node) runEffect(node);
    }
  } finally {
    while (notifyIndex < queuedLength) {
      const node = queued[notifyIndex];
      queued[notifyIndex++] = undefined;
      if (node) node.flags |= Watching | Recursed;
    }
    notifyIndex = 0;
    queuedLength = 0;
  }
}

function stopEffect(this: EffectNode): void {
  this.flags = 0;
  disposeDeps(this);
  const sub = this.subs;
  if (sub !== undefined) unlink(sub);
  if (this.cleanup) runCleanup(this);
}

function runCleanup(node: EffectNode): void {
  const cleanup = node.cleanup;
  node.cleanup = undefined;
  const previous = setActiveSub(undefined);
  try {
    cleanup?.();
  } finally {
    activeSub = previous;
  }
}

function clearDepsTail(node: NodeBase): void {
  (node as { depsTail: Link | undefined }).depsTail = undefined;
}

function disposeChildDeps(sub: NodeBase): void {
  let dep = sub.depsTail;
  while (dep !== undefined) {
    const previous = dep.prevDep;
    const node = dep.dep;
    if (!("getter" in node) && !("currentValue" in node)) unlink(dep, sub);
    dep = previous;
  }
}

function disposeDeps(sub: NodeBase): void {
  let dep = sub.depsTail;
  while (dep !== undefined) {
    const previous = dep.prevDep;
    unlink(dep, sub);
    dep = previous;
  }
}

function purgeDeps(sub: NodeBase): void {
  const depsTail = sub.depsTail;
  let dep = depsTail !== undefined ? depsTail.nextDep : sub.deps;
  while (dep !== undefined) {
    dep = unlink(dep, sub);
  }
}

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
