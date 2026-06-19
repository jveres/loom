// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { state } from "./loom.js";

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
});
