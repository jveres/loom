// startPointerSession is the mechanical lifetime beneath drag controls: it
// filters to the starting pointer, captures it, and ends exactly once —
// release, cancel, capture loss, or unmount. Policy (clamping, cursors,
// what to persist) stays with the caller. Show the LIVE number while
// dragging: geometry you can read beats vibes.
import { state } from "loom";
import { startPointerSession } from "loom/dom";

const x = state(40);
const dragging = state(false);

const chip = (
  <button
    type="button"
    class={["chip", { dragging }]}
    style={{ left: () => `${x()}px` }}
  >
    drag
  </button>
);

chip.addEventListener("pointerdown", (start) => {
  const from = x();
  dragging(true);
  startPointerSession(chip, start, {
    move: (event) =>
      x(Math.max(4, Math.min(280, from + event.clientX - start.clientX))),
    end: () => dragging(false),
  });
});

export default (
  <div class="col">
    <div class="track">{chip}</div>
    <p class="mono">{() => `x = ${x()}px`}</p>
  </div>
);
