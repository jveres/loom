// bindValue(el, cell) — focus-guarded two-way value binding for form
// controls: writes the cell on input, follows the cell into
// el.value, and NEVER overwrites the focused element (morph's law,
// now for bindings — a reactive echo mid-typing destroys the edit
// and the caret). The latest suppressed value applies when focus
// leaves, even when the cell does not change again. Node-owned: the
// effect and listeners die with the element.
import { domEffect, type State } from "../loom.js";
import { own, ownResource } from "./ownership-base.js";

export interface BindValueOptions {
  /** The bound property: "value" (default) or "checked" — the
   *  checkbox/radio twin, a State<boolean> over `change`. */
  readonly property?: "value" | "checked";
}

export function bindValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  cell: State<string>,
  options?: { readonly property?: "value" },
): void;
export function bindValue(
  el: HTMLInputElement,
  cell: State<boolean>,
  options: { readonly property: "checked" },
): void;
export function bindValue(
  el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  cell: State<string> | State<boolean>,
  options: BindValueOptions = {},
): void {
  if (options.property === "checked") {
    bindChecked(el as HTMLInputElement, cell as State<boolean>);
    return;
  }
  const textCell = cell as State<string>;
  let latest = el.value;
  const sync = (): void => {
    if (el.value !== latest) el.value = latest;
  };
  const write = (): void => {
    latest = el.value;
    textCell(el.value);
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
        latest = textCell();
        if (document.activeElement !== el) sync();
      },
      "dom.bindValue",
      el,
    ),
  );
}

// The checked half: `change` is the checkbox's commit event (input
// fires too, but change is the one that never double-fires across
// engines); the focus guard keeps a keyboard toggle-in-progress honest.
function bindChecked(el: HTMLInputElement, cell: State<boolean>): void {
  let latest = el.checked;
  const sync = (): void => {
    if (el.checked !== latest) el.checked = latest;
  };
  const write = (): void => {
    latest = el.checked;
    cell(el.checked);
  };
  el.addEventListener("blur", sync);
  el.addEventListener("change", write);
  own(el, () => {
    el.removeEventListener("blur", sync);
    el.removeEventListener("change", write);
  });
  ownResource(
    el,
    domEffect(
      () => {
        latest = cell();
        if (document.activeElement !== el) sync();
      },
      "dom.bindValue.checked",
      el,
    ),
  );
}
