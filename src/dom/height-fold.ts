import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import { afterTransition } from "./css-completion.js";
import { nodeLifetime } from "./lifetime.js";

export interface HeightFoldOptions {
  readonly signal?: AbortSignal;
  readonly onStart?: (open: boolean) => void;
  readonly onSettle?: (open: boolean) => void;
}
export interface HeightFold {
  readonly set: (open: boolean) => void;
  readonly stop: Stop;
}
/** Animate height using the element's CSS transition; remeasure on every expansion. */
export function heightFold(
  el: HTMLElement,
  options: HeightFoldOptions = {},
): HeightFold {
  const life = nodeLifetime(el, options.signal);
  const originalHeight = el.style.height;
  const originalPriority = el.style.getPropertyPriority("height");
  const originalHidden = el.hidden;
  let ownedHeight: string | undefined;
  let ownedHidden: boolean | undefined;
  let pending: Stop | undefined;
  let revision = 0;
  const height = (value: string): void => {
    el.style.height = value;
    ownedHeight = el.style.height;
  };
  const hidden = (value: boolean): void => {
    el.hidden = value;
    ownedHidden = value;
  };
  life.add(() => {
    revision++;
    pending?.();
    if (
      ownedHeight !== undefined &&
      el.style.height === ownedHeight &&
      el.style.getPropertyPriority("height") === ""
    ) {
      if (originalHeight)
        el.style.setProperty("height", originalHeight, originalPriority);
      else el.style.removeProperty("height");
    }
    if (ownedHidden !== undefined && el.hidden === ownedHidden)
      el.hidden = originalHidden;
  });
  return {
    stop: life.stop,
    set(open) {
      if (!life.active) return;
      const current = ++revision;
      const interrupted = pending !== undefined;
      pending?.();
      pending = undefined;
      untrack(() => options.onStart?.(open));
      if (!life.active || revision !== current) return;
      if (open) {
        hidden(false);
        const from = interrupted ? el.offsetHeight : 0;
        height("");
        const to = el.offsetHeight;
        height(`${from}px`);
        void el.offsetHeight;
        height(`${to}px`);
      } else {
        height(`${el.offsetHeight}px`);
        void el.offsetHeight;
        height("0px");
      }
      pending = afterTransition(
        el,
        () => {
          if (!life.active || revision !== current) return;
          pending = undefined;
          if (open) height("");
          else hidden(true);
          untrack(() => options.onSettle?.(open));
        },
        { property: "height" },
      );
    },
  };
}
