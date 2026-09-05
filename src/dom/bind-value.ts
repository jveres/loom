import { failSetup } from "../core/lifetime.js";
import { untrack } from "../core/tracking.js";
import { domEffect, type State, type Stop, stopEffectNode } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";
import { ownResource } from "./ownership-base.js";

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
  const sync = (): void => {
    if (!life.active || readDOM() === latest) return;
    if (checked) (el as HTMLInputElement).checked = latest as boolean;
    else el.value = latest as string;
  };
  const write = (): void => {
    if (!life.active) return;
    latest = readDOM();
    untrack(() => {
      if (checked) (cell as State<boolean>)(latest as boolean);
      else (cell as State<string>)(latest as string);
    });
  };
  const event = checked ? "change" : "input";
  el.addEventListener("blur", sync);
  el.addEventListener(event, write);
  life.add(() => {
    el.removeEventListener("blur", sync);
    el.removeEventListener(event, write);
  });
  try {
    const handle = domEffect(
      () => {
        latest = cell();
        if (el.ownerDocument.activeElement !== el) sync();
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
