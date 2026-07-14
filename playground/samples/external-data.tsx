// The two synchronous bridges for outside data. poll() PULLS a readable
// value on an interval; source() wraps a producer that PUSHES — it connects
// on the first subscriber and disconnects on the last, so untick the box and
// the pointermove listener is literally removed.
import { poll, source, state } from "loom";
import { when } from "loom/dom";

const clock = poll(() => new Date().toLocaleTimeString(), 1000);

const log = state("(no connection yet)");
const pointer = source<{ x: number; y: number }>(
  (set) => {
    log("connect — pointermove listener added");
    const move = (event: PointerEvent) =>
      set({ x: Math.round(event.clientX), y: Math.round(event.clientY) });
    window.addEventListener("pointermove", move);
    return () => {
      window.removeEventListener("pointermove", move);
      log("disconnect — listener removed");
    };
  },
  { x: 0, y: 0 },
);

const reading = state(true);

export default (
  <div class="col">
    <p class="mono">poll: {clock}</p>
    <label class="row">
      <input
        type="checkbox"
        checked
        onchange={(event) => reading(event.currentTarget.checked)}
      />
      subscribe to the pointer source
    </label>
    {when(
      reading,
      () => (
        <p class="mono">{() => `pointer: ${pointer().x} × ${pointer().y}`}</p>
      ),
      () => (
        <p class="muted">nothing reads the source — producer off</p>
      ),
    )}
    <p class="muted mono">{log}</p>
  </div>
);
