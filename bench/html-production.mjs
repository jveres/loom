// Measure the built SSR ESM entrypoints without Vitest's source-module instrumentation.
// Run once per checkout: node bench/html-production.mjs [path/to/dist/loom]
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const distDir = resolve(process.argv[2] ?? "dist/loom");
const { escapeText, html, renderToString, serializeAttributes } = await import(
  pathToFileURL(resolve(distDir, "html.js"))
);
const { jsx, jsxs } = await import(
  pathToFileURL(resolve(distDir, "html/jsx-runtime.js"))
);

const cleanTexts = Array.from(
  { length: 200 },
  (_, index) =>
    `Row #${index + 1} — steady telemetry sample (${(index * 1.37).toFixed(2)} ms)`,
);

const mixedTexts = Array.from({ length: 200 }, (_, index) =>
  index % 4 === 0
    ? `Alert <node-${index}>: "threshold" & 'drift' > 95%`
    : cleanTexts[index],
);

const rows = Array.from({ length: 200 }, (_, index) => ({
  id: `row-${index}`,
  label: mixedTexts[index],
  href: `/nodes/${index}?tab=metrics`,
  active: index % 3 === 0,
  warn: index % 7 === 0,
  score: (index * 17) % 100,
}));

const cases = {
  "escapeText/200-clean": () => {
    let total = 0;
    for (let i = 0; i < cleanTexts.length; i++) {
      total += escapeText(cleanTexts[i]).length;
    }
    return total;
  },
  "escapeText/200-mixed": () => {
    let total = 0;
    for (let i = 0; i < mixedTexts.length; i++) {
      total += escapeText(mixedTexts[i]).length;
    }
    return total;
  },
  "serializeAttributes/200-rich": () => {
    let total = 0;
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
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
    return total;
  },
  "html-template/200-rows": () =>
    renderToString(
      html`<table class="metrics-grid"><tbody>${rows.map(
        (row) =>
          html`<tr id="${row.id}" data-score="${row.score}"><td><a href="${row.href}">${row.label}</a></td><td>${row.score}%</td></tr>`,
      )}</tbody></table>`,
    ).length,
  "html-jsx/200-cards": () =>
    renderToString(
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
    ).length,
};

let sink = 0;
const results = [];
for (const [name, run] of Object.entries(cases)) {
  for (let i = 0; i < 60; i++) sink ^= run();
  const times = [];
  for (let sample = 0; sample < 21; sample++) {
    await new Promise((resolveDone) => setTimeout(resolveDone, 0));
    const start = performance.now();
    for (let i = 0; i < 50; i++) sink ^= run();
    times.push((performance.now() - start) / 50);
  }
  times.sort((a, b) => a - b);
  results.push({
    name,
    medianMs: times[10],
    minMs: times[0],
    maxMs: times[20],
  });
}
globalThis.__loomHtmlSink = sink;
console.log(
  JSON.stringify({ node: process.version, distDir, results }, null, 2),
);
