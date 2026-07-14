// class accepts strings, arrays and maps whose values may be reactive reads;
// style accepts strings, maps (camelCase or kebab-case) and explicit style()
// bindings — a binding that returns null REMOVES the property.
import { state } from "loom";
import { style } from "loom/dom";

const hue = state(210);
const big = state(false);
const outlined = state(true);

export default (
  <div class="col">
    <div class="row">
      <label class="row">
        hue
        <input
          type="range"
          min="0"
          max="360"
          value={hue}
          oninput={(event) => hue(event.currentTarget.valueAsNumber)}
        />
      </label>
      <button type="button" onclick={() => big(!big())}>
        toggle size
      </button>
      <button type="button" onclick={() => outlined(!outlined())}>
        toggle outline
      </button>
    </div>
    <div
      class={["swatch", { big, outlined }]}
      style={{ backgroundColor: () => `oklch(65% 0.13 ${hue()})` }}
    >
      <span class="mono">{() => `hue ${hue()}`}</span>
    </div>
    <div
      class="swatch-frame"
      style={[
        "padding: 8px",
        style("border-color", () =>
          outlined() ? `oklch(60% 0.15 ${hue()})` : null,
        ),
      ]}
    >
      This frame's border-color binding returns null when the outline is off.
    </div>
  </div>
);
