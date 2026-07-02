// @vitest-environment happy-dom

import { describe, expect, it } from "vitest";
import { morph } from "./morph.js";

const el = (html: string): Element => {
  const host = document.createElement("div");
  host.innerHTML = html.trim();
  return host.firstElementChild as Element;
};

describe("morph", () => {
  it("patches text and attributes in place, keeping identity", () => {
    const from = el(`<section class="a"><h1>Old</h1><p>Body</p></section>`);
    const h1 = from.querySelector("h1");
    const result = morph(
      from,
      el(`<section class="b" id="x"><h1>New</h1><p>Body</p></section>`),
    );
    expect(result).toBe(from);
    expect(from.querySelector("h1")).toBe(h1);
    expect(from.querySelector("h1")?.textContent).toBe("New");
    expect(from.className).toBe("b");
    expect(from.id).toBe("x");
  });

  it("removes dropped attributes", () => {
    const from = el(`<div class="a" data-x="1"></div>`);
    morph(from, el(`<div class="a"></div>`));
    expect(from.hasAttribute("data-x")).toBe(false);
  });

  it("replaces when the tag changes", () => {
    const from = el(`<div>old</div>`);
    const host = document.createElement("main");
    host.append(from);
    const result = morph(from, el(`<span>new</span>`));
    expect(result.tagName).toBe("SPAN");
    expect(host.firstElementChild).toBe(result);
  });

  it("adds and removes children positionally", () => {
    const from = el(`<ul><li>a</li><li>b</li></ul>`);
    morph(from, el(`<ul><li>a</li><li>b</li><li>c</li></ul>`));
    expect(from.children.length).toBe(3);
    morph(from, el(`<ul><li>a</li></ul>`));
    expect(from.children.length).toBe(1);
    expect(from.textContent).toBe("a");
  });

  it("preserves an untouched sibling subtree (iframe identity)", () => {
    const from = el(
      `<section><h1>Title</h1><iframe src="https://example.com/embed"></iframe></section>`,
    );
    const iframe = from.querySelector("iframe");
    morph(
      from,
      el(
        `<section><h1>Retitled</h1><iframe src="https://example.com/embed"></iframe></section>`,
      ),
    );
    expect(from.querySelector("iframe")).toBe(iframe);
    expect(from.querySelector("h1")?.textContent).toBe("Retitled");
  });

  it("matches keyed children across reorders", () => {
    const from = el(
      `<div><p data-id="a">A</p><p data-id="b">B</p><p data-id="c">C</p></div>`,
    );
    const [a, b, c] = Array.from(from.children);
    morph(
      from,
      el(
        `<div><p data-id="c">C2</p><p data-id="a">A</p><p data-id="b">B</p></div>`,
      ),
      { key: (node) => node.getAttribute("data-id") },
    );
    expect(Array.from(from.children)).toEqual([c, a, b]);
    expect(c?.textContent).toBe("C2");
    expect(a?.textContent).toBe("A");
    expect(b?.textContent).toBe("B");
  });

  it("does not steal a keyed node for a different key", () => {
    const from = el(`<div><p data-id="a">A</p></div>`);
    const a = from.firstElementChild;
    morph(from, el(`<div><p data-id="z">Z</p></div>`), {
      key: (node) => node.getAttribute("data-id"),
    });
    expect(from.firstElementChild).not.toBe(a);
    expect(from.textContent).toBe("Z");
  });

  it("syncs form values but never the focused element", () => {
    const from = el(`<form><input value="old"><input value="keep"></form>`);
    const [first, second] = Array.from(
      from.querySelectorAll("input"),
    ) as HTMLInputElement[];
    (first as HTMLInputElement).value = "typed";
    document.body.append(from);
    (second as HTMLInputElement).value = "user-typing";
    second?.focus();
    morph(from, el(`<form><input value="new"><input value="new2"></form>`));
    expect(first?.value).toBe("new");
    expect(second?.value).toBe("user-typing");
    from.remove();
  });

  it("adopts (not corrupts) a keyed element whose tag changed", () => {
    const key = (element: Element): string | null =>
      element.getAttribute("data-key");
    const from = el(`<div><span data-key="a">old</span></div>`);
    morph(from, el(`<div><p data-key="a">new</p></div>`), { key });
    expect(from.children).toHaveLength(1);
    expect(from.innerHTML).toBe(`<p data-key="a">new</p>`);
  });

  it("a removed keyed node does not block reuse of later siblings", () => {
    const key = (element: Element): string | null =>
      element.getAttribute("data-key");
    const from = el(
      `<div><section data-key="gone">x</section><article>keep</article></div>`,
    );
    const kept = from.querySelector("article");
    morph(from, el(`<div><article>keep</article></div>`), { key });
    expect(from.querySelector("article")).toBe(kept); // identity preserved
    expect(from.children).toHaveLength(1);
  });

  it("never unchecks a focused radio through its group sibling", () => {
    const from = el(
      `<form><input type="radio" name="g" id="r1"><input type="radio" name="g" id="r2"></form>`,
    );
    document.body.append(from);
    const r1 = from.querySelector("#r1") as HTMLInputElement;
    r1.checked = true;
    r1.focus();
    morph(
      from,
      el(
        `<form><input type="radio" name="g" id="r1"><input type="radio" name="g" id="r2" checked></form>`,
      ),
    );
    expect(r1.checked).toBe(true); // the user's in-progress choice wins
    from.remove();
  });

  it("syncs multi-select selection per option", () => {
    const from = el(
      `<select multiple><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>`,
    ) as HTMLSelectElement;
    const to = el(
      `<select multiple><option value="a">a</option><option value="b">b</option><option value="c">c</option></select>`,
    ) as HTMLSelectElement;
    (to.options[1] as HTMLOptionElement).selected = true;
    (to.options[2] as HTMLOptionElement).selected = true;
    morph(from, to);
    const selected = Array.from(from.options)
      .filter((option) => option.selected)
      .map((option) => option.value);
    expect(selected).toEqual(["b", "c"]);
  });

  it("throws on duplicate keys, like list()/each()", () => {
    const key = (element: Element): string | null =>
      element.getAttribute("data-key");
    const dupOld = el(`<div><i data-key="x"></i><i data-key="x"></i></div>`);
    expect(() => morph(dupOld, el(`<div></div>`), { key })).toThrow(
      /Duplicate morph key/,
    );
    const from = el(`<div></div>`);
    const dupNew = el(`<div><i data-key="x"></i><i data-key="x"></i></div>`);
    expect(() => morph(from, dupNew, { key })).toThrow(/Duplicate morph key/);
  });

  it("skip: leaves matched elements untouched and keeps unmatched ones", () => {
    const skip = (element: Element): boolean =>
      element.hasAttribute("data-morph-ignore");
    // matched skipped element: content and attributes stay as-is
    const from = el(
      `<div><pre data-morph-ignore class="hl"><span>enhanced</span></pre><p>a</p></div>`,
    );
    const pre = from.querySelector("pre");
    morph(from, el(`<div><pre data-morph-ignore>plain</pre><p>b</p></div>`), {
      skip,
    });
    expect(from.querySelector("pre")).toBe(pre);
    expect(pre?.className).toBe("hl"); // untouched
    expect(pre?.innerHTML).toBe("<span>enhanced</span>");
    expect(from.querySelector("p")?.textContent).toBe("b");

    // unmatched skipped element (an injected streaming cursor): kept, not removed
    const host = el(`<div><p>text</p><span data-morph-ignore>▍</span></div>`);
    morph(host, el(`<div><p>text more</p></div>`), { skip });
    expect(host.querySelector("span")?.textContent).toBe("▍");
    expect(host.querySelector("p")?.textContent).toBe("text more");
  });
});
