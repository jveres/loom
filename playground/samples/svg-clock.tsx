// SVG flows through the same JSX runtime (SVG-only tag names get the SVG
// namespace automatically). poll() samples a value on an interval — the
// pull bridge for data that always exists and merely changes — and the
// playground's run scope owns the poll, so its timer dies on re-run.
import { computed, poll, type Read } from "loom";

const now = poll(() => Date.now(), 250);
const time = computed(() => {
  const d = new Date(now());
  return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
});

const hand = (angle: Read<number>, length: number, width: number) => (
  <line
    x1="50"
    y1="50"
    x2="50"
    y2={50 - length}
    stroke="currentColor"
    stroke-width={width}
    stroke-linecap="round"
    transform={() => `rotate(${angle()} 50 50)`}
  />
);

export default (
  <div class="col">
    <svg
      viewBox="0 0 100 100"
      width="200"
      height="200"
      role="img"
      aria-label="Analog clock"
    >
      <circle
        cx="50"
        cy="50"
        r="47"
        fill="none"
        stroke="currentColor"
        stroke-opacity="0.25"
      />
      {hand(() => (time().h % 12) * 30 + time().m / 2, 24, 3)}
      {hand(() => time().m * 6 + time().s / 10, 34, 2)}
      {hand(() => time().s * 6, 40, 1)}
      <circle cx="50" cy="50" r="2.5" fill="currentColor" />
    </svg>
    <p class="mono">{() => new Date(now()).toLocaleTimeString()}</p>
  </div>
);
