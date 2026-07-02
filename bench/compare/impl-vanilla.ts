// Hand-written direct-DOM baseline: the floor every framework is measured against.
import {
  type Impl,
  type Row,
  SWAP_A,
  SWAP_B,
  UPDATE_STRIDE,
  UPDATE_SUFFIX,
} from "./data.js";

export function vanillaImpl(): Impl {
  let tbody: HTMLTableSectionElement;
  let rows: Row[] = [];
  let trs: HTMLTableRowElement[] = [];

  const render = (): void => {
    const frag = document.createDocumentFragment();
    trs = [];
    for (const row of rows) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.textContent = row.label;
      tr.append(td);
      frag.append(tr);
      trs.push(tr);
    }
    tbody.replaceChildren(frag);
  };

  return {
    name: "vanilla",
    mount(root) {
      const table = document.createElement("table");
      tbody = document.createElement("tbody");
      table.append(tbody);
      root.append(table);
    },
    create(next) {
      rows = next;
      render();
    },
    update() {
      for (let i = 0; i < rows.length; i += UPDATE_STRIDE) {
        const row = rows[i] as Row;
        row.label += UPDATE_SUFFIX;
        const cell = trs[i]?.firstChild as HTMLTableCellElement | undefined;
        if (cell) cell.textContent = row.label;
      }
    },
    swap() {
      if (rows.length <= SWAP_B) return;
      const a = rows[SWAP_A] as Row;
      const b = rows[SWAP_B] as Row;
      rows[SWAP_A] = b;
      rows[SWAP_B] = a;
      const trA = trs[SWAP_A] as HTMLTableRowElement;
      const trB = trs[SWAP_B] as HTMLTableRowElement;
      const afterB = trB.nextSibling;
      tbody.insertBefore(trB, trA);
      tbody.insertBefore(trA, afterB);
      trs[SWAP_A] = trB;
      trs[SWAP_B] = trA;
    },
    clear() {
      rows = [];
      trs = [];
      tbody.replaceChildren();
    },
    destroy() {
      tbody.replaceChildren();
    },
  };
}
