// A whole live chart is one signal of samples and one reactive `d`
// attribute. The raw setInterval is the one thing loom cannot own — it is
// released through onUnmount, which fires when the run is disposed.
import { state, update } from "loom";
import { onUnmount } from "loom/dom";

const points = state<readonly number[]>([50]);

const path = () => {
  const pts = points();
  const step = 240 / Math.max(pts.length - 1, 1);
  return pts
    .map(
      (y, i) =>
        `${i === 0 ? "M" : "L"}${(i * step).toFixed(1)},${(82 - y * 0.75).toFixed(1)}`,
    )
    .join(" ");
};

let value = 50;
const id = setInterval(() => {
  value = Math.min(95, Math.max(5, value + (Math.random() - 0.5) * 22));
  update(points, (pts) => [...pts.slice(-59), value]);
}, 120);

const view = (
  <div class="col">
    <svg
      viewBox="0 0 240 86"
      width="360"
      role="img"
      aria-label="Live sparkline"
      class="scroller"
    >
      <path
        d={() => `${path()} L240,86 L0,86 Z`}
        fill="currentColor"
        fill-opacity="0.08"
        stroke="none"
      />
      <path d={path} fill="none" stroke="currentColor" stroke-width="1.5" />
    </svg>
    <p class="mono">{() => `latest ${(points().at(-1) ?? 0).toFixed(1)}`}</p>
  </div>
);

onUnmount(view, () => clearInterval(id));

export default view;
