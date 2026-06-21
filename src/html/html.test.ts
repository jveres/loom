import { describe, expect, it } from "vitest";
import {
  escapeAttribute,
  escapeText,
  html,
  isHtml,
  raw,
  renderToString,
} from "./index.js";

describe("loom html", () => {
  it("raw wraps a string and stringifies", () => {
    const r = raw("<b>x</b>");
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
    expect(renderToString(raw("<x>"))).toBe("<x>");
    expect(renderToString(["a", 1, raw("<y>"), null, ["z"]])).toBe("a1<y>z");
  });

  it("html template interpolates and escapes values", () => {
    const name = "<script>";
    const out = html`<p>${name}</p>${raw("<hr>")}`;
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
