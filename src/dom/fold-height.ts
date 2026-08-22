// foldHeight(el, open, options?) — animate an element's height
// between 0 and auto on its own css transition, with the hard-won
// fold laws built in (extracted from a production prop-grid fold):
// - measure at AUTO: a previous collapse leaves an inline 0px, and
//   measuring through it makes the target 0 (the second expand
//   snaps);
// - the OPEN height caches at collapse time, so an expand does zero
//   layout reads — but an INTERRUPTED animation's offsetHeight is a
//   partial, never a real open height: interrupts drop the cache and
//   the next expand re-measures;
// - [hidden] lands only after the collapse settles (and lifts before
//   the expand starts);
// - settling rides settleTransition — a transition that cannot run
//   (reduced motion), stalls, or is interrupted still settles, and
//   the settle returns an open fold to height:auto so content growth
//   is never clipped.
// The element's css owns duration/easing (transition: height ...)
// and the clip discipline (overflow: clip; rows keep natural height).
// Styling stays the caller's; onStart/onSettle bracket the animation
// for hosts that mute observers while it runs.
import { settleTransition } from "./settle-transition.js";

export interface FoldHeightOptions {
  /** Runs before the first height write of this toggle. */
  onStart?(open: boolean): void;
  /** Runs once the fold settles (also on interrupt/no-transition). */
  onSettle?(open: boolean): void;
}

interface FoldState {
  settling: boolean;
  stop: (() => void) | null;
}

const folds = new WeakMap<HTMLElement, FoldState>();

export function foldHeight(
  el: HTMLElement,
  open: boolean,
  options: FoldHeightOptions = {},
): void {
  let fold = folds.get(el);
  if (!fold) {
    fold = { settling: false, stop: null };
    folds.set(el, fold);
  }
  const interrupted = fold.settling;
  fold.stop?.();
  fold.settling = true;
  options.onStart?.(open);

  if (open) {
    el.hidden = false;
    // ALWAYS measure the open height at auto: the content may have
    // changed while folded (a panel collapsed over one pane and
    // re-opened over another animated to a STALE cached height,
    // then snapped to auto on settle — the cache is gone). An
    // interrupted fold resumes from where it stands; a fresh open
    // starts at 0.
    const from = interrupted ? el.offsetHeight : 0;
    el.style.height = "";
    const to = el.offsetHeight;
    el.style.height = `${from}px`;
    void el.offsetHeight;
    el.style.height = `${to}px`;
  } else {
    const from = el.offsetHeight;
    el.style.height = `${from}px`;
    void el.offsetHeight;
    el.style.height = "0px";
  }

  fold.stop = settleTransition(el, "height", () => {
    fold.settling = false;
    fold.stop = null;
    if (open) el.style.height = "";
    else el.hidden = true;
    options.onSettle?.(open);
  });
}
