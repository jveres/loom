// Loom: keyed list() into a tbody, per-row label state cell bound with text() — updates are
// fine-grained writes, reorders are keyed moves.
import { type State, state } from "loom";
import { h, list, text } from "loom/dom";
import {
  type Impl,
  SWAP_A,
  SWAP_B,
  UPDATE_STRIDE,
  UPDATE_SUFFIX,
} from "./data.js";

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
      for (let i = 0; i < rows.length; i += UPDATE_STRIDE) {
        const row = rows[i] as LoomRow;
        row.label(`${row.label()}${UPDATE_SUFFIX}`);
      }
    },
    swap() {
      if (rows.length <= SWAP_B) return;
      const next = rows.slice();
      const a = next[SWAP_A] as LoomRow;
      next[SWAP_A] = next[SWAP_B] as LoomRow;
      next[SWAP_B] = a;
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
