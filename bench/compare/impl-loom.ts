// Loom: keyed list() into a tbody, per-row label state cell bound with text() — updates are
// fine-grained writes, reorders are keyed moves.
import { type State, state } from "loom";
import { h, list, text } from "loom/dom";
import type { Impl } from "./data.js";

interface LoomRow {
  id: number;
  label: State<string>;
}

export function loomImpl(): Impl {
  let tbody: HTMLElement;
  let stopList: (() => void) | undefined;
  let rows: LoomRow[] = [];
  const rowsCell = state<readonly LoomRow[]>([]);

  return {
    name: "loom",
    mount(root) {
      tbody = h("tbody");
      root.append(h("table", null, tbody));
      stopList = list(tbody, () => rowsCell(), {
        key: (row) => row.id,
        render: (row) =>
          h(
            "tr",
            null,
            text(() => row.label()),
          ),
      });
    },
    create(next) {
      rows = next.map((row) => ({ id: row.id, label: state(row.label) }));
      rowsCell(rows);
    },
    update() {
      for (let i = 0; i < rows.length; i += 10) {
        const row = rows[i] as LoomRow;
        row.label(`${row.label()} !!!`);
      }
    },
    swap() {
      if (rows.length < 999) return;
      const next = rows.slice();
      const a = next[1] as LoomRow;
      next[1] = next[998] as LoomRow;
      next[998] = a;
      rows = next;
      rowsCell(next);
    },
    clear() {
      rows = [];
      rowsCell([]);
    },
    destroy() {
      stopList?.();
    },
  };
}
