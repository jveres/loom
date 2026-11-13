import {
  escapeText,
  html,
  renderToString,
  serializeAttributes,
} from "loom/html";
import { jsx, jsxs } from "loom/html/jsx-runtime";
import { describe, test } from "vitest";

const benchGlobal = globalThis as typeof globalThis & {
  __loomBenchmarkSink?: unknown;
};

const cleanTexts = Array.from(
  { length: 200 },
  (_, index) =>
    `Row #${index + 1} — steady telemetry sample (${(index * 1.37).toFixed(2)} ms)`,
);

const mixedTexts = Array.from({ length: 200 }, (_, index) =>
  index % 4 === 0
    ? `Alert <node-${index}>: "threshold" & 'drift' > 95%`
    : (cleanTexts[index] as string),
);

const rows = Array.from({ length: 200 }, (_, index) => ({
  id: `row-${index}`,
  label: mixedTexts[index] as string,
  href: `/nodes/${index}?tab=metrics`,
  active: index % 3 === 0,
  warn: index % 7 === 0,
  score: (index * 17) % 100,
}));

describe("html serialization", () => {
  test("escapeText x200 clean strings", async ({ bench }) => {
    await bench("escapeText x200 clean strings", () => {
      let total = 0;
      for (let index = 0; index < cleanTexts.length; index++) {
        total += escapeText(cleanTexts[index] as string).length;
      }
      benchGlobal.__loomBenchmarkSink = total;
    }).run();
  });

  test("escapeText x200 mixed entity strings", async ({ bench }) => {
    await bench("escapeText x200 mixed entity strings", () => {
      let total = 0;
      for (let index = 0; index < mixedTexts.length; index++) {
        total += escapeText(mixedTexts[index] as string).length;
      }
      benchGlobal.__loomBenchmarkSink = total;
    }).run();
  });

  test("serializeAttributes x200 rich attribute bags", async ({ bench }) => {
    await bench("serializeAttributes x200 rich attribute bags", () => {
      let total = 0;
      for (let index = 0; index < rows.length; index++) {
        const row = rows[index] as (typeof rows)[number];
        total += serializeAttributes({
          id: row.id,
          href: row.href,
          className: {
            "metric-row": true,
            "is-active": row.active,
            "is-warn": row.warn,
          },
          style: {
            "--score": `${row.score}%`,
            opacity: row.active ? 1 : 0.72,
          },
          "aria-selected": row.active,
          disabled: false,
        }).length;
      }
      benchGlobal.__loomBenchmarkSink = total;
    }).run();
  });

  test("html tagged template: 200-row table", async ({ bench }) => {
    await bench("html tagged template: 200-row table", () => {
      const out = renderToString(
        html`<table class="metrics-grid"><tbody>${rows.map(
          (row) =>
            html`<tr id="${row.id}" data-score="${row.score}"><td><a href="${row.href}">${row.label}</a></td><td>${row.score}%</td></tr>`,
        )}</tbody></table>`,
      );
      benchGlobal.__loomBenchmarkSink = out.length;
    }).run();
  });

  test("html jsx-runtime: 200-card dashboard", async ({ bench }) => {
    await bench("html jsx-runtime: 200-card dashboard", () => {
      const out = renderToString(
        jsx("section", {
          className: "dashboard-grid",
          children: rows.map((row) =>
            jsxs("article", {
              id: row.id,
              className: {
                card: true,
                "card--active": row.active,
                "card--warn": row.warn,
              },
              style: {
                "--bar": `${row.score}%`,
                transform: "translate3d(0,0,0)",
              },
              "aria-busy": false,
              children: [
                jsx("a", {
                  href: row.href,
                  className: "card__title",
                  children: row.label,
                }),
                jsxs("span", {
                  className: "card__value",
                  children: [row.score, "%"],
                }),
              ],
            }),
          ),
        }),
      );
      benchGlobal.__loomBenchmarkSink = out.length;
    }).run();
  });
});
