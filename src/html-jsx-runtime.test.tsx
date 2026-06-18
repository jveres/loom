/** @jsxImportSource loom/html */
import { describe, expect, it } from "vitest";
import { html, raw, renderToString } from "./html.js";
import { Fragment, jsx, jsxDEV, jsxs } from "./html-jsx-runtime.js";

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
        onSubmit={() => undefined}
        style={{ color: "red", fontSize: "12px" }}
      >
        Link
      </form>
    );

    expect(renderToString(out)).toBe(
      '<form style="color:red;font-size:12px">Link</form>',
    );
  });
});
