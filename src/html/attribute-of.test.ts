import { attributeOf, unsafeHtml } from "loom/html";
import { describe, expect, it } from "vitest";

describe("attributeOf", () => {
  it("reads the root opening tag's attribute — quoted (unescaped), single-quoted, bare, or unquoted — never a descendant's", () => {
    const html = unsafeHtml(
      `<section class="x" data-a="1 &amp; 2" data-b='q' data-bare data-u=raw><p data-a="inner">t</p></section>`,
    );
    expect(attributeOf(html, "data-a")).toBe("1 & 2");
    expect(attributeOf(html, "data-b")).toBe("q");
    expect(attributeOf(html, "data-bare")).toBe("");
    expect(attributeOf(html, "data-u")).toBe("raw");
    expect(attributeOf(html, "data-z")).toBeUndefined();
    expect(attributeOf(html.value, "class")).toBe("x");
  });
  it("answers undefined for a rootless value or one that leads with text", () => {
    expect(attributeOf(unsafeHtml("plain"), "class")).toBeUndefined();
    expect(attributeOf("  <!-- c --><p class=a>", "class")).toBeUndefined();
    expect(attributeOf("<p class=a", "class")).toBeUndefined();
  });
  it("escapes the name it was given (a dot or a bracket is literal)", () => {
    expect(attributeOf(`<i data-x.y="1" data-xzy="2">`, "data-x.y")).toBe("1");
  });
});
