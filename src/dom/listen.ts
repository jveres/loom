// listen(owner, target, type, handler, options?) — an event listener on
// a FOREIGN target (document, window, a host element) with the OWNER
// node's lifetime: the listener is removed when `owner` is torn down the
// Loom way (dispose/remove), and the returned Stop removes it early.
// Popovers, drag sessions and keyboard chords all want a document-level
// listener that dies with the widget that armed it — hand-rolled, every
// site spells addEventListener + onUnmount(remove) and one forgets.
// Listener options pass through untouched (`capture`, `passive`, `once`
// — a `once` listener that already fired makes the Stop a no-op).
import type { Stop } from "../loom.js";
import { once } from "./once.js";
import { onUnmount } from "./ownership-base.js";

export function listen<K extends keyof WindowEventMap>(
  owner: Node,
  target: Window,
  type: K,
  handler: (event: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): Stop;
export function listen<K extends keyof DocumentEventMap>(
  owner: Node,
  target: Document,
  type: K,
  handler: (event: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): Stop;
export function listen<K extends keyof HTMLElementEventMap>(
  owner: Node,
  target: HTMLElement,
  type: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): Stop;
export function listen(
  owner: Node,
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
): Stop;
export function listen(
  owner: Node,
  target: EventTarget,
  type: string,
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions,
): Stop {
  target.addEventListener(type, handler as EventListener, options);
  const stop = once(() =>
    target.removeEventListener(type, handler as EventListener, options),
  );
  return onUnmount(owner, stop);
}
