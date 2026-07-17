// bindValue(el, cell) — focus-guarded two-way value binding for form
// controls: writes the cell on input, follows the cell into
// el.value, and NEVER overwrites the focused element (morph's law,
// now for bindings — a reactive echo mid-typing destroys the edit
// and the caret). The latest suppressed value applies when focus
// leaves, even when the cell does not change again. Node-owned: the
// follow effect dies with the element.
import { effect, type State } from "../loom.js";
import { onUnmount } from "./ownership-base.js";

export function bindValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  cell: State<string>,
): void {
  let latest = el.value;
  const sync = (): void => {
    if (el.value !== latest) el.value = latest;
  };
  el.addEventListener("blur", sync);
  el.addEventListener("input", () => {
    latest = el.value;
    cell(el.value);
  });
  // bind()'s own recipe, spelled here to keep the barrel acyclic.
  onUnmount(
    el,
    effect(
      () => {
        latest = cell();
        if (document.activeElement !== el) sync();
      },
      { target: el },
    ),
  );
}
