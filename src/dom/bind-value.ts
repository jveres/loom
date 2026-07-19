// bindValue(el, cell) — focus-guarded two-way value binding for form
// controls: writes the cell on input, follows the cell into
// el.value, and NEVER overwrites the focused element (morph's law,
// now for bindings — a reactive echo mid-typing destroys the edit
// and the caret). The latest suppressed value applies when focus
// leaves, even when the cell does not change again. Node-owned: the
// effect and listeners die with the element.
import { domEffect, type State } from "../loom.js";
import { own, ownResource } from "./ownership-base.js";

export function bindValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  cell: State<string>,
): void {
  let latest = el.value;
  const sync = (): void => {
    if (el.value !== latest) el.value = latest;
  };
  const write = (): void => {
    latest = el.value;
    cell(el.value);
  };
  el.addEventListener("blur", sync);
  el.addEventListener("input", write);
  own(el, () => {
    el.removeEventListener("blur", sync);
    el.removeEventListener("input", write);
  });
  // bind()'s own recipe, spelled here to keep the barrel acyclic.
  ownResource(
    el,
    domEffect(
      () => {
        latest = cell();
        if (document.activeElement !== el) sync();
      },
      "dom.bindValue",
      el,
    ),
  );
}
