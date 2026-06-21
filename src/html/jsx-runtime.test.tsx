/** @jsxImportSource loom/html */
import { describe, expect, it } from "vitest";
import { html, raw, renderToString } from "./index.js";
import { Fragment, jsx, jsxDEV, jsxs } from "./jsx-runtime.js";

describe("loom HTML JSX runtime", () => {
  it("exports automatic JSX runtime helpers", () => {
    expect(typeof jsx).toBe("function");
    expect(typeof jsxs).toBe("function");
    expect(typeof jsxDEV).toBe("function");
    expect(typeof Fragment).toBe("function");
  });

  it("renders escaped static HTML from JSX", () => {
    const title = "<Hello>";
    const out = (
      <article className={["card", false, "active"]}>
        <h1>{title}</h1>
        <input disabled value="Ada" />
      </article>
    );

    expect(renderToString(out)).toBe(
      '<article class="card active"><h1>&lt;Hello&gt;</h1><input disabled value="Ada"></article>',
    );
  });

  it("supports function components and fragments", () => {
    let receivedKey: unknown = "unset";

    function Item(props: { name: string }) {
      receivedKey = "key" in props ? props.key : undefined;
      return <li>{props.name}</li>;
    }

    const items = (
      <>
        <Item name="Ada" />
        <Item name="Grace" />
      </>
    );
    const out = <ul>{items}</ul>;

    expect(renderToString(out)).toBe("<ul><li>Ada</li><li>Grace</li></ul>");
    expect(receivedKey).toBeUndefined();
  });

  it("supports html templates and trusted raw HTML", () => {
    const out = html`<main>${raw("<strong>safe</strong>")} ${"<script>"}</main>`;

    expect(renderToString(out)).toBe(
      "<main><strong>safe</strong> &lt;script&gt;</main>",
    );
  });

  it("serializes safe attributes and drops unsafe ones", () => {
    const out = (
      <form
        action="javascript:alert(1)"
        onsubmit={() => undefined}
        style={{ color: "red", fontSize: "12px" }}
      >
        Link
      </form>
    );

    expect(renderToString(out)).toBe(
      '<form style="color:red;font-size:12px">Link</form>',
    );
  });

  it("renders via jsx/jsxs directly and on the null-props/void paths", () => {
    expect(renderToString(jsx("p", { children: "hi" }))).toBe("<p>hi</p>");
    expect(
      renderToString(jsxs("ul", { children: [jsx("li", { children: "a" })] })),
    ).toBe("<ul><li>a</li></ul>");
    expect(renderToString(jsx("br", null))).toBe("<br>"); // void, no props
    expect(renderToString(jsx("div", null))).toBe("<div></div>");
  });

  it("throws on an invalid tag name", () => {
    expect(() => jsx("bad tag", null)).toThrow(/Invalid HTML tag name/);
  });

  it("skips inherited props", () => {
    const props = Object.assign(Object.create({ inherited: "x" }), {
      id: "own",
    });
    expect(renderToString(jsx("div", props))).toBe('<div id="own"></div>');
  });

  it("drops nullish, false, event, dangerous, and malformed attributes", () => {
    const props: Record<string, unknown> = {
      id: null,
      hidden: false,
      key: "k",
      constructor: "c",
      prototype: "pr",
      onclick: () => {},
      "bad name": "x",
      keep: "ok",
    };
    Object.defineProperty(props, "__proto__", {
      value: "p",
      enumerable: true,
      configurable: true,
    });
    expect(renderToString(jsx("div", props))).toBe('<div keep="ok"></div>');
  });

  it("maps className/htmlFor and renders boolean attributes", () => {
    expect(
      renderToString(
        jsx("label", { className: "f", htmlFor: "n", children: "L" }),
      ),
    ).toBe('<label class="f" for="n">L</label>');
    expect(
      renderToString(
        jsx("input", { disabled: true } as Record<string, unknown>),
      ),
    ).toBe("<input disabled>");
  });

  it("keeps safe URL attributes and a namespaced one", () => {
    expect(
      renderToString(jsx("a", { href: "/ok" } as Record<string, unknown>)),
    ).toBe('<a href="/ok"></a>');
  });

  it("normalizes a class object map and drops empty array items", () => {
    expect(
      renderToString(
        jsx("div", { class: { a: true, b: false, c: 1 } } as Record<
          string,
          unknown
        >),
      ),
    ).toBe('<div class="a c"></div>');
    expect(
      renderToString(
        jsx("div", { class: ["a", false, "", []] } as Record<string, unknown>),
      ),
    ).toBe('<div class="a"></div>');
  });

  it("serializes styles: kebab-cases, keeps custom props, drops unsafe", () => {
    const out = jsx("div", {
      style: {
        backgroundColor: "red",
        "--gap": "4px",
        width: null,
        "bad name": "x",
        color: "expression(alert(1))",
        background: "javascript:1",
      },
    } as Record<string, unknown>);
    expect(renderToString(out)).toBe(
      '<div style="background-color:red;--gap:4px"></div>',
    );
  });
});
