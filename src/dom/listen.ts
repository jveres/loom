import { failSetup } from "../core/lifetime.js";
import { untrack } from "../core/tracking.js";
import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";

export interface ListenOptions extends AddEventListenerOptions {
  readonly owner: Node;
}
/** Subscribe to a target with an explicit owner; callbacks run untracked. */
export function listen<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options: ListenOptions,
): Stop;
export function listen<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  handler: (event: DocumentEventMap[K]) => void,
  options: ListenOptions,
): Stop;
export function listen<K extends keyof HTMLElementEventMap>(
  target: HTMLElement,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options: ListenOptions,
): Stop;
export function listen(
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
  options: ListenOptions,
): Stop;
export function listen(
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
  options: ListenOptions,
): Stop {
  const life = nodeLifetime(options.owner, options.signal);
  if (!life.active) return life.stop;
  const deliver = (event: Event): void => {
    if (!life.active) return;
    if (options.once) life.stop();
    untrack(() => handler(event));
  };
  try {
    target.addEventListener(type, deliver, {
      capture: options.capture ?? false,
      passive: options.passive ?? false,
    });
    life.add(() =>
      target.removeEventListener(type, deliver, options.capture ?? false),
    );
  } catch (error) {
    failSetup(life, error);
  }
  return life.stop;
}
