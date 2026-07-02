// Comparative DOM bench (stage 0 of docs/architecture-v2.md): the same krausest-style ops driven
// through every implementation's identical command surface. Results render into #results as a
// table plus machine-readable JSON in #results-json (scraped by tooling).
import { buildRows, type Impl, resetIds } from "./data.js";
import { arrowImpl } from "./impl-arrow.js";
import { loomImpl } from "./impl-loom.js";
import { shablonImpl } from "./impl-shablon.js";
import { vanillaImpl } from "./impl-vanilla.js";

const WARMUP = 3;
const RUNS = 10;

const factories: Array<() => Impl> = [
  vanillaImpl,
  loomImpl,
  arrowImpl,
  shablonImpl,
];

interface OpResult {
  op: string;
  medianMs: number;
}

const settle = (): Promise<void> =>
  new Promise((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

// Measure the op's own cost: sync work + the framework's microtask flush (arrow/shablon batch
// there; loom/vanilla are already done) + a forced synchronous layout. Waiting for paint instead
// would floor every sub-frame op at the display's frame cadence (~33 ms for a double-rAF), hiding
// exactly the differences this harness exists to show.
async function measure(fn: () => void): Promise<number> {
  const arena = document.getElementById("arena") as HTMLElement;
  const start = performance.now();
  fn();
  await Promise.resolve();
  await Promise.resolve(); // second hop: batches queued from within the first flush
  void arena.offsetHeight; // force style/layout so DOM-size differences land inside the window
  return performance.now() - start;
}

function median(samples: number[]): number {
  const sorted = samples.slice().sort((a, b) => a - b);
  return sorted[sorted.length >> 1] as number;
}

// One op measured WARMUP+RUNS times; each iteration rebuilds the precondition unmeasured.
async function bench(
  op: string,
  precondition: () => void,
  action: () => void,
): Promise<OpResult> {
  const samples: number[] = [];
  for (let i = 0; i < WARMUP + RUNS; i++) {
    precondition();
    await settle();
    const ms = await measure(action);
    if (i >= WARMUP) samples.push(ms);
  }
  return { op, medianMs: median(samples) };
}

async function runImpl(factory: () => Impl): Promise<{
  name: string;
  results: OpResult[];
}> {
  const arena = document.getElementById("arena") as HTMLElement;
  arena.replaceChildren();
  resetIds();
  const impl = factory();
  impl.mount(arena);
  await settle();

  const results: OpResult[] = [];
  results.push(
    await bench(
      "create-1k",
      () => impl.clear(),
      () => impl.create(buildRows(1000)),
    ),
  );
  results.push(
    await bench(
      "update-1k(10th)",
      () => impl.create(buildRows(1000)),
      () => impl.update(),
    ),
  );
  results.push(
    await bench(
      "swap-1k",
      () => impl.create(buildRows(1000)),
      () => impl.swap(),
    ),
  );
  results.push(
    await bench(
      "clear-1k",
      () => impl.create(buildRows(1000)),
      () => impl.clear(),
    ),
  );
  results.push(
    await bench(
      "create-10k",
      () => impl.clear(),
      () => impl.create(buildRows(10000)),
    ),
  );
  impl.destroy();
  arena.replaceChildren();
  return { name: impl.name, results };
}

async function runAll(): Promise<void> {
  const status = document.getElementById("status") as HTMLElement;
  const all: Array<{ name: string; results: OpResult[] }> = [];
  for (const factory of factories) {
    status.textContent = `running ${factory().name}…`;
    all.push(await runImpl(factory));
  }
  status.textContent = "done";

  const ops = all[0]?.results.map((r) => r.op) ?? [];
  let htmlOut =
    "<table border='1' cellpadding='4'><tr><th>op (median ms)</th>" +
    all.map((a) => `<th>${a.name}</th>`).join("") +
    "</tr>";
  for (const [i, op] of ops.entries()) {
    htmlOut += `<tr><td>${op}</td>${all
      .map((a) => `<td>${a.results[i]?.medianMs.toFixed(2)}</td>`)
      .join("")}</tr>`;
  }
  htmlOut += "</table>";
  (document.getElementById("results") as HTMLElement).innerHTML = htmlOut;
  (document.getElementById("results-json") as HTMLElement).textContent =
    JSON.stringify(all);
}

(document.getElementById("run") as HTMLButtonElement).addEventListener(
  "click",
  () => void runAll(),
);
