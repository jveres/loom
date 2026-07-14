// JSX runs ONCE — branching lives in when()/match() slots that rebuild only
// when their key changes. Show/hide without teardown is a style binding.
import { state } from "loom";
import { match, when } from "loom/dom";

type Tab = "home" | "stats" | "about";
const tabs: readonly Tab[] = ["home", "stats", "about"];
const tab = state<Tab>("home");
const online = state(true);

export default (
  <div class="col">
    <div class="row">
      {tabs.map((name) => (
        <button
          type="button"
          class={{ active: () => tab() === name }}
          onclick={() => tab(name)}
        >
          {name}
        </button>
      ))}
      <label class="row">
        <input
          type="checkbox"
          checked
          onchange={(event) => online(event.currentTarget.checked)}
        />
        online
      </label>
    </div>
    {match(tab, {
      home: () => (
        <p>
          Home — built at {new Date().toLocaleTimeString()}. Switch away and
          back: the timestamp changes, because the subtree rebuilt.
        </p>
      ),
      stats: () => <p>Stats panel.</p>,
      about: () => <p>About panel.</p>,
    })}
    {when(
      online,
      () => (
        <p class="ok">Connected.</p>
      ),
      () => (
        <p class="warn">Offline — when() swapped the subtree.</p>
      ),
    )}
  </div>
);
