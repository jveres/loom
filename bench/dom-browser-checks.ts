import { state } from "loom";
import { observeSize } from "loom/browser";
import { each, h, list, remove } from "loom/dom";
import { startPointerSession } from "loom/events";
import { afterAnimation, afterTransition } from "loom/motion";
import { afterFrames } from "loom/schedule";
import { virtualList } from "loom/virtual-list";
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
      input.setSelectionRange(0, 1);
      rows([3, 1, 2, 4]);
      check(
        document.activeElement === input && host.children[1] === input,
        `${kind}: insertion preserves focus and identity`,
      );
      const atomicMoves =
        typeof (host as HTMLElement & { moveBefore?: unknown }).moveBefore ===
        "function";
      rows([2, 1]);
      check(
        host.children[1] === input &&
          (!atomicMoves || document.activeElement === input),
        `${kind}: ${atomicMoves ? "reorder preserves focus and identity" : "insertBefore fallback preserves identity"}`,
      );
      check(
        atomicMoves
          ? input.selectionStart === 0 && input.selectionEnd === 1
          : input.value === "1",
        `${kind}: ${atomicMoves ? "reorder preserves selection" : "insertBefore fallback preserves value"}`,
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
    view.stop();
    remove(host);
  }
  const iframe = document.createElement("iframe");
  document.body.append(iframe);
  try {
    const view = iframe.contentWindow;
    const doc = iframe.contentDocument;
    if (!view || !doc) throw new Error("Missing iframe context");
    const node = doc.createElement("div");
    node.style.cssText = "width:20px;height:20px";
    doc.body.append(node);
    let frames = 0;
    await new Promise<void>((resolve) =>
      afterFrames(
        2,
        () => {
          frames++;
          resolve();
        },
        { window: view },
      ),
    );
    check(frames === 1, "iframe: frame completion delivers once");
    const abort = new AbortController();
    afterFrames(
      1,
      () => {
        frames++;
      },
      { window: view, signal: abort.signal },
    );
    abort.abort();
    await new Promise<void>((resolve) =>
      afterFrames(2, resolve, { window: view }),
    );
    check(frames === 1, "iframe: aborted frame does not deliver");
    let sizes = 0;
    const stopSize = observeSize(node, () => {
      sizes++;
    });
    await new Promise<void>((resolve) =>
      afterFrames(3, resolve, { window: view }),
    );
    check(sizes > 0, "iframe: native size observer delivers");
    remove(node);
    const before = sizes;
    doc.body.append(node);
    node.style.width = "50px";
    await new Promise<void>((resolve) =>
      afterFrames(3, resolve, { window: view }),
    );
    check(
      sizes === before,
      "iframe: disposed observer stays stopped after reattachment",
    );
    stopSize();
    const ends: string[] = [];
    const pointer = new PointerEvent("pointerdown", {
      pointerId: 918,
      isPrimary: true,
    });
    const stopPointer = startPointerSession(node, pointer, {
      move: () => {},
      end: (reason) => ends.push(reason),
    });
    doc.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 918 }));
    stopPointer();
    check(
      ends.length === 1 && ends[0] === "pointercancel",
      "iframe: pointer fallback cancels exactly once",
    );
    const style = doc.createElement("style");
    style.textContent =
      "@keyframes loomCheck { from { opacity: 0; } to { opacity: 1; } }";
    doc.head.append(style);
    node.style.animation = "loomCheck 40ms linear 3";
    const started = performance.now();
    await new Promise<void>((resolve) =>
      afterAnimation(node, resolve, { name: "loomCheck" }),
    );
    check(
      performance.now() - started >= 90,
      "iframe: animation completion includes finite repetitions",
    );
    let completed = false;
    node.style.transition = "opacity 30ms linear";
    const stopTransition = afterTransition(
      node,
      () => {
        completed = true;
      },
      { property: "opacity" },
    );
    stopTransition();
    await new Promise((resolve) => setTimeout(resolve, 100));
    check(!completed, "iframe: stopped transition has no completion callback");
    remove(node);
  } finally {
    iframe.remove();
  }
  return checks;
}
