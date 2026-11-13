import { failSetup } from "../core/lifetime.js";
import { untrack } from "../core/tracking.js";
import { domEffect, type State, type Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";
import { ownStoppableResource } from "./ownership-base.js";

const none = /* @__PURE__ */ Symbol();

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
  const prop = options.property ?? "value";
  const target = el as unknown as Record<string, string | boolean>;
  let latest = target[prop] as string | boolean;
  let own: unknown = none;
  let writing = false;
  let composing = false;
  let held = false;
  const sync = (): void => {
    if (life.active && target[prop] !== latest) target[prop] = latest;
  };
  const handlers: readonly [string, EventListener][] = [
    ["blur", sync],
    [
      prop === "checked" ? "change" : "input",
      (event: Event): void => {
        if (!life.active) return;
        if ((event as InputEvent).isComposing) composing = true;
        held = false;
        latest = target[prop] as string | boolean;
        writing = true;
        try {
          untrack(() => {
            (cell as (v: string | boolean) => void)(latest);
            own = cell();
          });
        } finally {
          writing = false;
        }
      },
    ],
    [
      "compositionstart",
      (): void => {
        composing = true;
      },
    ],
    [
      "compositionend",
      (): void => {
        composing = false;
        if (held) {
          held = false;
          sync();
        }
      },
    ],
  ];
  for (const [type, fn] of handlers) el.addEventListener(type, fn);
  life.add(() => {
    for (const [type, fn] of handlers) el.removeEventListener(type, fn);
  });
  try {
    life.add(
      ownStoppableResource(
        el,
        domEffect(
          () => {
            latest = cell();
            if (writing || latest === own) return;
            own = none;
            if (composing) held = true;
            else sync();
          },
          "dom.bindValue",
          el,
        ),
      ),
    );
  } catch (error) {
    failSetup(life, error);
  }
  return life.stop;
}
