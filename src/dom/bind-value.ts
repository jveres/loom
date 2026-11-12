import { failSetup } from "../core/lifetime.js";
import { untrack } from "../core/tracking.js";
import { domEffect, type State, type Stop, stopEffectNode } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";
import { ownResource } from "./ownership-base.js";

const NONE = Symbol();

export interface BindValueOptions {
  readonly property?: "value" | "checked";
  readonly signal?: AbortSignal;
}
export function bindValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  cell: State<string>,
  options?: BindValueOptions & { readonly property?: "value" },
): Stop;
export function bindValue(
  el: HTMLInputElement,
  cell: State<boolean>,
  options: BindValueOptions & { readonly property: "checked" },
): Stop;
export function bindValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  cell: State<string> | State<boolean>,
  options: BindValueOptions = {},
): Stop {
  const life = nodeLifetime(el, options.signal);
  if (!life.active) return life.stop;
  const checked = options.property === "checked";
  const readDOM = (): string | boolean =>
    checked ? (el as HTMLInputElement).checked : el.value;
  let latest = readDOM();
  // The state's value after the field's own event. It is never written back, so typing keeps
  // the caret; a state that rewrites the value shows its value when focus leaves.
  let own: unknown = NONE;
  let writing = false;
  // An outside change during an IME composition waits for its end; the last value wins.
  let composing = false;
  let held = false;
  const sync = (): void => {
    if (!life.active || readDOM() === latest) return;
    if (checked) (el as HTMLInputElement).checked = latest as boolean;
    else el.value = latest as string;
  };
  const write = (event: Event): void => {
    if (!life.active) return;
    if ((event as InputEvent).isComposing) composing = true;
    held = false;
    latest = readDOM();
    writing = true;
    try {
      untrack(() => {
        if (checked) (cell as State<boolean>)(latest as boolean);
        else (cell as State<string>)(latest as string);
        own = cell();
      });
    } finally {
      writing = false;
    }
  };
  const compose = (): void => {
    composing = true;
  };
  const settle = (): void => {
    composing = false;
    if (held) {
      held = false;
      sync();
    }
  };
  const event = checked ? "change" : "input";
  el.addEventListener("blur", sync);
  el.addEventListener(event, write);
  el.addEventListener("compositionstart", compose);
  el.addEventListener("compositionend", settle);
  life.add(() => {
    el.removeEventListener("blur", sync);
    el.removeEventListener(event, write);
    el.removeEventListener("compositionstart", compose);
    el.removeEventListener("compositionend", settle);
  });
  try {
    const handle = domEffect(
      () => {
        latest = cell();
        if (writing || latest === own) return;
        own = NONE;
        if (composing) held = true;
        else sync();
      },
      "dom.bindValue",
      el,
    );
    ownResource(el, handle);
    life.add(() => stopEffectNode(handle));
  } catch (error) {
    failSetup(life, error);
  }
  return life.stop;
}
