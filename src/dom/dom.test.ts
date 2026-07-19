// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { state } from "../loom.js";
import {
  attr,
  bind,
  bindManual,
  classed,
  dispose,
  each,
  h,
  list,
  match,
  onTap,
  onUnmount,
  remove,
  replaceChildren,
  resourceGroup,
  style,
  template,
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

const verifyResourceGroupCallbackType = (): void => {
  // Compile-time API regression only: ownership capture cannot cross an await.
  // @ts-expect-error resourceGroup callbacks are synchronous
  resourceGroup(async () => {});
};
void verifyResourceGroupCallbackType;

describe("loom DOM ownership", () => {
  it("resourceGroup() stops bindings without requiring a subtree walk", () => {
    const value = state("first");
    const group = resourceGroup(() => h("div", null, text(value)));

    value("second");
    expect(group.value.textContent).toBe("second");

    group.dispose();
    value("third");
    expect(group.value.textContent).toBe("second");

    group.dispose();
    dispose(group.value);
    expect(group.value.textContent).toBe("second");
  });

  it("resourceGroup() runs lifecycle cleanup exactly once", () => {
    const cleanup = vi.fn();
    const group = resourceGroup(() => h("div", { onunmount: cleanup }));

    group.dispose();
    remove(group.value);
    group.dispose();

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("resourceGroup() cleans up resources when construction throws", () => {
    const value = state("initial");
    const failure = new Error("construction failed");
    let node: HTMLElement | undefined;

    expect(() =>
      resourceGroup(() => {
        node = h("div", null, text(value));
        throw failure;
      }),
    ).toThrow(failure);
    value("after");

    expect(node?.textContent).toBe("initial");
  });

  it("resourceGroup() rejects an async function before construction begins", () => {
    let invoked = false;
    const unsafeCall = resourceGroup as (fn: () => Promise<void>) => unknown;

    expect(() =>
      unsafeCall(async () => {
        invoked = true;
        await Promise.resolve();
      }),
    ).toThrow("resourceGroup() callbacks must be synchronous.");
    expect(invoked).toBe(false);
  });

  it("resourceGroup() rejects async construction and cleans up work before the await", () => {
    const value = state("initial");
    let node: HTMLElement | undefined;
    const unsafeCall = resourceGroup as (fn: () => Promise<void>) => unknown;

    expect(() =>
      unsafeCall(() => {
        node = h("div", null, text(value));
        return Promise.resolve();
      }),
    ).toThrow("resourceGroup() callbacks must be synchronous.");
    value("after");

    expect(node?.textContent).toBe("initial");
  });

  it("resourceGroup() rejects nested ownership arenas", () => {
    expect(() => resourceGroup(() => resourceGroup(() => h("span")))).toThrow(
      "resourceGroup() cannot be nested",
    );
  });

  it("resourceGroup() preserves descendant-first lifecycle order", () => {
    const order: string[] = [];
    const group = resourceGroup(() => {
      const parent = h("div", { onunmount: () => order.push("parent") });
      const child = h("span", { onunmount: () => order.push("child") });
      parent.append(child);
      return parent;
    });

    group.dispose();

    expect(order).toEqual(["child", "parent"]);
  });

  it("resourceGroup() preserves descendant-first binding cleanup order", () => {
    const order: string[] = [];
    const group = resourceGroup(() => {
      const parent = h("div");
      const child = h("span");
      bind(parent, () => () => order.push("parent"));
      bind(child, () => () => order.push("child"));
      parent.append(child);
      return parent;
    });

    group.dispose();

    expect(order).toEqual(["child", "parent"]);
  });

  it("onUnmount() disposers run when the node or an ancestor is removed", () => {
    const parent = h("div");
    const child = h("span");
    parent.append(child);
    const order: string[] = [];
    onUnmount(child, () => order.push("child"));
    onUnmount(parent, () => order.push("parent"));
    remove(parent); // disposal reaches descendants' owned disposers too
    expect(order.sort()).toEqual(["child", "parent"]);
  });

  it("snapshots descendants and finishes disposal when a disposer throws", () => {
    const parent = h("div");
    const first = h("span");
    const second = h("span");
    parent.append(first, second);
    document.body.append(parent);
    const order: string[] = [];
    const failure = new Error("first cleanup failed");

    onUnmount(first, () => {
      order.push("first");
      throw failure;
    });
    onUnmount(second, () => order.push("second"));
    onUnmount(parent, () => {
      order.push("parent");
      parent.replaceChildren();
    });

    expect(() => remove(parent)).toThrow(failure);
    expect(order).toEqual(["first", "second", "parent"]);
    expect(parent.parentNode).toBeNull();

    // Entries are cleared before callbacks run, so a failed disposer is never retried.
    dispose(parent);
    expect(order).toEqual(["first", "second", "parent"]);
  });

  it("unregisters a manually stopped binding from its owner", () => {
    const node = h("div");
    const cleanup = vi.fn();
    const stop = bindManual(node, () => cleanup);

    stop();
    expect(cleanup).toHaveBeenCalledTimes(1);
    dispose(node);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("replaceChildren disposes outgoing trees and preserves incoming descendants", () => {
    const oldValue = state("old");
    const keptValue = state("kept");
    const old = h("span", null, () => oldValue());
    const kept = h("strong", null, () => keptValue());
    const outgoing = h("section", null, [old, kept]);
    const parent = h("div", null, outgoing);

    replaceChildren(parent, kept, " tail");
    oldValue("stale");
    keptValue("live");

    expect(parent.textContent).toBe("live tail");
    expect(old.textContent).toBe("old");
    expect(kept.textContent).toBe("live");
  });

  it("replaceChildren settles the DOM and reports every disposal failure", () => {
    const parent = h("div");
    const first = h("span");
    const second = h("span");
    const next = h("b", null, "next");
    const calls: string[] = [];
    onUnmount(first, () => {
      calls.push("first");
      throw new Error("first failed");
    });
    onUnmount(second, () => {
      calls.push("second");
      throw new Error("second failed");
    });
    parent.append(first, second);

    expect(() => replaceChildren(parent, next)).toThrow(AggregateError);
    expect(calls).toEqual(["first", "second"]);
    expect([...parent.childNodes]).toEqual([next]);
  });

  it("replaceChildren keeps outgoing bindings live when native replacement fails", () => {
    const value = state("before");
    const old = h("span", null, () => value());
    const parent = h("div", null, old);
    vi.spyOn(parent, "replaceChildren").mockImplementationOnce(() => {
      throw new DOMException("invalid hierarchy", "HierarchyRequestError");
    });

    expect(() => replaceChildren(parent, h("b", null, "next"))).toThrow(
      DOMException,
    );
    value("after");

    expect(parent.firstChild).toBe(old);
    expect(old.textContent).toBe("after");
  });

  it("replaceChildren rolls back incoming nodes and staged bindings on failure", () => {
    const keptValue = state("kept");
    const stagedValue = state("staged");
    let stagedReads = 0;
    const kept = h("strong", null, () => keptValue());
    const outgoing = h("section", null, kept);
    const parent = h("div", null, outgoing);
    vi.spyOn(parent, "replaceChildren").mockImplementationOnce(() => {
      throw new DOMException("invalid hierarchy", "HierarchyRequestError");
    });

    expect(() =>
      replaceChildren(parent, kept, () => {
        stagedReads++;
        return stagedValue();
      }),
    ).toThrow(DOMException);
    keptValue("still live");
    stagedValue("must be stopped");

    expect(kept.parentNode).toBe(outgoing);
    expect(parent.textContent).toBe("still live");
    expect(stagedReads).toBe(1);
  });

  it("replaceChildren restores moved siblings in their original DOM order", () => {
    const parent = h("div");
    const first = h("span", null, "first");
    const second = h("span", null, "second");
    const third = h("span", null, "third");
    parent.append(first, second, third);
    vi.spyOn(parent, "replaceChildren").mockImplementationOnce(() => {
      throw new DOMException("invalid hierarchy", "HierarchyRequestError");
    });

    expect(() => replaceChildren(parent, second, first)).toThrow(DOMException);

    expect([...parent.childNodes]).toEqual([first, second, third]);
  });

  it("replaceChildren restores a supplied fragment and its live children", () => {
    const value = state("before");
    const fragment = document.createDocumentFragment();
    const first = h("span", null, () => value());
    const second = h("span", null, "second");
    fragment.append(first, second);
    const parent = h("div", null, "old");
    vi.spyOn(parent, "replaceChildren").mockImplementationOnce(() => {
      throw new DOMException("invalid hierarchy", "HierarchyRequestError");
    });

    expect(() => replaceChildren(parent, fragment)).toThrow(DOMException);
    value("after");

    expect([...fragment.childNodes]).toEqual([first, second]);
    expect(first.textContent).toBe("after");
    expect(parent.textContent).toBe("old");
  });

  it("replaceChildren disposes reactive staging when child normalization fails", () => {
    const stagedValue = state("staged");
    let stagedReads = 0;
    const parent = h("div", null, "old");
    const wrongRuntime = {
      [Symbol.for("loom.html")]: true,
      toString: () => "<b>wrong runtime</b>",
    };

    expect(() =>
      replaceChildren(
        parent,
        () => {
          stagedReads++;
          return stagedValue();
        },
        wrongRuntime as never,
      ),
    ).toThrow("wrong jsxImportSource");
    stagedValue("must be stopped");

    expect(parent.textContent).toBe("old");
    expect(stagedReads).toBe(1);
  });

  it("replaceChildren disposes all children when clearing a parent", () => {
    const parent = h("div");
    const child = h("span");
    const cleanup = vi.fn();
    onUnmount(child, cleanup);
    parent.append(child);

    replaceChildren(parent);

    expect(parent.childNodes).toHaveLength(0);
    expect(cleanup).toHaveBeenCalledOnce();
  });
});

describe("loom DOM templates", () => {
  it("template() returns independent deep clones of one static root", () => {
    const clone = template("div")`<div class="row"><span>Ready</span></div>`;

    const first = clone();
    const second = clone();
    first.querySelector("span")?.replaceChildren("Changed");

    expect(first.outerHTML).toBe('<div class="row"><span>Changed</span></div>');
    expect(second.outerHTML).toBe('<div class="row"><span>Ready</span></div>');
    expect(first).not.toBe(second);
  });

  it("template() rejects dynamic interpolation", () => {
    const value = "dynamic";

    expect(() => template("div")`<div>${value}</div>`).toThrow(
      "template() accepts static markup only; bind dynamic values after cloning.",
    );
  });

  it.each([
    "",
    "plain text",
    "<i></i><b></b>",
    "<i></i>tail",
  ])("template() rejects an invalid root fragment: %s", (markup) => {
    const strings = Object.assign([markup], { raw: [markup] });

    expect(() => template("i")(strings)).toThrow(
      "template() requires exactly one root element.",
    );
  });

  it("template() rejects a root that disagrees with its declared tag", () => {
    expect(() => template("button")`<div></div>`).toThrow(
      'template("button") requires a <button> root.',
    );
  });

  it("template() accepts custom-element tag names with a safe Element type", () => {
    const clone = template("loom-card")`<loom-card></loom-card>`;

    expect(clone().localName).toBe("loom-card");
  });
});

describe("loom DOM wrong-runtime guard", () => {
  it("throws a clear error when a loom/html Html value is used as a child", () => {
    // the loom/html brand, constructed without importing the SSR surface
    const htmlValue = {
      [Symbol.for("loom.html")]: true,
      value: "<p>ssr</p>",
      toString: () => "<p>ssr</p>",
    };
    expect(() => h("div", null, htmlValue as never)).toThrow(
      /loom\/html Html value/,
    );
  });

  it("accepts nodes from another window realm", () => {
    const iframe = document.createElement("iframe");
    document.body.append(iframe);
    const foreign = iframe.contentDocument?.createElement("span");
    expect(foreign).toBeDefined();
    if (!foreign) return;
    foreign.textContent = "foreign";

    const globalNode = globalThis.Node;
    Object.defineProperty(globalThis, "Node", {
      configurable: true,
      value: class OtherRealmNode {},
    });
    try {
      const root = h("div", null, foreign);
      expect(root.firstChild).toBe(foreign);
      expect(root.textContent).toBe("foreign");
    } finally {
      Object.defineProperty(globalThis, "Node", {
        configurable: true,
        value: globalNode,
      });
      iframe.remove();
    }
  });
});

describe("loom DOM list", () => {
  it("reorders keyed nodes by default", () => {
    const root = document.createElement("section");
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stop = list<Row>(root, rows, {
      key: (row) => row.id,
      render: renderRow,
    });

    rows([{ id: "b" }, { id: "a" }]);

    expect(keys(root)).toEqual(["b", "a"]);
    stop();
  });

  it("moves existing keys with moveBefore when the platform has it", () => {
    const root = document.createElement("section");
    // happy-dom has no moveBefore; stub the atomic-move API so the preference is observable.
    const moved: string[] = [];
    (
      root as unknown as { moveBefore: (n: Node, ref: Node | null) => void }
    ).moveBefore = (node, ref) => {
      moved.push((node as Element).getAttribute("data-loom-key") ?? "?");
      root.insertBefore(node, ref);
    };
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stop = list(root, rows, { key: (row) => row.id, render: renderRow });

    // Initial render inserts new nodes — never via moveBefore (they aren't children yet).
    expect(moved).toEqual([]);

    rows([{ id: "b" }, { id: "a" }]);
    expect(keys(root)).toEqual(["b", "a"]);
    // A two-element swap is ONE state-preserving move (the LIS keeps the other in place).
    expect(moved).toHaveLength(1);

    // A new key still takes insertBefore; only one existing key moves.
    rows([{ id: "c" }, { id: "a" }, { id: "b" }]);
    expect(keys(root)).toEqual(["c", "a", "b"]);
    expect(moved).toHaveLength(2);
    stop();
  });

  it("can skip keyed node reordering for externally positioned layouts", () => {
    const root = document.createElement("section");
    const rows = state<readonly Row[]>([{ id: "a" }, { id: "b" }]);
    const stop = list<Row>(root, rows, {
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

  it("keeps numeric and string keys as distinct identities", () => {
    interface MixedRow {
      readonly id: string;
      readonly key: string | number;
    }
    const root = document.createElement("section");
    const rows = state<readonly MixedRow[]>([
      { id: "number", key: 1 },
      { id: "string", key: "1" },
    ]);
    const stop = list<MixedRow>(root, rows, {
      key: (row) => row.key,
      render: (row) => h("div", { "data-id": row.id }, row.id),
    });
    const numberNode = root.children[0];
    const stringNode = root.children[1];

    expect(root.children).toHaveLength(2);
    rows([
      { id: "string", key: "1" },
      { id: "number", key: 1 },
    ]);
    expect(root.children[0]).toBe(stringNode);
    expect(root.children[1]).toBe(numberNode);
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
    onTap(el, () => {
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

  it("binds form state through properties after options are mounted", () => {
    const inputValue = state("initial");
    const checked = state(false);
    const selectedValue = state("b");
    const optionSelected = state(false);
    const input = h("input", { value: inputValue, checked });
    const select = h("select", { value: selectedValue }, [
      h("option", { value: "a", selected: optionSelected }, "A"),
      h("option", { value: "b" }, "B"),
    ]);

    expect(input.value).toBe("initial");
    expect(input.getAttribute("value")).toBe("initial");
    expect(input.checked).toBe(false);
    expect(select.value).toBe("b");

    input.value = "user edit";
    inputValue("programmatic");
    checked(true);
    selectedValue("a");
    expect(input.value).toBe("programmatic");
    expect(input.getAttribute("value")).toBe("programmatic");
    expect(input.checked).toBe(true);
    expect(input.hasAttribute("checked")).toBe(true);
    expect(select.value).toBe("a");

    optionSelected(true);
    expect((select.options[0] as HTMLOptionElement).selected).toBe(true);
  });

  it("applies static form values as properties", () => {
    const input = h("input", { value: "typed", checked: true });
    const select = h("select", { value: "b" }, [
      h("option", { value: "a" }, "A"),
      h("option", { value: "b" }, "B"),
    ]);
    expect(input.value).toBe("typed");
    expect(input.getAttribute("value")).toBe("typed");
    expect(input.checked).toBe(true);
    expect(input.hasAttribute("checked")).toBe(true);
    expect(select.value).toBe("b");
    expect(select.getAttribute("value")).toBe("b");
  });

  it("does not assign a forbidden non-empty file-input value property", () => {
    const value = state("first.txt");
    const input = h("input", { type: "file", value });
    expect(input.getAttribute("value")).toBe("first.txt");
    expect(input.value).toBe("");

    expect(() => value("second.txt")).not.toThrow();
    expect(input.getAttribute("value")).toBe("second.txt");
    expect(input.value).toBe("");
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

  it("keeps a sole reactive text child stable across empty values and later siblings", () => {
    const value = state("");
    const el = h("div", null, value);
    const textNode = el.firstChild;
    const sibling = h("span", null, "tail");
    el.append(sibling);

    expect(textNode).toBeInstanceOf(Text);
    value("head");
    expect(el.firstChild).toBe(textNode);
    expect(el.textContent).toBe("headtail");
    expect(el.lastChild).toBe(sibling);
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

  it("match ignores inherited properties and supports null-prototype cases", () => {
    const key = state("constructor");
    const inherited = Object.create({
      constructor: () => h("span", { class: "v" }, "inherited"),
    }) as Record<string, () => Element>;
    inherited["safe"] = () => h("span", { class: "v" }, "safe");
    const root = h(
      "div",
      null,
      match(key, inherited, () => h("span", { class: "v" }, "fallback")),
    );
    expect(root.querySelector(".v")?.textContent).toBe("fallback");
    key("safe");
    expect(root.querySelector(".v")?.textContent).toBe("safe");

    const nullPrototype = Object.create(null) as Record<string, () => Element>;
    nullPrototype.constructor = () => h("span", { class: "v" }, "own");
    const ownRoot = h("div", null, match(key, nullPrototype));
    key("constructor");
    expect(ownRoot.querySelector(".v")?.textContent).toBe("own");
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

describe("loom DOM each", () => {
  const ids = (root: Element): string[] =>
    [...root.children].map((n) => n.getAttribute("data-loom-key") ?? "");

  it("renders, reorders (reusing nodes), inserts, and removes by key", () => {
    const rows = state<readonly { id: string }[]>([{ id: "a" }, { id: "b" }]);
    const root = h(
      "ul",
      null,
      each(
        rows,
        (r) => h("li", null, r.id),
        (r) => r.id,
      ),
    ) as HTMLElement;
    expect(ids(root)).toEqual(["a", "b"]);
    const a = root.querySelector('[data-loom-key="a"]');
    const b = root.querySelector('[data-loom-key="b"]');

    rows([{ id: "b" }, { id: "a" }]); // reorder: same nodes, moved
    expect(ids(root)).toEqual(["b", "a"]);
    expect(root.querySelector('[data-loom-key="a"]')).toBe(a);
    expect(root.querySelector('[data-loom-key="b"]')).toBe(b);

    rows([{ id: "b" }, { id: "c" }, { id: "a" }]); // insert in the middle
    expect(ids(root)).toEqual(["b", "c", "a"]);
    expect(root.querySelector('[data-loom-key="a"]')).toBe(a); // a preserved

    rows([{ id: "c" }]); // remove a and b
    expect(ids(root)).toEqual(["c"]);
  });

  it("keeps surrounding siblings and order around the slot", () => {
    const rows = state<readonly { id: string }[]>([{ id: "x" }]);
    const root = h("ul", null, [
      h("li", { class: "head" }, "head"),
      each(
        rows,
        (r) => h("li", null, r.id),
        (r) => r.id,
      ),
      h("li", { class: "foot" }, "foot"),
    ]) as HTMLElement;
    expect(root.firstElementChild?.className).toBe("head");
    expect(root.lastElementChild?.className).toBe("foot");
    rows([{ id: "x" }, { id: "y" }]);
    // head, x, y, foot
    expect([...root.children].map((n) => n.textContent)).toEqual([
      "head",
      "x",
      "y",
      "foot",
    ]);
  });

  it("disposes a removed row's effects", () => {
    const rows = state<readonly { id: string }[]>([{ id: "a" }]);
    const tick = state(0);
    const runs = vi.fn();
    const root = h(
      "ul",
      null,
      each(
        rows,
        (r) =>
          h(
            "li",
            null,
            text(() => {
              runs();
              return `${r.id}${tick()}`;
            }),
          ),
        (r) => r.id,
      ),
    ) as HTMLElement;
    expect(runs).toHaveBeenCalledTimes(1);
    rows([]); // row removed -> its text effect disposed
    runs.mockClear();
    tick(1);
    expect(runs).not.toHaveBeenCalled();
    void root;
  });

  it("throws on a duplicate key", () => {
    const rows = state<readonly { id: string }[]>([{ id: "a" }, { id: "a" }]);
    expect(() =>
      h(
        "ul",
        null,
        each(
          rows,
          (r) => h("li", null, r.id),
          (r) => r.id,
        ),
      ),
    ).toThrow(/Duplicate Loom key/);
  });

  it("removing the host disposes the each effect", () => {
    const rows = state<readonly { id: string }[]>([{ id: "a" }]);
    const reader = vi.fn(() => rows());
    const host = h(
      "ul",
      null,
      each(
        reader,
        (r) => h("li", null, r.id),
        (r) => r.id,
      ),
    ) as HTMLElement;
    document.body.append(host);
    reader.mockClear();
    remove(host);
    rows([{ id: "a" }, { id: "b" }]); // effect, if alive, would re-read
    expect(reader).not.toHaveBeenCalled();
  });
});

describe("loom DOM onunmount", () => {
  it("runs the onunmount cleanup when the node is removed the Loom way", () => {
    const cleanup = vi.fn();
    const host = h("div", null, h("span", { onunmount: cleanup }, "x"));
    document.body.append(host);
    expect(cleanup).not.toHaveBeenCalled();
    remove(host); // disposes the subtree -> the owned onunmount fires
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("fires when an ancestor slot swaps the node out (when/each)", () => {
    const open = state(true);
    const cleanup = vi.fn();
    const root = h(
      "div",
      null,
      when(open, () => h("p", { onunmount: cleanup }, "panel")),
    );
    expect(cleanup).not.toHaveBeenCalled();
    open(false); // when removes the branch subtree
    expect(cleanup).toHaveBeenCalledTimes(1);
    void root;
  });

  it("attr(el, name, read) binds an attribute imperatively", () => {
    const mode = state<string | boolean | null>("compact");
    const el = h("div");
    attr(el, "data-mode", () => mode());
    expect(el.getAttribute("data-mode")).toBe("compact");

    mode("full");
    expect(el.getAttribute("data-mode")).toBe("full");

    mode(true); // boolean true -> presence attribute
    expect(el.getAttribute("data-mode")).toBe("");
    mode(null); // null/false -> removed
    expect(el.hasAttribute("data-mode")).toBe(false);

    // Node-owned like every DOM binding: remove() stops it.
    mode("back");
    expect(el.getAttribute("data-mode")).toBe("back");
    remove(el);
    mode("after");
    expect(el.getAttribute("data-mode")).toBe("back");
  });

  it("wires the camelCase prop spellings (onUnmount, onTap)", () => {
    const cleanup = vi.fn();
    const tapped = vi.fn();
    const el = h("button", { onUnmount: cleanup, onTap: tapped });
    el.dispatchEvent(
      new PointerEvent("pointerdown", { pointerId: 1, clientX: 0, clientY: 0 }),
    );
    el.dispatchEvent(
      new PointerEvent("pointerup", { pointerId: 1, clientX: 0, clientY: 0 }),
    );
    expect(tapped).toHaveBeenCalledTimes(1);
    remove(el);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it("is a lifecycle hook, not a DOM event (no listener added)", () => {
    const cleanup = vi.fn();
    const el = h("button", { onunmount: cleanup });
    el.dispatchEvent(new Event("unmount")); // no such DOM event is wired
    expect(cleanup).not.toHaveBeenCalled();
    remove(el);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
