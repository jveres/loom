// The same DOM layer without JSX: h() builds elements, text() binds a text
// node, list() reconciles a keyed container you already hold, and the
// element-read forms — attr(el, name), classed(el, name), style(el, prop) —
// turn EXISTING element state into signals backed by one shared
// MutationObserver. observeMutation is the raw per-node contract.
import { state, update } from "loom";
import { attr, h, list, observeMutation, onMount, text } from "loom/dom";

interface Row {
  readonly id: number;
  readonly label: string;
}

let nextId = 1;
const rows = state<readonly Row[]>([]);
const mutations = state(0);

const container = h("ul", { class: "col" });
list<Row>(container, rows, {
  key: (row) => row.id,
  render: (row) => h("li", { class: "mono" }, row.label),
});
observeMutation(
  container,
  (records) => {
    update(mutations, (n) => n + records.length);
  },
  { childList: true },
);

const mode = attr(container, "data-mode"); // Read<string | null>

const view = h("div", { class: "col" }, [
  h("div", { class: "row" }, [
    h(
      "button",
      {
        type: "button",
        onclick: () =>
          rows([{ id: nextId, label: `row ${nextId++}` }, ...rows()]),
      },
      "add row",
    ),
    h(
      "button",
      {
        type: "button",
        onclick: () =>
          container.setAttribute(
            "data-mode",
            mode() === "loud" ? "quiet" : "loud",
          ),
      },
      "toggle data-mode",
    ),
  ]),
  container,
  h("p", { class: "mono" }, [
    text(() => `attr read: data-mode=${mode() ?? "(unset)"} · `),
    text(() => `${mutations()} childList mutation records`),
  ]),
]);

onMount(view, () => {
  // Runs once, inserted and measurable but not yet painted.
  rows([{ id: nextId, label: `row ${nextId++} (from onMount)` }]);
});

export default view;
