import { unsafeHtml, withRootAttributes } from "loom/html";
import { describe, expect, it } from "vitest";

describe("withRootAttributes", () => {
  it('splices serialized attributes into the root tag; nullish drops; presence renders =""; children untouched', () => {
    const out = withRootAttributes(
      unsafeHtml('<section class="x"><p data-a="1">t</p></section>'),
      { "data-b": "2 & 3", "data-mark": "", "data-none": null },
    );
    expect(out.value).toBe(
      '<section class="x" data-b="2 &amp; 3" data-mark=""><p data-a="1">t</p></section>',
    );
  });
  it("merges named attributes with the joiner — the new value lands after the old", () => {
    const out = withRootAttributes(
      unsafeHtml('<div style="color: red" class="a">x</div>'),
      { style: "--k: 1", class: "b" },
      { merge: { style: "; ", class: " " } },
    );
    expect(out.value).toBe(
      '<div style="color: red; --k: 1" class="a b">x</div>',
    );
  });
  it("a merge name absent from the root serializes fresh; a rootless value throws", () => {
    const out = withRootAttributes(
      unsafeHtml("<div>x</div>"),
      { style: "--k: 1" },
      { merge: { style: "; " } },
    );
    expect(out.value).toBe('<div style="--k: 1">x</div>');
    expect(() => withRootAttributes(unsafeHtml("plain"), { a: "1" })).toThrow();
  });
});
describe("withRootAttributes — the merge key is escaped as a literal", () => {
  it("a merge name with a regex metacharacter merges its own attribute, never a lookalike", () => {
    const out = withRootAttributes(
      unsafeHtml('<i data-x.y="1" data-xzy="2">t</i>'),
      { "data-x.y": "3" },
      { merge: { "data-x.y": " " } },
    );
    expect(out.value).toBe('<i data-x.y="1 3" data-xzy="2">t</i>');
  });
});
