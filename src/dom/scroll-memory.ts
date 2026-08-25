// scrollMemory(host, cellFor) — keyed scroll-position memory over ONE
// scroll host whose content is swapped per key (a pane body showing
// different panes): the host's scroll listener persists the position
// into the key's cell, `restore(key)` stamps the new key and puts its
// position back after the caller's synchronous content swap.
//
// The RESTORE-WINDOW guard: the swap clamps scrollTop to 0 and fires a
// scroll event — WebKit can deliver it BEFORE the restore microtask, so
// a naive listener persisted the clamp's 0 and the restore then
// faithfully restored 0. Persistence is SUSPENDED from the stamp to one
// frame after the restore write; a real user scroll inside that window
// re-persists on its next event. Listener and pending restore die with
// the host.
import { type State, untrack } from "../loom.js";
import { listen } from "./listen.js";
import { nextFrame } from "./next-frame.js";
import { onUnmount } from "./ownership-base.js";

export interface ScrollMemory {
  /** Stamp `key` and queue its position restore (after the caller's
   *  synchronous content swap). */
  restore(key: string): void;
  /** Detach early (the host's teardown does the same). */
  stop(): void;
}

export function scrollMemory(
  host: HTMLElement,
  cellFor: (key: string) => State<number>,
): ScrollMemory {
  let key = "";
  let restoring = false;
  let live = true;
  const stopListen = listen(
    host,
    host,
    "scroll",
    () => {
      if (restoring || !key) return;
      cellFor(key)(host.scrollTop);
    },
    { passive: true },
  );
  const stopUnmount = onUnmount(host, () => {
    live = false;
  });
  return {
    restore(next) {
      key = next;
      restoring = true;
      const cell = cellFor(next);
      queueMicrotask(() => {
        if (!live) return;
        host.scrollTop = untrack(() => cell());
        // Release NEXT frame — the clamp's scroll event may land
        // between the write above and its delivery.
        nextFrame(() => {
          restoring = false;
        }, host);
      });
    },
    stop() {
      live = false;
      stopListen();
      stopUnmount();
    },
  };
}
