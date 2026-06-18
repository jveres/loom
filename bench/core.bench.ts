// @vitest-environment happy-dom
import { bench, describe } from "vitest";
import { classed, effect, flush, h, list, state, text } from "../src/loom.js";

describe("core", () => {
  bench("10k state writes to one text binding", () => {
    const model = state({ count: 0 });
    text(() => model.count);
    for (let i = 0; i < 10_000; i++) model.count = i;
    flush();
  });

  bench("1k independent effects", () => {
    const model = state({ count: 0 });
    for (let i = 0; i < 1_000; i++) effect(() => void model.count);
    model.count++;
    flush();
  });

  bench("create and reconcile 1k keyed rows", () => {
    const rows = Array.from({ length: 1_000 }, (_, id) =>
      state({ id, label: `row ${id}`, selected: false }),
    );
    const box = h("div");
    list(box, rows, {
      key: (row) => row.id,
      render: (row) =>
        h(
          "p",
          { class: classed("selected", () => row.selected) },
          text(() => row.label),
        ),
    });
    list(box, rows.slice().reverse(), {
      key: (row) => row.id,
      render: (row) =>
        h(
          "p",
          null,
          text(() => row.label),
        ),
    });
  });
});
