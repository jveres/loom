// ArrowJS (@arrow-js/core v1): reactive store + keyed tagged templates. Updates flow through the
// deep proxy; list identity via .key(id). Arrow batches on a microtask — the runner's double-rAF
// settle absorbs that fairly.
import { html, reactive } from "@arrow-js/core";
import type { Impl, Row } from "./data.js";

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
      for (let i = 0; i < rows.length; i += 10) {
        const row = rows[i] as Row;
        row.label += " !!!";
      }
    },
    swap() {
      const rows = data.rows;
      if (rows.length < 999) return;
      const a = rows[1] as Row;
      rows[1] = rows[998] as Row;
      rows[998] = a;
    },
    clear() {
      data.rows = [];
    },
    destroy() {
      root.replaceChildren();
    },
  };
}
