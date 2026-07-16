// mediaRead(query) — a media query as a pooled reactive boolean: one
// MediaQueryList and one change listener per distinct query,
// subscriber-counted (zero cost unobserved, resynced on reconnect).
// Resize the window, flip the OS appearance or reduce-motion setting —
// the reads move live.
import { mediaRead } from "loom/dom";

const dark = mediaRead("(prefers-color-scheme: dark)");
const reduceMotion = mediaRead("(prefers-reduced-motion: reduce)");
const wide = mediaRead("(min-width: 900px)");
const coarse = mediaRead("(pointer: coarse)");

const row = (query: string, read: () => boolean) => (
  <div class="row">
    <span class={{ ok: read, mono: true }}>
      {() => (read() ? "● matches" : "○ no match")}
    </span>
    <span class="mono">{query}</span>
  </div>
);

export default (
  <div class="col">
    {row("(prefers-color-scheme: dark)", dark)}
    {row("(prefers-reduced-motion: reduce)", reduceMotion)}
    {row("(min-width: 900px)", wide)}
    {row("(pointer: coarse)", coarse)}
    <p>
      Pooled per query string: every consumer of the same query shares one
      MediaQueryList and one listener.
    </p>
  </div>
);
