// Browser observation with loom lifetime — callbacks detach on node
// teardown, shared observers exist only while something subscribes.
// observeSize reports the box you ask for; connected() is a Read<boolean>;
// observeIntersection watches a sentinel leave a scrolling root.
import { state } from "loom";
import { connected, observeIntersection, observeSize, remove } from "loom/dom";

const size = state("measuring…");
const box = (
  <textarea class="mono" style="resize: both; width: 180px; height: 70px">
    resize me
  </textarea>
);
observeSize(
  box,
  (entry) => {
    const s = entry.borderBoxSize[0];
    if (s) size(`${Math.round(s.inlineSize)} × ${Math.round(s.blockSize)}`);
  },
  { box: "border-box" },
);

const visible = state(true);
const sentinel = (
  <p class="ok" style="margin: 120px 12px">
    the sentinel
  </p>
);
const root = (
  <div class="scroller" style="height: 120px; overflow-y: auto; width: 260px">
    <p style="margin: 12px">scroll the sentinel out of view…</p>
    {sentinel}
    <p style="margin: 120px 12px 12px">…and back.</p>
  </div>
);
observeIntersection(sentinel, (entry) => visible(entry.isIntersecting), {
  root,
});

const guest = <span class="mono"> guest node</span>;
const inDocument = connected(guest);

export default (
  <div class="col">
    <div class="row">
      {box}
      <span class="mono">{size}</span>
    </div>
    <div class="row">
      {root}
      <span class={{ mono: true, warn: () => !visible() }}>
        {() => (visible() ? "sentinel visible" : "sentinel gone")}
      </span>
    </div>
    <div class="row">
      <button
        type="button"
        onclick={(event) =>
          guest.isConnected ? remove(guest) : event.currentTarget.after(guest)
        }
      >
        attach / detach
      </button>
      <span class="mono">{() => `connected(guest) → ${inDocument()}`}</span>
    </div>
  </div>
);
