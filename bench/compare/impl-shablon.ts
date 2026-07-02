// Shablon: deep store + hyperscript with rid-keyed children function. Watchers batch on a
// microtask and require the elements to be document-connected (its MutationObserver ownership),
// which the runner guarantees.

// @ts-expect-error shablon ships untyped JS source
import { store, t } from "shablon";
import type { Impl, Row } from "./data.js";

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
      for (let i = 0; i < rows.length; i += 10) {
        rows[i].label += " !!!";
      }
    },
    swap() {
      const rows = data.rows;
      if (rows.length < 999) return;
      const a = rows[1];
      rows[1] = rows[998];
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
