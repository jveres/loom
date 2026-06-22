// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { css } from "./css.js";
import { h } from "./dom/index.js";
import { renderHtml } from "./html/index.js";
import { jsx } from "./html/jsx-runtime.js";

describe("css() token", () => {
  it("builds a branded, scoped token from a rule body", () => {
    const t = css`color: red;`;
    expect(t.className).toMatch(/^loom-[0-9a-z]+$/);
    expect(t.cssText).toBe(`.${t.className}{color: red;}`);
    expect(String(t)).toBe(t.className);
    expect(`${t}`).toBe(t.className); // template interpolation yields the class name
  });

  it("dedups identical bodies to one token, distinguishes different ones", () => {
    expect(css`gap: 1px;`).toBe(css`gap: 1px;`);
    expect(css`gap: 1px;`).not.toBe(css`gap: 2px;`);
  });
});

describe("css() + DOM renderer", () => {
  it("applies the class and injects the rule once, under @layer loom", () => {
    const card = css`padding: 3px;`;
    const a = h("div", { class: card });
    const b = h("div", { class: [card, "extra"] }); // same token again + a plain class
    expect(a.getAttribute("class")).toBe(card.className);
    expect(b.getAttribute("class")).toBe(`${card.className} extra`);

    const sheet = [...document.querySelectorAll("style")]
      .map((s) => s.textContent ?? "")
      .join("");
    expect(sheet).toContain(`@layer loom{.${card.className}{padding: 3px;}}`);
    // injected exactly once despite two uses
    expect(sheet.split(`.${card.className}{`).length - 1).toBe(1);
  });
});

describe("css() + HTML renderer (SSR round-trip)", () => {
  it("emits the class names and collects the stylesheet once", () => {
    const box = css`margin: 5px;`;
    const { html, css: stylesheet } = renderHtml(() =>
      jsx("section", {
        class: [box, "outer"],
        children: jsx("p", { class: box, children: "hi" }),
      }),
    );
    expect(html).toContain(`<section class="${box.className} outer">`);
    expect(html).toContain(`<p class="${box.className}">hi</p>`);
    // box used twice -> collected once, wrapped in @layer loom
    expect(stylesheet).toBe(`@layer loom{.${box.className}{margin: 5px;}}`);
  });

  it("collects nothing when no css() token is used", () => {
    const { html, css: stylesheet } = renderHtml(() =>
      jsx("div", { class: "plain", children: "x" }),
    );
    expect(html).toBe(`<div class="plain">x</div>`);
    expect(stylesheet).toBe("");
  });
});
