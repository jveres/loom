// scrollFade() masks a scroller's edges exactly while more content lies
// beyond, on both axes. The fades subtract from an always-opaque base, so
// --scroll-fade-gutter can exempt a classic scrollbar and --scroll-fade-inset
// keeps a sticky leading region opaque.
import { scrollFade } from "loom/dom/scroll-fade";

const lines = Array.from({ length: 40 }, (_, i) => (
  <p style="margin: 4px 12px">Line {i + 1} — scroll to move the fades.</p>
));

const vertical = (
  <div
    class="scroller"
    style="height: 200px; overflow-y: auto; width: 300px; --scroll-fade-gutter: 12px"
  >
    {lines}
  </div>
);
scrollFade(vertical, { size: 28, transition: 120 });

const strip = (
  <div
    class="scroller row"
    style="width: 300px; overflow-x: auto; padding: 10px; flex-wrap: nowrap"
  >
    {Array.from({ length: 20 }, (_, i) => (
      <button type="button" style="flex: none">
        chip {i + 1}
      </button>
    ))}
  </div>
);
scrollFade(strip, { size: 24, axis: "x", transition: 120 });

export default (
  <div class="col">
    {vertical}
    {strip}
    <p class="muted">
      At either end the corresponding fade is gone — the mask tracks scroll
      position, resizes and content changes.
    </p>
  </div>
);
