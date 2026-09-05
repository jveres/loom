import { untrack } from "../core/tracking.js";
import type { State, Stop } from "../loom.js";
import { afterFrames } from "../schedule.js";
import { nodeLifetime } from "./lifetime.js";

export interface ScrollMemory {
  readonly restore: (key: string) => void;
  readonly stop: Stop;
}
export interface ScrollMemoryOptions {
  readonly axis?: "x" | "y";
  readonly signal?: AbortSignal;
}
/** Remember positions for one host; the latest restore wins across pending frames. */
export function scrollMemory(
  host: HTMLElement,
  cellFor: (key: string) => State<number>,
  options: ScrollMemoryOptions = {},
): ScrollMemory {
  const life = nodeLifetime(host, options.signal);
  let key: string | undefined;
  let restoring = false;
  let revision = 0;
  let pending: Stop | undefined;
  const horizontal = options.axis === "x";
  const scroll = (): void => {
    if (!life.active || restoring || key === undefined) return;
    const current = key;
    untrack(() =>
      cellFor(current)(horizontal ? host.scrollLeft : host.scrollTop),
    );
  };
  if (life.active) {
    host.addEventListener("scroll", scroll, { passive: true });
    life.add(() => {
      host.removeEventListener("scroll", scroll);
      pending?.();
    });
  }
  return {
    stop: life.stop,
    restore(next) {
      if (!life.active) return;
      const current = ++revision;
      key = next;
      restoring = true;
      pending?.();
      const cell = untrack(() => cellFor(next));
      queueMicrotask(() => {
        if (!life.active || current !== revision) return;
        if (horizontal) host.scrollLeft = untrack(() => cell());
        else host.scrollTop = untrack(() => cell());
        pending = afterFrames(
          1,
          () => {
            if (life.active && current === revision) restoring = false;
          },
          { window: host.ownerDocument.defaultView ?? globalThis },
        );
      });
    },
  };
}
