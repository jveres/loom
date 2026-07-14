// morph() patches a live STATIC tree to match a freshly built one — the
// tool for string-rendered HTML that re-renders wholesale but must keep
// node state alive. Type into the input, then re-render: value, caret and
// focus survive while the heading and timestamp update around it.
// (Static trees only — a subtree with loom bindings is updated reactively.)
import { morph } from "loom/dom";

let stamp = 0;

const render = (): HTMLElement => {
  stamp += 1;
  const next = document.createElement("section");
  next.innerHTML = [
    `<h3>Render #${stamp}</h3>`,
    `<p>Rendered at ${new Date().toLocaleTimeString()}</p>`,
    `<label>Survives the re-render: <input placeholder="type, then re-render"></label>`,
  ].join("\n");
  return next;
};

const live = render();

export default (
  <div class="col">
    <button type="button" onclick={() => morph(live, render())}>
      re-render wholesale
    </button>
    {live}
  </div>
);
