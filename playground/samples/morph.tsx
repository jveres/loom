// morph() patches a live STATIC tree to match a freshly built one — the
// tool for string-rendered HTML that re-renders wholesale but must keep
// node state alive. Form state follows the new tree EXCEPT on the focused
// element, which is never overwritten: keep typing while the renders tick
// past and your value and caret survive. Click elsewhere first and the
// fresh render's empty input wins — static HTML is the source of truth;
// morph only protects what the user is mid-editing.
// (Static trees only — a subtree with loom bindings updates reactively.)
import { morph, onUnmount } from "loom/dom";

let stamp = 0;

const render = (): HTMLElement => {
  stamp += 1;
  const next = document.createElement("section");
  next.innerHTML = [
    `<h3>Render #${stamp}</h3>`,
    `<p>Rendered at ${new Date().toLocaleTimeString()}</p>`,
    `<label>Type here while renders tick: <input placeholder="stay focused…"></label>`,
  ].join("\n");
  return next;
};

const live = render();
const id = setInterval(() => morph(live, render()), 2000);

const view = (
  <div class="col">
    {live}
    <p class="muted">
      A render every 2 s. While the input is focused, morph skips it; blur it
      and the next render resets the value — by design.
    </p>
  </div>
);

onUnmount(view, () => clearInterval(id));

export default view;
