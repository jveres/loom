import {
  escapeAttribute,
  escapeText,
  html,
  isHtml,
  renderToString,
  serializeAttributes,
  unsafeHtml,
} from "loom/html";
import { describe, expect, it } from "vitest";

describe("loom html", () => {
  it("unsafeHtml wraps a string and stringifies", () => {
    const r = unsafeHtml("<b>x</b>");
    expect(isHtml(r)).toBe(true);
    expect(r.value).toBe("<b>x</b>");
    expect(r.toString()).toBe("<b>x</b>");
    expect(`${r}`).toBe("<b>x</b>");
  });
  it("isHtml rejects non-Html values", () => {
    expect(isHtml(null)).toBe(false);
    expect(isHtml("text")).toBe(false);
    expect(isHtml({})).toBe(false);
    expect(isHtml({ value: 1 })).toBe(false); // value is not a string
  });
  it("renderToString handles every child kind", () => {
    expect(renderToString(null)).toBe("");
    expect(renderToString(undefined)).toBe("");
    expect(renderToString(true)).toBe("");
    expect(renderToString(false)).toBe("");
    expect(renderToString(42)).toBe("42");
    expect(renderToString("a<b")).toBe("a&lt;b");
    expect(renderToString(unsafeHtml("<x>"))).toBe("<x>");
    expect(renderToString(["a", 1, unsafeHtml("<y>"), null, ["z"]])).toBe(
      "a1<y>z",
    );
  });
  it("html template interpolates and escapes values", () => {
    const name = "<script>";
    const out = html`<p>${name}</p>${unsafeHtml("<hr>")}`;
    expect(out.value).toBe("<p>&lt;script&gt;</p><hr>");
  });
  it("html tolerates more values than template strings", () => {
    // Calling html() directly with a short strings array exercises the
    // defensive `?? ""` fallbacks (unreachable via real tagged templates).
    const strings = ["start"] as unknown as TemplateStringsArray;
    expect(html(strings, "a", "b").value).toBe("startab");
    const empty = [] as unknown as TemplateStringsArray;
    expect(html(empty).value).toBe("");
  });
  it("escapeText / escapeAttribute cover all entities", () => {
    expect(escapeText(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
    expect(escapeAttribute(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
    expect(escapeText("plain text")).toBe("plain text");
  });
});
describe("serializeAttributes", () => {
  it("renders with the JSX rule: leading-space join, bare booleans, drops, escaping", () => {
    expect(
      serializeAttributes({
        class: ["a", { b: true, c: false }],
        "data-x": 'q"uote',
        hidden: true,
        checked: false,
        "aria-pressed": false,
        title: null,
        onclick: () => {},
        key: "k",
        "bad name": 1,
        href: "javascript:alert(1)",
        style: { color: "red", "--gap": 4 },
      }),
    ).toBe(
      ' class="a b" data-x="q&quot;uote" hidden aria-pressed="false" style="color:red;--gap:4"',
    );
    expect(serializeAttributes({ x: null })).toBe("");
  });
});
