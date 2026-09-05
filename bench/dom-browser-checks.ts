import { each, h, list, remove } from "../src/dom/index.js";
import { virtualList } from "../src/dom/virtual-list.js";
import { state } from "../src/loom.js";

export async function runBrowserChecks() {
  const checks: string[] = [];
  const check = (ok: boolean, name: string) => {
    if (!ok) throw new Error(name);
    checks.push(name);
  };
  for (const kind of ["list", "each"]) {
    const rows = state<readonly number[]>([1, 2]);
    const render = (id: number) => h("input", { value: String(id) });
    const host =
      kind === "list"
        ? h("div")
        : h(
            "div",
            null,
            each(rows, render, (id) => id),
          );
    if (kind === "list") list(host, rows, { key: (id) => id, render });
    document.body.append(host);
    try {
      const input = host.firstElementChild as HTMLInputElement;
      input.focus();
      rows([3, 1, 2, 4]);
      check(
        document.activeElement === input && host.children[1] === input,
        `${kind}: insertion preserves focus and identity`,
      );
      rows([2, 1]);
      check(
        document.activeElement === input && host.children[1] === input,
        `${kind}: reorder preserves focus and identity`,
      );
    } finally {
      remove(host);
    }
  }
  const host = h("div", { style: "height:400px;overflow:auto" });
  let reads = 0;
  let generation = 0;
  const view = virtualList<number>({
    rowHeight: 20,
    key: (id) => id,
    render: (id, reuse) => {
      const row = reuse ?? h("div", { style: "position:absolute;height:20px" });
      row.textContent = String(id);
      return row;
    },
  });
  host.append(view.el);
  document.body.append(host);
  const settle = async () => {
    await new Promise(requestAnimationFrame);
    await new Promise(requestAnimationFrame);
  };
  try {
    view.setItems({
      length: 10000,
      at: (i) => {
        reads++;
        return generation + i;
      },
    });
    host.scrollTop = 4001;
    await settle();
    reads = 0;
    host.scrollTop = 4002;
    await settle();
    check(reads === 0, "virtual: real scroll within window skips source reads");
    host.scrollTop = 4021;
    await settle();
    check(reads > 0, "virtual: real scroll across boundary reads new window");
    reads = 0;
    generation = 10000;
    view.refresh();
    check(
      reads > 0 && Number(view.el.children[1]?.textContent) >= generation,
      "virtual: explicit refresh detects changed lazy source",
    );
  } finally {
    view.destroy();
    remove(host);
  }
  return checks;
}
