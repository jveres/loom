import {
  computed as alienComputed,
  effect as alienEffect,
  signal as alienSignal,
  trigger as alienTrigger,
  endBatch,
  setActiveSub,
  startBatch,
} from "alien-signals";

export interface State<T> {
  (): T;
  (next: T): void;
}

export type Read<T> = () => T;
export type Stop = () => void;
export type EffectFn = () => void;

export type Fields<T extends object> = {
  readonly [K in keyof T]: State<T[K]>;
};

export function state<T>(initial: T): State<T> {
  return alienSignal(initial);
}

export const signal = state;

export function computed<T>(read: (previousValue?: T) => T): Read<T> {
  return alienComputed(read);
}

export function effect(fn: EffectFn): Stop {
  return alienEffect(fn);
}

export function batch<T>(fn: () => T): T {
  startBatch();
  try {
    return fn();
  } finally {
    endBatch();
  }
}

export function trigger(source: Read<unknown>): void {
  alienTrigger(source as () => void);
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
  const out = {} as { [K in keyof T]: State<T[K]> };
  for (const key of Reflect.ownKeys(initial) as Array<keyof T>) {
    if (!Object.prototype.propertyIsEnumerable.call(initial, key)) continue;
    out[key] = state(initial[key]);
  }
  return out;
}

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
