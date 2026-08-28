// deadline(owner, target, type, ms, run, options?) — run ONCE on the
// first of an event or a timeout, with the OWNER node's lifetime.
// The race every "wait for X, but X might never come" site spells by
// hand: reveal chrome when the pending click lands (or after a beat,
// if the press was aborted mid-air), treat a missing transitionend
// as ended, give a handshake a bounded wait. On the event `run`
// receives it; on the deadline `run(undefined)`. Whichever side
// fires tears BOTH down first — the listener leaves, the timer
// clears — so `run` can arm a fresh deadline on the same target.
// The returned Stop cancels the race without running; owner
// teardown does the same (the listen law).
import type { Stop } from "../loom.js";
import { listen } from "./listen.js";
import { once } from "./once.js";
import { onUnmount } from "./ownership-base.js";

export function deadline<K extends keyof WindowEventMap>(
  owner: Node,
  target: Window,
  type: K,
  ms: number,
  run: (event?: WindowEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): Stop;
export function deadline<K extends keyof DocumentEventMap>(
  owner: Node,
  target: Document,
  type: K,
  ms: number,
  run: (event?: DocumentEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): Stop;
export function deadline<K extends keyof HTMLElementEventMap>(
  owner: Node,
  target: HTMLElement,
  type: K,
  ms: number,
  run: (event?: HTMLElementEventMap[K]) => void,
  options?: boolean | AddEventListenerOptions,
): Stop;
export function deadline(
  owner: Node,
  target: EventTarget,
  type: string,
  ms: number,
  run: (event?: Event) => void,
  options?: boolean | AddEventListenerOptions,
): Stop;
export function deadline(
  owner: Node,
  target: EventTarget,
  type: string,
  ms: number,
  run: (event?: Event) => void,
  options?: boolean | AddEventListenerOptions,
): Stop {
  const stop = once(() => {
    clearTimeout(timer);
    stopListen();
  });
  // Teardown BEFORE run: the event listener is gone and the timer
  // cleared by the time `run` executes, so the loser can never fire
  // and `run` may re-arm freely.
  const fire = (event?: Event): void => {
    stop();
    run(event);
  };
  const stopListen = listen(owner, target, type, fire, options);
  const timer = setTimeout(fire, ms);
  return onUnmount(owner, stop);
}
