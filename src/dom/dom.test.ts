// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { state } from "../loom.js";
import {
  attr,
  classed,
  dispose,
  h,
  list,
  match,
  remove,
  style,
  tap,
  text,
  when,
} from "./index.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const HTML_NS = "http://www.w3.org/1999/xhtml";

interface Row {
  readonly id: string;
}

function keys(root: Element): string[] {
  return [...root.children].map(
    (node) => node.getAttribute("data-loom-key") ?? "",
  );
}

function renderRow(row: Row): Element {
  const node = document.createElement("div");
  node.textContent = row.id;
  return node;
}

describe("loom DOM list", () => {
  it("reorders keyed nodes by default", () => {
    const root = document.createElement("section");
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stop = list(root, rows, {
      key: (row) => row.id,
      render: renderRow,
    });

    rows([{ id: "b" }, { id: "a" }]);

    expect(keys(root)).toEqual(["b", "a"]);
    stop();
  });

  it("can skip keyed node reordering for externally positioned layouts", () => {
    const root = document.createElement("section");
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stop = list(root, rows, {
      key: (row) => row.id,
      render: renderRow,
      reorder: () => false,
    });

    const firstA = root.children[0];
    const firstB = root.children[1];
    rows([{ id: "b" }, { id: "a" }]);

    expect(keys(root)).toEqual(["a", "b"]);
    expect(root.children[0]).toBe(firstA);
    expect(root.children[1]).toBe(firstB);

    rows([{ id: "b" }, { id: "a" }, { id: "c" }]);
    expect(keys(root)).toEqual(["a", "b", "c"]);

    rows([{ id: "b" }, { id: "c" }]);
    expect(keys(root)).toEqual(["b", "c"]);
    stop();
  });
});

describe("loom DOM SVG", () => {
  it("creates SVG elements in the SVG namespace", () => {
    const svg = h("svg", { viewBox: "0 0 10 10" }, [
      h("defs", null, h("linearGradient", { id: "g" })),
      h("circle", { cx: 5, cy: 5, r: 4 }),
    ]);

    expect(svg.namespaceURI).toBe(SVG_NS);
    expect(svg.getAttribute("viewBox")).toBe("0 0 10 10");
    const circle = svg.querySelector("circle");
    expect(circle?.namespaceURI).toBe(SVG_NS);
    expect(circle?.getAttribute("r")).toBe("4");
    expect(svg.querySelector("linearGradient")?.namespaceURI).toBe(SVG_NS);
  });

  it("keeps HTML elements in the HTML namespace", () => {
    const div = h("div", null, "hi");
    expect(div.namespaceURI).toBe(HTML_NS);
  });

  it("binds reactive SVG attributes", () => {
    const r = state(4);
    const circle = h("circle", { cx: 5, cy: 5, r: () => r() });
    expect(circle.getAttribute("r")).toBe("4");
    r(7);
    expect(circle.getAttribute("r")).toBe("7");
  });

  it("toggles reactive classes on SVG elements", () => {
    const on = state(false);
    const arc = h("circle", { class: { active: () => on() } });
    expect(arc.classList.contains("active")).toBe(false);
    on(true);
    expect(arc.classList.contains("active")).toBe(true);
  });
});

describe("loom DOM props and bindings", () => {
  it("applies key, static, false/aria, event, and reactive props", () => {
    let clicks = 0;
    const title = state("hi");
    const pressed = state(false);
    const el = h("button", {
      id: "b",
      type: "button",
      key: "k",
      disabled: false, // non-aria false -> skipped
      "aria-hidden": false, // aria false -> rendered as "false"
      "aria-pressed": () => pressed(), // reactive aria boolean
      onclick: () => {
        clicks++;
      },
      title: attr("title", () => title()), // explicit attr binding
      "data-x": () => title(), // function attr
      tabindex: 3, // static number
    });

    expect(el.id).toBe("b");
    expect(el.getAttribute("data-loom-key")).toBe("k");
    expect(el.hasAttribute("disabled")).toBe(false);
    expect(el.getAttribute("aria-hidden")).toBe("false");
    expect(el.getAttribute("aria-pressed")).toBe("false");
    expect(el.getAttribute("title")).toBe("hi");
    expect(el.getAttribute("data-x")).toBe("hi");
    expect(el.getAttribute("tabindex")).toBe("3");

    el.dispatchEvent(new Event("click"));
    expect(clicks).toBe(1);

    title("bye");
    pressed(true);
    expect(el.getAttribute("title")).toBe("bye");
    expect(el.getAttribute("data-x")).toBe("bye");
    expect(el.getAttribute("aria-pressed")).toBe("true");
  });

  it("fires ontap on a tap but not a drag, and resets on pointercancel", () => {
    let taps = 0;
    const el = h("button", {
      ontap: () => {
        taps++;
      },
    });
    const send = (kind: string, x: number, y: number): void => {
      el.dispatchEvent(
        new PointerEvent(kind, { pointerId: 1, clientX: x, clientY: y }),
      );
    };

    send("pointerdown", 10, 10);
    send("pointerup", 12, 12); // within slop -> a tap
    expect(taps).toBe(1);

    send("pointerdown", 10, 10);
    send("pointerup", 40, 40); // moved past slop -> a drag, not a tap
    expect(taps).toBe(1);

    send("pointerdown", 10, 10);
    el.dispatchEvent(new PointerEvent("pointercancel", { pointerId: 1 }));
    send("pointerup", 10, 10); // press was cancelled -> no tap
    expect(taps).toBe(1);

    // A pointerup whose id doesn't match the press is ignored.
    send("pointerdown", 10, 10);
    el.dispatchEvent(
      new PointerEvent("pointerup", { pointerId: 2, clientX: 10, clientY: 10 }),
    );
    expect(taps).toBe(1);
  });

  it("binds tap imperatively too", () => {
    let taps = 0;
    const el = h("button", {});
    tap(el, () => {
      taps++;
    });
    el.dispatchEvent(new PointerEvent("pointerdown", { pointerId: 1 }));
    el.dispatchEvent(new PointerEvent("pointerup", { pointerId: 1 }));
    expect(taps).toBe(1);
  });

  it("renders boolean-true and removes null attributes", () => {
    const flag = state<boolean | null>(true);
    const el = h("input", { required: () => flag() });
    expect(el.getAttribute("required")).toBe(""); // true -> ""
    flag(null);
    expect(el.hasAttribute("required")).toBe(false); // null -> removed
  });

  it("dedupes reactive text updates that stringify the same", () => {
    const value = state<unknown>(false);
    const node = text(() => value());
    expect(node.data).toBe(""); // false -> "" (stringValue false branch)
    value(null); // re-runs, null -> "" -> next === previous early return
    expect(node.data).toBe("");
    value("b");
    expect(node.data).toBe("b");
  });

  it("applies class as string, array, binding, and map", () => {
    const on = state(false);
    const live = state(true);
    const el = h("div", {
      class: ["base", { dyn: () => on() }, "  "], // string + map + blank
    });
    el.setAttribute("class", el.getAttribute("class") ?? "");
    expect(el.classList.contains("base")).toBe(true);
    expect(el.classList.contains("dyn")).toBe(false);
    on(true);
    expect(el.classList.contains("dyn")).toBe(true);

    const el2 = h("div", {
      class: classed("live", () => live()),
    });
    expect(el2.classList.contains("live")).toBe(true);
    live(false);
    expect(el2.classList.contains("live")).toBe(false);

    // static truthy map value -> classList.add; non-record class -> ignored
    const el3 = h("div", { class: { kept: 1 } as unknown as string });
    expect(el3.classList.contains("kept")).toBe(true);
    const el4 = h("div", { class: 7 as unknown as string });
    expect(el4.getAttribute("class")).toBeNull();
  });

  it("applies style as string, array, map, binding, and function", () => {
    const size = state(12);
    const op = state<string | null>("1");
    const el = h("div", {
      style: {
        color: "red",
        fontSize: () => `${size()}px`,
        "--gap": "4px",
        width: null, // skipped
      },
    });
    expect(el.style.color).toBe("red");
    expect(el.style.getPropertyValue("--gap")).toBe("4px");
    expect(el.style.fontSize).toBe("12px");
    size(20);
    expect(el.style.fontSize).toBe("20px");

    const el2 = h("div", { style: "color: blue" });
    expect(el2.getAttribute("style")).toContain("blue");

    const el3 = h("div", { style: ["color:green", { fontWeight: "bold" }] });
    expect(el3.style.color).toBe("green");
    expect(el3.style.fontWeight).toBe("bold");

    const el4 = h("div", { style: style("opacity", () => op()) });
    expect(el4.style.opacity).toBe("1");
    op(null); // null -> removeProperty
    expect(el4.style.opacity).toBe("");

    const el5 = h("div", { style: 5 as unknown as string }); // non-record -> ignored
    expect(el5.getAttribute("style")).toBeNull();
  });
});

describe("loom DOM dispose and remove", () => {
  it("stops all owned effects of a subtree and detaches on remove", () => {
    const a = state("x");
    const b = state(false);
    const parent = document.createElement("div");
    const child = h("span", {
      title: () => a(),
      class: { on: () => b() },
    });
    parent.appendChild(child);
    document.body.appendChild(parent);

    expect(child.getAttribute("title")).toBe("x");
    dispose(parent); // stops the two owned effects on the child
    a("y");
    b(true);
    expect(child.getAttribute("title")).toBe("x"); // no longer reactive
    expect(child.classList.contains("on")).toBe(false);

    remove(parent);
    expect(parent.parentNode).toBeNull();
  });
});

describe("loom DOM list edge cases", () => {
  it("throws on duplicate keys", () => {
    const root = document.createElement("section");
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "a" }]);
    expect(() =>
      list(root, rows, { key: (row) => row.id, render: renderRow }),
    ).toThrow(/Duplicate Loom key/);
  });

  it("runs FLIP animations for moved nodes when enabled", () => {
    const animate = vi.fn();
    const root = document.createElement("section");
    document.body.appendChild(root);
    const makeRow = (row: Row): Element => {
      const node = document.createElement("div");
      node.textContent = row.id;
      // Position derived from current index so before/after rects differ on reorder.
      node.getBoundingClientRect = () => {
        const idx = node.parentNode
          ? [...(node.parentNode as Element).children].indexOf(node)
          : 0;
        return { left: idx * 100, top: 0 } as DOMRect;
      };
      (node as unknown as { animate: typeof animate }).animate = animate;
      return node;
    };
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stop = list(root, rows, {
      key: (row) => row.id,
      render: makeRow,
      animate: () => true,
    });

    rows([{ id: "b" }, { id: "a" }]); // both move -> animate called
    expect(animate).toHaveBeenCalled();
    stop();
  });
});

describe("loom DOM branch coverage", () => {
  it("disposes a node owning a single effect", () => {
    const a = state("x");
    const node = text(() => a());
    const host = document.createElement("div");
    host.appendChild(node);
    dispose(host); // single (non-array) owned effect path
    a("y");
    expect(node.data).toBe("x");
  });

  it("skips inherited props and renders function children", () => {
    const props = Object.assign(Object.create({ inherited: "no" }), {
      id: "yes",
    });
    const v = state("c");
    const el = h("div", props, () => v()); // function child -> text node
    expect(el.id).toBe("yes");
    expect(el.hasAttribute("inherited")).toBe(false);
    expect(el.textContent).toBe("c");
    v("d");
    expect(el.textContent).toBe("d");
  });

  it("handles falsy and inherited entries in class maps/arrays", () => {
    const el = h("div", { class: ["a", "b", null, undefined] });
    expect(el.getAttribute("class")).toBe("a b"); // two strings -> append branch
    const map = Object.assign(Object.create({ inh: true }), {
      own: true,
      off: 0,
    });
    const el2 = h("div", { class: map as unknown as string });
    expect(el2.classList.contains("own")).toBe(true);
    expect(el2.classList.contains("off")).toBe(false); // falsy static value
    expect(el2.classList.contains("inh")).toBe(false); // inherited skipped
  });

  it("handles falsy and inherited entries in style maps/arrays", () => {
    const el = h("div", { style: ["color:green", null] });
    expect(el.style.color).toBe("green");
    const map = Object.assign(Object.create({ inh: "1px" }), { margin: "2px" });
    const el2 = h("div", { style: map as unknown as string });
    expect(el2.style.margin).toBe("2px");
    expect(el2.style.getPropertyValue("inh")).toBe(""); // inherited skipped
  });

  it("dedupes attr and style bindings that resolve the same", () => {
    const av = state<unknown>(false);
    const el = h("div", { "data-x": () => av() });
    expect(el.hasAttribute("data-x")).toBe(false); // false -> null -> removed
    av(null); // re-runs, null -> null -> early return
    expect(el.hasAttribute("data-x")).toBe(false);
    av("y");
    expect(el.getAttribute("data-x")).toBe("y");

    const sv = state<unknown>(false);
    const el2 = h("div", { style: style("opacity", () => sv()) });
    expect(el2.style.opacity).toBe(""); // false -> null -> removeProperty
    sv(null); // re-runs, null -> null -> early return
    expect(el2.style.opacity).toBe("");
    sv("0.5");
    expect(el2.style.opacity).toBe("0.5");
  });

  it("FLIP skips unmoved nodes and a disconnected snapshot", () => {
    const animate = vi.fn();
    const mk = (row: Row): Element => {
      const node = document.createElement("div");
      node.textContent = row.id;
      node.getBoundingClientRect = () => {
        const idx = node.parentNode
          ? [...(node.parentNode as Element).children].indexOf(node)
          : 0;
        return { left: idx * 100, top: 0 } as DOMRect;
      };
      (node as unknown as { animate: typeof animate }).animate = animate;
      return node;
    };

    // Connected: [a,b,c] -> [a,c,b] keeps `a` put (no move -> skip) while b,c move.
    const root = document.createElement("section");
    document.body.appendChild(root);
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }, { id: "c" }]);
    const stop = list(root, rows, {
      key: (r) => r.id,
      render: mk,
      animate: () => true,
    });
    animate.mockClear();
    rows([{ id: "a" }, { id: "c" }, { id: "b" }]);
    expect(animate).toHaveBeenCalledTimes(2); // b and c, not a
    stop();

    // Disconnected container: snapshot finds no connected nodes -> no animation.
    const off = document.createElement("section");
    const offRows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stopOff = list(off, offRows, {
      key: (r) => r.id,
      render: mk,
      animate: () => true,
    });
    animate.mockClear();
    offRows([{ id: "b" }, { id: "a" }]);
    expect(animate).not.toHaveBeenCalled();
    stopOff();
  });
});

describe("loom DOM when/match", () => {
  it("toggles a subtree on the truthiness of the condition", () => {
    const open = state(false);
    const root = h("div", null, [
      "before",
      when(open, () => h("span", null, "panel")),
      "after",
    ]);
    expect(root.textContent).toBe("beforeafter");

    open(true);
    expect(root.querySelector("span")?.textContent).toBe("panel");
    expect(root.textContent).toBe("beforepanelafter");

    open(false);
    expect(root.querySelector("span")).toBeNull();
    expect(root.textContent).toBe("beforeafter");
  });

  it("renders the fallback while falsy", () => {
    const open = state(true);
    const root = h(
      "div",
      null,
      when(
        open,
        () => h("span", { class: "on" }, "on"),
        () => h("span", { class: "off" }, "off"),
      ),
    );
    expect(root.querySelector(".on")).not.toBeNull();
    open(false);
    expect(root.querySelector(".on")).toBeNull();
    expect(root.querySelector(".off")?.textContent).toBe("off");
  });

  it("does not rebuild while the condition stays truthy", () => {
    const user = state<{ name: string } | null>({ name: "a" });
    const built = vi.fn();
    const root = h(
      "div",
      null,
      when(user, () => {
        built();
        return h(
          "span",
          null,
          text(() => user()?.name ?? ""),
        );
      }),
    );
    expect(built).toHaveBeenCalledTimes(1);
    expect(root.querySelector("span")?.textContent).toBe("a");

    // New object, still truthy: the subtree must stay (fine-grained), only the inner binding updates.
    const span = root.querySelector("span");
    user({ name: "b" });
    expect(built).toHaveBeenCalledTimes(1);
    expect(root.querySelector("span")).toBe(span); // same node, not recreated
    expect(span?.textContent).toBe("b");

    user(null); // falsy: now it tears down
    expect(root.querySelector("span")).toBeNull();
    user({ name: "c" }); // truthy again: rebuilt once
    expect(built).toHaveBeenCalledTimes(2);
    expect(root.querySelector("span")?.textContent).toBe("c");
  });

  it("disposes the branch's effects when it is swapped out", () => {
    const open = state(true);
    const runs = vi.fn();
    const tick = state(0);
    const root = h(
      "div",
      null,
      when(open, () =>
        h(
          "span",
          null,
          text(() => {
            runs();
            return String(tick());
          }),
        ),
      ),
    );
    expect(runs).toHaveBeenCalledTimes(1);
    open(false); // branch removed -> its text effect disposed
    runs.mockClear();
    tick(1); // would re-run the disposed effect if it leaked
    expect(runs).not.toHaveBeenCalled();
    void root;
  });

  it("match swaps by key and falls back", () => {
    const tab = state<"info" | "graph" | "trace">("info");
    const root = h(
      "div",
      null,
      match(
        tab,
        {
          info: () => h("span", { class: "v" }, "info"),
          graph: () => h("span", { class: "v" }, "graph"),
        },
        () => h("span", { class: "v" }, "none"),
      ),
    );
    expect(root.querySelector(".v")?.textContent).toBe("info");
    tab("graph");
    expect(root.querySelector(".v")?.textContent).toBe("graph");
    tab("trace"); // no case -> fallback
    expect(root.querySelector(".v")?.textContent).toBe("none");
  });

  it("removing the host disposes the dynamic slot's effect", () => {
    const open = state(true);
    const sel = vi.fn(() => open());
    const host = h(
      "div",
      null,
      when(sel, () => h("span", null, "x")),
    );
    document.body.append(host);
    expect(sel).toHaveBeenCalled();
    sel.mockClear();
    remove(host); // tears down the slot effect
    open(false); // slot effect, if alive, would re-read sel
    expect(sel).not.toHaveBeenCalled();
  });
});
