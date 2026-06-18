import { beforeAll, describe, expect, it } from "vitest";
import { h, text } from "./dom.js";
import { Fragment, jsx, jsxDEV, jsxs } from "./jsx-runtime.js";
import { state } from "./loom.js";

class FakeNode {
  parentNode: FakeNode | null = null;
  readonly childNodes: FakeNode[] = [];

  appendChild(node: FakeNode): FakeNode {
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  get textContent(): string {
    return this.childNodes.map((node) => node.textContent).join("");
  }
}

class FakeText extends FakeNode {
  constructor(public data: string) {
    super();
  }

  override get textContent(): string {
    return this.data;
  }
}

class FakeClassList {
  constructor(private readonly element: FakeElement) {}

  add(...tokens: string[]): void {
    const names = new Set(this.element.className.split(/\s+/).filter(Boolean));
    for (const token of tokens) names.add(token);
    this.element.className = [...names].join(" ");
    if (this.element.className)
      this.element.setAttribute("class", this.element.className);
  }

  toggle(token: string, force: boolean): void {
    const names = new Set(this.element.className.split(/\s+/).filter(Boolean));
    if (force) names.add(token);
    else names.delete(token);
    this.element.className = [...names].join(" ");
    if (this.element.className)
      this.element.setAttribute("class", this.element.className);
    else this.element.removeAttribute("class");
  }
}

class FakeElement extends FakeNode {
  readonly attributes = new Map<string, string>();
  readonly classList = new FakeClassList(this);
  className = "";

  constructor(readonly tagName: string) {
    super();
  }

  get children(): FakeElement[] {
    return this.childNodes.filter(
      (node): node is FakeElement => node instanceof FakeElement,
    );
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
    if (name === "class") this.className = value;
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
    if (name === "class") this.className = "";
  }
}

beforeAll(() => {
  Object.defineProperty(globalThis, "Node", {
    configurable: true,
    value: FakeNode,
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: (tag: string) => new FakeElement(tag.toUpperCase()),
      createTextNode: (data: string) => new FakeText(data),
    },
  });
});

describe("loom DOM JSX runtime", () => {
  it("exports automatic JSX runtime helpers", () => {
    expect(typeof jsx).toBe("function");
    expect(typeof jsxs).toBe("function");
    expect(typeof jsxDEV).toBe("function");
    expect(typeof Fragment).toBe("function");
  });

  it("creates DOM nodes from intrinsic JSX", () => {
    const node = (
      <label htmlFor="name" className="field">
        Name
      </label>
    ) as HTMLLabelElement;

    expect(node.tagName).toBe("LABEL");
    expect(node.getAttribute("for")).toBe("name");
    expect(node.className).toBe("field");
    expect(node.textContent).toBe("Name");
  });

  it("calls function components and strips key from props", () => {
    let receivedKey: unknown = "unset";

    function Button(props: { label: string; key?: string }) {
      receivedKey = props.key;
      return <button type="button">{props.label}</button>;
    }

    const node = <Button key="save" label="Save" />;

    expect((node as HTMLButtonElement).textContent).toBe("Save");
    expect(receivedKey).toBeUndefined();
  });

  it("strips key from intrinsic elements", () => {
    const node = <div key="card" />;

    expect((node as Element).getAttribute("data-loom-key")).toBeNull();
  });

  it("renders fragments without wrapper nodes", () => {
    const root = h(
      "div",
      null,
      <>
        <span>A</span>
        <span>B</span>
      </>,
    );

    expect(root.children).toHaveLength(2);
    expect(root.textContent).toBe("AB");
  });

  it("keeps reactive DOM helpers usable inside JSX", () => {
    const count = state(0);
    const node = <button type="button">{text(count)}</button>;

    expect((node as HTMLButtonElement).textContent).toBe("0");
    count(2);
    expect((node as HTMLButtonElement).textContent).toBe("2");
  });

  it("binds reactive JSX children, attributes, and class maps", () => {
    const count = state(0);
    const active = state(false);
    const node = (
      <button
        type="button"
        aria-pressed={active}
        class={{ active }}
        data-count={() => count()}
      >
        {() => `Count ${count()}`}
      </button>
    ) as HTMLButtonElement;

    expect(node.textContent).toBe("Count 0");
    expect(node.getAttribute("aria-pressed")).toBe("false");
    expect(node.getAttribute("data-count")).toBe("0");
    expect(node.className).toBe("");

    count(2);
    active(true);

    expect(node.textContent).toBe("Count 2");
    expect(node.getAttribute("aria-pressed")).toBe("true");
    expect(node.getAttribute("data-count")).toBe("2");
    expect(node.className).toBe("active");
  });
});
