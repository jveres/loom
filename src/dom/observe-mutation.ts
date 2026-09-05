import { failSetup } from "../core/lifetime.js";
import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";

export type MutationsCallback = (records: MutationRecord[]) => void;
export interface ObserveMutationOptions extends MutationObserverInit {
  readonly signal?: AbortSignal;
}
/** @internal Connection-owned observation, independent of node disposal. */
export function connectMutation(
  el: Node,
  callback: MutationsCallback,
  options: MutationObserverInit,
): Stop {
  const realm =
    (el.nodeType === 9 ? (el as Document) : el.ownerDocument)?.defaultView ??
    globalThis;
  let active = true;
  const observer = new (realm as typeof globalThis).MutationObserver(
    (records) => {
      if (active) untrack(() => callback(records));
    },
  );
  observer.observe(el, options);
  return () => {
    active = false;
    observer.disconnect();
  };
}
export function observeMutation(
  el: Node,
  callback: MutationsCallback,
  options: ObserveMutationOptions,
): Stop {
  const life = nodeLifetime(el, options.signal);
  if (life.active) {
    try {
      life.add(connectMutation(el, callback, options));
    } catch (error) {
      failSetup(life, error);
    }
  }
  return life.stop;
}
