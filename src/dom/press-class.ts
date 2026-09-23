import type { Stop } from "../loom.js";
import { nodeLifetime } from "./lifetime.js";
import { trackPress } from "./press-track.js";

export interface PressClassOptions {
  readonly signal?: AbortSignal;
  readonly name?: string;
  /** A gate read at contact: return false and the press is ignored
   *  (Chrome 119+ dispatches pointer events to disabled controls —
   *  `() => !el.disabled` keeps the voice honest without a signal). */
  readonly when?: () => boolean;
}

export function pressClass(el: Element, options: PressClassOptions = {}): Stop {
  const life = nodeLifetime(el, options.signal);
  if (!life.active) return life.stop;
  const name = options.name ?? "is-pressed";
  const stop = trackPress(
    el,
    (pressed) => el.classList.toggle(name, pressed),
    options.when,
  );
  life.add(() => {
    stop();
    el.classList.remove(name);
  });
  return life.stop;
}
