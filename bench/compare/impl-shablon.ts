// Shablon: deep store + hyperscript with rid-keyed children function. Watchers batch on a
// microtask and require the elements to be document-connected (its MutationObserver ownership),
// which the runner guarantees.

// @ts-expect-error shablon ships untyped JS source
import { store, t } from "shablon";
import {
  type Impl,
  type Row,
  SWAP_A,
  SWAP_B,
  UPDATE_STRIDE,
  UPDATE_SUFFIX,
} from "./data.js";

export function shablonImpl(): Impl {
  let root: HTMLElement;
  // biome-ignore lint/suspicious/noExplicitAny: untyped third-party store
  let data: any;

  return {
    name: "shablon",
    mount(el) {
      root = el;
      data = store({ rows: [] as Row[] });
      const table = t.table(
        {},
        t.tbody({}, () =>
          // biome-ignore lint/suspicious/noExplicitAny: untyped third-party store
          data.rows.map((row: any) =>
            t.tr({ rid: row }, t.td({ textContent: () => row.label })),
          ),
        ),
      );
      root.append(table);
    },
    create(next) {
      data.rows = next;
    },
    update() {
      const rows = data.rows;
      for (let i = 0; i < rows.length; i += UPDATE_STRIDE) {
        rows[i].label += UPDATE_SUFFIX;
      }
    },
    swap() {
      const rows = data.rows;
      if (rows.length <= SWAP_B) return;
      const a = rows[SWAP_A];
      rows[SWAP_A] = rows[SWAP_B];
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
