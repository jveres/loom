// foldHeight — height 0↔auto on the element's own css transition,
// with the fold laws built in (measure-at-auto, cached open height,
// interrupt-safe, settles even when the transition cannot run).
// bindValue — focus-guarded two-way form binding: type in the input
// while the timer echoes into the cell; your edit is never
// overwritten, the suppressed value lands on blur.
import { poll, state } from "loom";
import { bindValue, foldHeight } from "loom/dom";

const open = state(true);
const body = (
  <div style="overflow: clip; transition: height 180ms ease">
    <p style="margin: 8px 0">One</p>
    <p style="margin: 8px 0">Two</p>
    <p style="margin: 8px 0">Three — content the fold measures.</p>
  </div>
) as HTMLElement;

const cell = state("edit me");
const echo = poll(() => `tick ${Math.round(Date.now() / 3000) % 100}`, 3000);
const input = (<input class="mono" />) as HTMLInputElement;
bindValue(input, cell);

export default (
  <div class="col">
    <div class="row">
      <button
        type="button"
        onclick={() => {
          open(!open());
          foldHeight(body, open());
        }}
      >
        {() => (open() ? "Collapse" : "Expand")}
      </button>
      <span class="mono">{() => `open: ${open()}`}</span>
    </div>
    {body}
    <div class="row">
      {input}
      <button type="button" onclick={() => cell(echo())}>
        overwrite from timer
      </button>
      <span class="mono">{cell}</span>
    </div>
    <p>
      Focus the input and click "overwrite" — your edit survives; blur and the
      suppressed value lands.
    </p>
  </div>
);
