// ArrowJS (@arrow-js/core v1): reactive store + keyed tagged templates. Updates flow through the
// deep proxy; list identity via .key(id). Arrow batches on a microtask — the runner's double-rAF
// settle absorbs that fairly.
import { html, reactive } from "@arrow-js/core";
import {
  type Impl,
  type Row,
  SWAP_A,
  SWAP_B,
  UPDATE_STRIDE,
  UPDATE_SUFFIX,
} from "./data.js";

interface ArrowData {
  rows: Row[];
}

export function arrowImpl(): Impl {
  let root: HTMLElement;
  let data: ArrowData;

  return {
    name: "arrow",
    mount(el) {
      root = el;
      data = reactive({ rows: [] as Row[] }) as ArrowData;
      const tpl = html`<table><tbody>${() =>
        data.rows.map((row) =>
          html`<tr><td>${() => row.label}</td></tr>`.key(row.id),
        )}</tbody></table>`;
      tpl(root);
    },
    create(next) {
      data.rows = next;
    },
    update() {
      const rows = data.rows;
      for (let i = 0; i < rows.length; i += UPDATE_STRIDE) {
        const row = rows[i] as Row;
        row.label += UPDATE_SUFFIX;
      }
    },
    swap() {
      const rows = data.rows;
      if (rows.length <= SWAP_B) return;
      const a = rows[SWAP_A] as Row;
      rows[SWAP_A] = rows[SWAP_B] as Row;
      rows[SWAP_B] = a;
    },
    clear() {
      data.rows = [];
    },
    destroy() {
      root.replaceChildren();
    },
  };
}
