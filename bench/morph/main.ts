// Morph engine bench: Idiomorph vs loom morph on the streaming-markdown
// workload, each in two modes — "full" (morph the whole document per chunk)
// and "skip" (markdown-viewer's per-block hash layer decides which top-level
// block changed; the engine morphs only that block). Results go to #results
// and machine-readable JSON to #results-json.
import { Idiomorph } from "idiomorph";
import { morph } from "loom/dom";
import { buildChunkStates } from "./workload.js";

const BLOCKS = 50; // 150 chunk states
const WARMUP = 1;
const RUNS = 5;

type Engine = (container: HTMLElement, html: string) => void;

// djb2, as in markdown-viewer's hash-skip layer.
function hash(text: string): number {
  let value = 5381;
  for (let i = 0; i < text.length; i++) {
    value = ((value << 5) + value) ^ text.charCodeAt(i);
  }
  return value >>> 0;
}

const idiomorphFull: Engine = (container, html) => {
  Idiomorph.morph(container, html, { morphStyle: "innerHTML" });
};

const loomFull: Engine = (container, html) => {
  // same tag as the live container — loom's morph replaces the root on a tag mismatch
  const temp = document.createElement("article");
  temp.innerHTML = html;
  morph(container, temp);
};

// markdown-viewer's streaming layer, engine-agnostic: hash top-level blocks,
// hand only the changed one(s) to the engine. `blockMorph` patches one
// existing block to match its replacement.
function skipLayer(blockMorph: (old: Element, next: Element) => void): Engine {
  const hashes = new WeakMap<HTMLElement, number[]>();
  return (container, html) => {
    const temp = document.createElement("div");
    temp.innerHTML = html;
    const previous = hashes.get(container) ?? [];
    const nextHashes: number[] = [];
    const newChildren = Array.from(temp.children);
    for (let i = 0; i < newChildren.length; i++) {
      const next = newChildren[i] as Element;
      const digest = hash(next.outerHTML);
      nextHashes.push(digest);
      const old = container.children[i];
      if (!old) {
        container.appendChild(next);
      } else if (previous[i] !== digest) {
        blockMorph(old, next);
      }
    }
    while (container.children.length > newChildren.length) {
      container.lastElementChild?.remove();
    }
    hashes.set(container, nextHashes);
  };
}

const idiomorphSkip: Engine = skipLayer((old, next) => {
  Idiomorph.morph(old, next, { morphStyle: "outerHTML" });
});

const loomSkip: Engine = skipLayer((old, next) => {
  morph(old, next);
});

// The migration shape: skip-layer + a protected streaming cursor injected by an "enhancer" after
// every chunk (markdown-viewer's data-morph-ignore contract) — the cursor must survive each morph.
const protectCursor = (element: Element): boolean =>
  element.hasAttribute("data-morph-ignore");
const loomSkipCursor: Engine = (container, html) => {
  skipLayerCursor(container, html);
  // the enhancer keeps the caret inside the tail block, as a streaming UI does;
  // the engine's skip option must carry it through every morph of that block
  const cursor =
    container.querySelector("[data-morph-ignore]") ??
    (() => {
      const caret = document.createElement("span");
      caret.setAttribute("data-morph-ignore", "");
      caret.textContent = "\u258d";
      return caret;
    })();
  const tail = container.lastElementChild;
  if (tail && cursor.parentElement !== tail) tail.append(cursor);
};
const skipLayerCursor: Engine = skipLayer((old, next) => {
  morph(old, next, { skip: protectCursor });
});

const engines: Array<{ name: string; run: Engine; cursor?: boolean }> = [
  { name: "idiomorph full", run: idiomorphFull },
  { name: "loom full", run: loomFull },
  { name: "idiomorph + skip-layer", run: idiomorphSkip },
  { name: "loom + skip-layer", run: loomSkip },
  { name: "loom + skip-layer + cursor", run: loomSkipCursor, cursor: true },
];

function runEngine(engine: Engine, states: string[], cursor = false): number {
  const arena = document.getElementById("arena") as HTMLElement;
  const container = document.createElement("article");
  arena.replaceChildren(container);
  const start = performance.now();
  for (const state of states) engine(container, state);
  const total = performance.now() - start;
  // correctness gate: the final DOM must match the final state verbatim (the
  // cursor variant must ALSO have kept its protected cursor alive)
  if (cursor) {
    const kept = container.querySelector("[data-morph-ignore]");
    if (!kept) throw new Error("protected cursor was destroyed");
    kept.remove();
  }
  const expected = document.createElement("article");
  expected.innerHTML = states[states.length - 1] as string;
  if (container.innerHTML !== expected.innerHTML) {
    throw new Error("engine produced wrong final DOM");
  }
  arena.replaceChildren();
  return total;
}

function median(samples: number[]): number {
  const sorted = samples.slice().sort((a, b) => a - b);
  return sorted[sorted.length >> 1] as number;
}

async function runAll(): Promise<void> {
  const status = document.getElementById("status") as HTMLElement;
  const states = buildChunkStates(BLOCKS);
  const results: Array<{ name: string; medianMs: number }> = [];
  for (const { name, run, cursor } of engines) {
    status.textContent = `running ${name}…`;
    await new Promise((resolve) => setTimeout(resolve, 30));
    const samples: number[] = [];
    for (let i = 0; i < WARMUP + RUNS; i++) {
      const ms = runEngine(run, states, cursor);
      if (i >= WARMUP) samples.push(ms);
    }
    results.push({ name, medianMs: median(samples) });
  }
  status.textContent = "done";
  (document.getElementById("results") as HTMLElement).innerHTML =
    `<table border="1" cellpadding="4"><tr><th>engine (median ms, ${states.length} chunks × ${RUNS} runs)</th><th>total</th><th>per chunk</th></tr>${results
      .map(
        (r) =>
          `<tr><td>${r.name}</td><td>${r.medianMs.toFixed(1)}</td><td>${(r.medianMs / states.length).toFixed(3)}</td></tr>`,
      )
      .join("")}</table>`;
  (document.getElementById("results-json") as HTMLElement).textContent =
    JSON.stringify(results);
}

(document.getElementById("run") as HTMLButtonElement).addEventListener(
  "click",
  () =>
    void runAll().catch((error) => {
      (document.getElementById("status") as HTMLElement).textContent =
        `ERROR: ${error}`;
    }),
);
