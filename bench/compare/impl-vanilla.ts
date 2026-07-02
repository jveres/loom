// Hand-written direct-DOM baseline: the floor every framework is measured against.
import type { Impl, Row } from "./data.js";

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
      for (let i = 0; i < rows.length; i += 10) {
        const row = rows[i] as Row;
        row.label += " !!!";
        const cell = trs[i]?.firstChild as HTMLTableCellElement | undefined;
        if (cell) cell.textContent = row.label;
      }
    },
    swap() {
      if (rows.length < 999) return;
      const a = rows[1] as Row;
      const b = rows[998] as Row;
      rows[1] = b;
      rows[998] = a;
      const trA = trs[1] as HTMLTableRowElement;
      const trB = trs[998] as HTMLTableRowElement;
      const afterB = trB.nextSibling;
      tbody.insertBefore(trB, trA);
      tbody.insertBefore(trA, afterB);
      trs[1] = trB;
      trs[998] = trA;
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
