import { failSetup } from "../core/lifetime.js";
import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";

export interface AfterAnimationOptions {
  readonly name?: string;
  readonly signal?: AbortSignal;
}
export interface AfterTransitionOptions {
  readonly property: string;
  readonly signal?: AbortSignal;
}
const part = (raw: string, index: number): string => {
  const parts = raw.split(",");
  return (parts[index % parts.length] ?? "").trim();
};
const ms = (raw: string, index: number): number => {
  const value = part(raw, index);
  const n = Number.parseFloat(value) || 0;
  return value.endsWith("ms") ? n : n * 1000;
};

function completion(
  el: HTMLElement,
  run: () => void,
  kind: "animation" | "transition",
  options: AfterAnimationOptions | AfterTransitionOptions,
): Stop {
  const life = nodeLifetime(el, options.signal);
  if (!life.active) return life.stop;
  try {
    const realm = el.ownerDocument.defaultView ?? globalThis;
    const style = realm.getComputedStyle(el);
    const pending = new Map<string, number>();
    let wait = 0;
    if (kind === "animation") {
      const name = (options as AfterAnimationOptions).name;
      const names = style.animationName.split(",").map((s) => s.trim());
      for (let i = 0; i < names.length; i++) {
        const current = names[i];
        if (
          !current ||
          current === "none" ||
          (name !== undefined && name !== current)
        )
          continue;
        const rawCount = part(style.animationIterationCount, i);
        const count =
          rawCount === "infinite"
            ? Infinity
            : Math.max(0, Number(rawCount || "1"));
        const duration = ms(style.animationDuration, i);
        const total =
          count === Infinity
            ? Infinity
            : Math.max(0, duration * count + ms(style.animationDelay, i));
        if (total === 0) continue;
        pending.set(current, (pending.get(current) ?? 0) + 1);
        wait = Math.max(wait, total);
      }
    } else {
      const property = (options as AfterTransitionOptions).property;
      const names = style.transitionProperty.split(",").map((s) => s.trim());
      // The last matching transition descriptor wins, including `all`.
      let index = -1;
      names.forEach((name, i) => {
        if (name === property || name === "all") index = i;
      });
      if (index >= 0)
        wait = Math.max(
          0,
          ms(style.transitionDuration, index) +
            ms(style.transitionDelay, index),
        );
      if (wait > 0) pending.set(property, 1);
    }
    const finish = (): void => {
      if (!life.active) return;
      life.stop();
      untrack(run);
    };
    const event = (raw: Event): void => {
      if (!life.active || raw.target !== el) return;
      const name =
        kind === "animation"
          ? (raw as AnimationEvent).animationName
          : (raw as TransitionEvent).propertyName;
      const count = pending.get(name);
      if (count === undefined) return;
      if (count > 1) pending.set(name, count - 1);
      else pending.delete(name);
      if (pending.size === 0) finish();
    };
    el.addEventListener(`${kind}end`, event);
    el.addEventListener(`${kind}cancel`, event);
    life.add(() => {
      el.removeEventListener(`${kind}end`, event);
      el.removeEventListener(`${kind}cancel`, event);
    });
    if (pending.size === 0) queueMicrotask(finish);
    else if (Number.isFinite(wait)) {
      const timer = realm.setTimeout(finish, wait + 50);
      life.add(() => realm.clearTimeout(timer));
    }
  } catch (error) {
    failSetup(life, error);
  }
  return life.stop;
}

/** Wait for selected CSS animations; infinite animations require end/cancel events. */
export function afterAnimation(
  el: HTMLElement,
  run: () => void,
  options: AfterAnimationOptions = {},
): Stop {
  return completion(el, run, "animation", options);
}
/** Wait for one CSS property to finish transitioning, with a computed-time fallback. */
export function afterTransition(
  el: HTMLElement,
  run: () => void,
  options: AfterTransitionOptions,
): Stop {
  return completion(el, run, "transition", options);
}
