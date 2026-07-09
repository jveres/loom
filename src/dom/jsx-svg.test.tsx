// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { state } from "../loom.js";
import { svgElement } from "./index.js";

const SVG_NS = "http://www.w3.org/2000/svg";

describe("JSX SVG", () => {
  it("builds namespaced SVG trees from JSX", () => {
    const svg = (
      <svg
        viewBox="0 0 24 24"
        width={24}
        height={24}
        role="img"
        aria-label="icon"
      >
        <defs>
          <linearGradient id="grad" x1={0} y1={0} x2={0} y2={1}>
            <stop offset="0" stop-opacity={0.2} />
          </linearGradient>
        </defs>
        <g class="layer">
          <circle cx={12} cy={12} r={8} stroke-width={2} />
        </g>
      </svg>
    );

    expect(svg.namespaceURI).toBe(SVG_NS);
    expect(svg.getAttribute("viewBox")).toBe("0 0 24 24");
    const circle = svg.querySelector("circle");
    expect(circle?.namespaceURI).toBe(SVG_NS);
    expect(circle?.getAttribute("stroke-width")).toBe("2");
    expect(svg.querySelector("g")?.getAttribute("class")).toBe("layer");
  });

  it("supports reactive SVG attribute bindings from JSX", () => {
    const dash = state("0 100");
    const svg = (
      <svg viewBox="0 0 88 88" role="img" aria-label="gauge">
        <circle cx={44} cy={44} r={34} stroke-dasharray={() => dash()} />
      </svg>
    );
    const circle = svg.querySelector("circle");
    expect(circle?.getAttribute("stroke-dasharray")).toBe("0 100");
    dash("50 100");
    expect(circle?.getAttribute("stroke-dasharray")).toBe("50 100");
  });

  it("creates shared HTML/SVG tag names with an explicit SVG namespace", () => {
    const label = state("first");
    const clicked = vi.fn();
    const svg = svgElement("svg", null, [
      svgElement("title", { "data-label": () => label() }, "A title"),
      svgElement(
        "a",
        {
          href: "#target",
          onClick: (_event: MouseEvent) => clicked(),
        },
        svgElement("title", null, "Link title"),
      ),
      svgElement("style", null, "circle { fill: red; }"),
      svgElement("script", { type: "application/ecmascript" }),
    ]);

    for (const selector of ["title", "a", "style", "script"]) {
      expect(svg.querySelector(selector)?.namespaceURI).toBe(SVG_NS);
    }
    const title = svg.querySelector("title");
    expect(title?.getAttribute("data-label")).toBe("first");
    label("second");
    expect(title?.getAttribute("data-label")).toBe("second");
    svg.querySelector("a")?.dispatchEvent(new MouseEvent("click"));
    expect(clicked).toHaveBeenCalledTimes(1);
  });

  it("keeps shared names HTML outside SVG and below foreignObject", () => {
    const htmlTitle = <title>Document title</title>;
    const svg = (
      <svg aria-label="foreign content">
        <foreignObject>
          <a href="#html">HTML link</a>
        </foreignObject>
      </svg>
    );
    expect(htmlTitle.namespaceURI).not.toBe(SVG_NS);
    expect(svg.querySelector("a")?.namespaceURI).not.toBe(SVG_NS);
  });

  it("contextually types lowercase and camelCase event props", () => {
    const input = (
      <input
        oninput={(event) => {
          const value: string = event.currentTarget.value;
          const inputEvent: InputEvent = event;
          void value;
          void inputEvent;
        }}
        onInput={(event) => {
          const value: string = event.currentTarget.value;
          const inputEvent: InputEvent = event;
          void value;
          void inputEvent;
        }}
        onPointerDown={(event) => {
          const pointerEvent: PointerEvent = event;
          void pointerEvent;
        }}
      />
    );
    expect(input.tagName).toBe("INPUT");
  });

  it("types every HTMLElementTagNameMap tag and only runtime-supported SVG tags", () => {
    // Derived IntrinsicElements: tags never hand-listed before now compile with
    // precise element types (this test's value is the typecheck itself).
    const dialog = <dialog open />;
    const canvas = <canvas width={8} height={8} />;
    const details = (
      <details>
        <summary>more</summary>
      </details>
    );
    expect(dialog.tagName).toBe("DIALOG");
    expect(canvas.tagName).toBe("CANVAS");
    expect(details.tagName).toBe("DETAILS");
    // An SVG tag absent from the runtime's SVG_TAG_LIST must NOT typecheck —
    // the runtime would create it in the wrong namespace.
    // @ts-expect-error `animate` is not a runtime-supported SVG tag
    const bad = <animate />;
    expect(bad).toBeDefined();
  });
});
