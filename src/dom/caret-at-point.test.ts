// @vitest-environment happy-dom

// Both engine channels behind one spelling: Gecko ships only
// caretPositionFromPoint, WebKit only caretRangeFromPoint, Chromium
// both — an editor trying one spelling silently falls to its
// fallback caret in the other engine (the seam rich-edit entry bug
// this was proposed from).

import { describe, expect, it } from "vitest";
import { caretAtPoint } from "./caret-at-point.js";

const node = document.createTextNode("seat");

const docWith = (channels: object): Document =>
  Object.assign(document.implementation.createHTMLDocument(), channels);

describe("caretAtPoint", () => {
  it("prefers the position channel (Gecko/Chromium)", () => {
    const doc = docWith({
      caretPositionFromPoint: () => ({ offsetNode: node, offset: 2 }),
      caretRangeFromPoint: () => {
        throw new Error("never reached");
      },
    });
    expect(caretAtPoint(doc, 1, 1)).toEqual({ node, offset: 2 });
  });

  it("falls back to the range channel (WebKit)", () => {
    const doc = docWith({
      caretRangeFromPoint: () => ({ startContainer: node, startOffset: 3 }),
    });
    expect(caretAtPoint(doc, 1, 1)).toEqual({ node, offset: 3 });
  });

  it("a miss or a channel-less document yields undefined", () => {
    expect(
      caretAtPoint(docWith({ caretPositionFromPoint: () => null }), 1, 1),
    ).toBeUndefined();
    expect(caretAtPoint(docWith({}), 1, 1)).toBeUndefined();
  });
});
