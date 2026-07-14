// The dev inspector is a pure consumer of the public observe surface —
// inspect(), inspectResources(), meter over events. Toggle the overlay,
// open its Graph tab, and hover this sample's signals to see which DOM
// they drive. inspectResources() is the same census, read directly.
import { poll, state } from "loom";
import { toggleInspector } from "loom/devtools";
import { inspectResources } from "loom/observe";

const label = state("hover me in the Graph tab", { label: "play.label" });
const likes = state(0, { label: "play.likes" });

const census = poll(() => {
  const c = inspectResources();
  return `${c.states} states · ${c.computeds} computeds · ${c.effects} effects · ${c.unread} unread`;
}, 1000);

export default (
  <div class="col">
    <button type="button" onclick={() => toggleInspector()}>
      toggle inspector
    </button>
    <label class="row">
      <input
        value={label}
        oninput={(event) => label(event.currentTarget.value)}
      />
    </label>
    <p>
      {label} — <span class="mono">{likes}</span>{" "}
      <button type="button" onclick={() => likes(likes() + 1)}>
        +1
      </button>
    </p>
    <p class="muted mono">{census}</p>
  </div>
);
