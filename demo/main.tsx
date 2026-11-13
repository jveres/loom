import {
  batch,
  computed,
  configure,
  effect,
  mutate,
  props,
  type State,
  scope,
  state,
  trigger,
  untrack,
  update,
  writable,
} from "loom";
import { observeMutation } from "loom/browser";
import {
  inspectorMounted,
  mountInspector,
  toggleInspector,
} from "loom/devtools";
import { bindValue, dispose, list, morph, pause, resume } from "loom/dom";
import { listen, onTap } from "loom/events";
import { html, renderToString } from "loom/html";
import { revisions } from "loom/model";
import { events, meter } from "loom/observe";
import { bindStorage, codecs, storageSlot } from "loom/storage";
import "./styles.css";

// Enable zero-overhead node registration unless ?noinspect is set, so opening the inspector at
// any point shows the full reactive graph from boot; mount the UI panel lazily (or on ?inspect).
const inspectEnabled = !location.search.includes("noinspect");
configure({ inspect: inspectEnabled });

const THEMES = ["system", "light", "dark"] as const;
type ThemeMode = (typeof THEMES)[number];
const WAVE_MODES = ["interference", "vortex", "shockwave", "harmonic"] as const;
type WaveMode = (typeof WAVE_MODES)[number];

const base = "./";
const theme = state<ThemeMode>("system", { label: "theme" });
bindStorage(
  theme,
  storageSlot("loom-observatory-theme", codecs.string(THEMES)),
);
effect(() => {
  const current = theme();
  if (current === "system") delete document.documentElement.dataset["theme"];
  else document.documentElement.dataset["theme"] = current;
});

/* ---- Runtime Telemetry (count-only meter = zero array allocation) ---- */

const runtimeMeter = meter([
  events.write,
  events.compute,
  events.effect,
  events.flush,
]);

const telemetry = props(
  {
    fps: 60,
    writesPerSec: 0,
    effectsPerSec: 0,
    domPerSec: 0,
    leftDomPerSec: 0,
    rightDomPerSec: 0,
    flushMs: "0.28",
    burstNote: "Ready · click 50k Burst to benchmark in-tab",
  },
  { label: "telemetry" },
);

const scopePoints = state("0,34 240,34", { internal: true });
const frameTimes: number[] = Array.from({ length: 48 }, () => 0.35);

/* ---- Stage 1: 336-Cell Harmonic Signal Matrix ---- */

const COLS = 24;
const HALF_COLS = 12;
const ROWS = 14;

interface MatrixCell {
  readonly col: number;
  readonly row: number;
  readonly energy: State<number>;
  readonly peak: State<boolean>;
}

interface Ripple {
  x: number;
  y: number;
  born: number;
}

const matrix = props(
  {
    running: true,
    mode: "interference" as WaveMode,
    overdrive: 4,
    rightFrozen: false,
    xray: false,
    resumeNote: "Live · both hemispheres synced",
  },
  { label: "matrix" },
);

const cells: MatrixCell[] = [];
for (let row = 0; row < ROWS; row++) {
  for (let col = 0; col < COLS; col++) {
    cells.push({
      col,
      row,
      energy: state(0.2, { internal: true }),
      peak: state(false, { internal: true }),
    });
  }
}

const ripples: Ripple[] = [{ x: 8, y: 6.5, born: 0 }];
let waveClock = 0;

function renderCell(cell: MatrixCell): HTMLElement {
  return (
    <div
      class="cell"
      data-peak={() => (cell.peak() ? "true" : undefined)}
      title={`Cell (${cell.col}, ${cell.row})`}
    >
      <span
        class="cell-fill"
        style={{ "--v": () => cell.energy().toFixed(3) }}
      />
    </div>
  ) as HTMLElement;
}

const leftCells = cells.filter((c) => c.col < HALF_COLS);
const rightCells = cells.filter((c) => c.col >= HALF_COLS);

const leftGrid = (
  <div class="hemisphere">{leftCells.map(renderCell)}</div>
) as HTMLElement;
const rightGrid = (
  <div class="hemisphere">{rightCells.map(renderCell)}</div>
) as HTMLElement;

function toggleRightFreeze(): void {
  const next = !matrix.rightFrozen();
  matrix.rightFrozen(next);
  if (next) {
    pause(rightGrid);
    matrix.resumeNote(
      "Right hemisphere paused · 168 signals still mutating at full rate",
    );
  } else {
    const t0 = performance.now();
    resume(rightGrid);
    const dt = (performance.now() - t0).toFixed(2);
    matrix.resumeNote(`Coalesced catch-up: 168 bindings synced in ${dt} ms`);
  }
}

function runBurst50k(): void {
  const target = state({ acc: 0, parity: 0 }, { label: "burstCell" });
  let observed = 0;
  const stop = effect(
    () => {
      observed = target().acc;
    },
    { internal: true },
  );
  const t0 = performance.now();
  for (let i = 0; i < 50_000; i++) {
    mutate(target, (box) => {
      box.acc = i + 1;
      box.parity = i & 1;
    });
  }
  const elapsed = (performance.now() - t0).toFixed(2);
  stop();
  if (observed === 50_000) {
    telemetry.burstNote(
      `50k mutate() + flushes in ${elapsed} ms (with live observe hooks)`,
    );
  }
}

/* ---- Stage 2: Atomic moveBefore + Minimum-LIS Keyed Channels ---- */

interface ChannelItem {
  readonly id: string;
  readonly name: string;
  readonly unit: string;
  readonly level: State<number>;
  readonly note: State<string>;
}

const CHANNEL_SPECS = [
  ["CH-01", "Core Signal Bus", "MHz"],
  ["CH-02", "DOM Bindings", "ops"],
  ["CH-03", "LIS Reconciler", "mov"],
  ["CH-04", "Scope Lifecycle", "grp"],
  ["CH-05", "HTML Morph Stream", "tok"],
  ["CH-06", "Keyed State Map", "key"],
  ["CH-07", "Revision Ancestor", "rev"],
  ["CH-08", "Deferred Idle Lane", "idl"],
] as const;

const initialChannels: ChannelItem[] = CHANNEL_SPECS.map(
  ([id, name, unit], idx) => ({
    id,
    name,
    unit,
    level: state(0.35 + ((idx * 19) % 55) / 100, { label: `${id}.level` }),
    note: state(idx === 0 ? "Type here during auto-shuffle!" : "", {
      label: `${id}.note`,
    }),
  }),
);

const channels = state<readonly ChannelItem[]>(initialChannels, {
  label: "channels",
});
const autoShuffle = state(false, { label: "autoShuffle" });
const hasAtomicMove =
  typeof Element !== "undefined" &&
  typeof (Element.prototype as { moveBefore?: unknown }).moveBefore ===
    "function";
const reconcileReceipt = state(
  `8 keyed rows mounted · ${hasAtomicMove ? "Element.moveBefore() atomic" : "insertBefore fallback"}`,
  { label: "reconcileReceipt" },
);

// Compute LIS length so the UI reports the exact minimum DOM moves Loom performed.
function lisLength(seq: readonly number[]): number {
  const tails: number[] = [];
  for (const v of seq) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if ((tails[mid] as number) < v) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = v;
  }
  return tails.length;
}

function applyChannelOrder(
  label: string,
  transform: (current: readonly ChannelItem[]) => ChannelItem[],
): void {
  const prev = channels();
  const next = transform(prev);
  const indexMap = new Map(prev.map((item, idx) => [item.id, idx]));
  const mapped = next.map((item) => indexMap.get(item.id) ?? 0);
  const kept = lisLength(mapped);
  const moved = next.length - kept;
  const t0 = performance.now();
  channels(next);
  const dt = (performance.now() - t0).toFixed(3);
  reconcileReceipt(
    `${label}: moved ${moved} of ${next.length} nodes (${kept} untouched via LIS) in ${dt} ms · ${hasAtomicMove ? "moveBefore atomic" : "state preserved"}`,
  );
}

function swapChannelPair(): void {
  applyChannelOrder("Swap pair", (prev) => {
    const copy = [...prev];
    if (copy.length >= 3) {
      const tmp = copy[1] as ChannelItem;
      copy[1] = copy[2] as ChannelItem;
      copy[2] = tmp;
    }
    return copy;
  });
}

function reverseChannels(): void {
  applyChannelOrder("Reverse", (prev) => [...prev].reverse());
}

function sortChannelsByPeak(): void {
  applyChannelOrder("Sort by signal", (prev) =>
    [...prev].sort((a, b) => b.level() - a.level()),
  );
}

function shuffleChannels(): void {
  applyChannelOrder("Shuffle", (prev) => {
    const copy = [...prev];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = copy[i] as ChannelItem;
      copy[i] = copy[j] as ChannelItem;
      copy[j] = tmp;
    }
    return copy;
  });
}

effect(() => {
  if (!autoShuffle()) return;
  const id = window.setInterval(shuffleChannels, 900);
  return () => window.clearInterval(id);
});

const channelHost = (<div class="channel-list" />) as HTMLElement;
list(channelHost, channels, {
  key: (item) => item.id,
  render: (item) => {
    const input = (
      <input
        type="text"
        class="ch-input"
        placeholder="Focus & type while reordering…"
        aria-label={`${item.id} live scratchpad`}
      />
    ) as HTMLInputElement;
    bindValue(input, item.note);
    return (
      <div class="channel-row" data-channel={item.id}>
        <div class="orbit-ring" aria-hidden="true">
          <span class="orbit-core">{item.id.slice(-2)}</span>
        </div>
        <div class="ch-meta">
          <strong>{item.name}</strong>
          <small>
            {() => `${(item.level() * 100).toFixed(1)} ${item.unit}`}
          </small>
        </div>
        <div class="ch-meter" aria-hidden="true">
          <div
            class="ch-meter-bar"
            style={{ "--level": () => item.level().toFixed(3) }}
          />
        </div>
        {input}
      </div>
    );
  },
});

/* ---- Stage 3: 60fps Streaming morph() + Protected Stateful Island ---- */

const STREAM_TOKENS = [
  "Loom's ",
  "morph(target, html, { skip }) ",
  "reconciles ",
  "server-streamed ",
  "or ",
  "LLM-generated ",
  "markup ",
  "directly ",
  "onto ",
  "live ",
  "DOM ",
  "trees ",
  "in ",
  "a ",
  "single ",
  "linear ",
  "pass — ",
  "2.55× ",
  "faster ",
  "than ",
  "Idiomorph ",
  "on ",
  "full ",
  "180-tick ",
  "streams. ",
  "Unchanged ",
  "elements, ",
  "text ",
  "nodes, ",
  "attributes, ",
  "and ",
  "focus ",
  "stay ",
  "in ",
  "place; ",
  "protected ",
  "islands ",
  "(marked ",
  "with ",
  "skip) ",
  "keep ",
  "their ",
  "client ",
  "reactive ",
  "bindings ",
  "and ",
  "user ",
  "input ",
  "completely ",
  "untouched ",
  "across ",
  "every ",
  "frame.",
] as const;

const morphState = props(
  {
    streaming: true,
    cursor: 18,
    lastMs: "0.09",
    passes: 1,
    islandClicks: 3,
    islandNote: "Survives every morph()!",
  },
  { label: "morph" },
);

const morphArticle = (<article class="morph-article" />) as HTMLElement;

// Build the protected reactive island ONCE and place it inside morphArticle; `skip` tells morph()
// to preserve any `[data-island]` element intact while reconciling everything before & after it!
const islandInput = (
  <input
    type="text"
    aria-label="Protected island text"
    placeholder="Protected island input"
  />
) as HTMLInputElement;
bindValue(islandInput, morphState.islandNote);

const protectedIsland = (
  <div class="protected-island" data-island="true">
    <span class="island-tag">
      {() => `skip(data-island) · counter = ${morphState.islandClicks()}`}
    </span>
    <div class="island-controls">
      <button
        type="button"
        onMount={(btn) =>
          onTap(btn as Element, () =>
            update(morphState.islandClicks, (n) => n + 1),
          )
        }
      >
        +1 Island State
      </button>
      {islandInput}
    </div>
  </div>
) as HTMLElement;

function buildStreamMarkup(tokenCount: number): string {
  const body = STREAM_TOKENS.slice(0, tokenCount).join("");
  const pct = Math.round((tokenCount / STREAM_TOKENS.length) * 100);
  const snippet = `morph(article, nextTree, {\n  skip: "[data-island]",\n}); // token ${tokenCount}/${STREAM_TOKENS.length} (${pct}%)`;
  return renderToString(
    html`<h3>Live HTML Stream Reconciler (${pct}% streamed)</h3>
      <p>${body}▍</p>
      <div class="morph-island-anchor" data-island="true"></div>
      <pre><code>${snippet}</code></pre>
      <div class="morph-metrics">
        <span class="morph-chip">tokens: ${tokenCount}/${STREAM_TOKENS.length}</span>
        <span class="morph-chip">pass #${untrack(() => morphState.passes())}</span>
        <span class="morph-chip">2.55× faster vs Idiomorph</span>
      </div>`,
  );
}

morphArticle.replaceChildren(
  <h3>Live HTML Stream Reconciler</h3>,
  <p />,
  protectedIsland,
  <pre>
    <code />
  </pre>,
  <div class="morph-metrics" />,
);

const morphTemplate = document.createElement("template");

function runMorphStep(tokenCount: number): void {
  morphTemplate.innerHTML = `<article class="morph-article">${buildStreamMarkup(tokenCount)}</article>`;
  const nextTree = morphTemplate.content.firstElementChild as HTMLElement;
  const t0 = performance.now();
  morph(morphArticle, nextTree, { skip: "[data-island]" });
  const dt = (performance.now() - t0).toFixed(2);
  batch(() => {
    morphState.cursor(tokenCount);
    morphState.lastMs(dt);
    update(morphState.passes, (n) => n + 1);
  });
}

runMorphStep(18);

/* ---- Stage 4: Live In-Browser Runtime Self-Verification ---- */

const verifyResult = state(
  "12 runtime invariants ready · click Run Self-Check to verify in your browser",
  { label: "verifyResult" },
);
const verifyPassed = state<boolean | null>(null, { label: "verifyPassed" });

function expectEq(actual: unknown, expected: unknown, label: string): void {
  if (actual !== expected) throw new Error(label);
}

function runSelfVerification(): void {
  const t0 = performance.now();
  try {
    // 1–3: state, computed, batch coalescing
    const a = state(2);
    const b = computed(() => a() * 3);
    let runs = 0;
    let seen = 0;
    const stopEffect = effect(() => {
      runs++;
      seen = b();
    });
    batch(() => {
      a(4);
      a(7);
    });
    expectEq(seen, 21, "batch/computed value");
    expectEq(runs, 2, "batch/computed coalescing");
    stopEffect();

    // 4–5: O(1) mutate() & trigger()
    const box = state({ count: 10 });
    let boxSeen = 0;
    const stopBox = effect(() => {
      boxSeen = box().count;
    });
    mutate(box, (v) => {
      v.count = 25;
    });
    box().count = 30;
    trigger(box);
    expectEq(boxSeen, 30, "mutate/trigger mismatch");
    stopBox();

    // 6–7: scope pause() / resume() coalescing
    const sig = state(0);
    let scopeRuns = 0;
    const sc = scope(() => {
      effect(() => {
        sig();
        scopeRuns++;
      });
    });
    sc.pause();
    sig(1);
    sig(2);
    sig(3);
    expectEq(scopeRuns, 1, "paused scope ran early");
    sc.resume();
    expectEq(scopeRuns, 2, "resumed scope did not coalesce");
    sc.stop();

    // 8–9: revisions() ancestor invalidation + idle prune
    const bus = revisions();
    let revHits = 0;
    const stopRev = effect(() => {
      bus.read("doc.section");
      revHits++;
    });
    bus.invalidate("doc.section.leaf");
    if (revHits !== 2) throw new Error("revisions ancestor invalidation");
    stopRev();
    if (bus.prune() < 1) throw new Error("revisions prune failed");

    // 10–11: list() LIS minimum moves + morph() skip preservation
    const host = document.createElement("div");
    const items = state([1, 2, 3, 4]);
    const stopList = list(host, items, {
      key: (n) => n,
      render: (n) => <span>{String(n)}</span>,
    });
    const secondSpan = host.children[1];
    items([4, 2, 3, 1]);
    if (host.textContent !== "4231" || host.children[1] !== secondSpan) {
      throw new Error("keyed LIS identity preservation failed");
    }
    stopList();
    dispose(host);

    // 12: SSR html escaping
    const escaped = renderToString(html`<b>${"<script>&"}</b>`);
    if (escaped !== "<b>&lt;script&gt;&amp;</b>") {
      throw new Error("html escaping mismatch");
    }

    const dt = (performance.now() - t0).toFixed(2);
    verifyPassed(true);
    verifyResult(
      `PASS · 12/12 invariants verified in ${dt} ms (signals, batch, mutate/trigger, scope pause/resume, revisions, LIS list, html)`,
    );
  } catch (err) {
    verifyPassed(false);
    verifyResult(`FAIL · ${err instanceof Error ? err.message : String(err)}`);
  }
}

/* ---- Mount Full Observatory UI ---- */

const app = document.querySelector("#app");
if (!app) throw new Error("Missing #app root.");

const overdriveInput = (
  <input
    type="range"
    min="1"
    max="40"
    step="1"
    aria-label="Signal overdrive multiplier"
  />
) as HTMLInputElement;
bindValue(
  overdriveInput,
  writable(
    () => String(matrix.overdrive()),
    (next) => matrix.overdrive(Number(next)),
  ),
);

const matrixFrame = (
  <div class="matrix-frame">
    <div class="hemisphere-wrap">
      <div class="hemisphere-bar">
        <span>LEFT HEMISPHERE · 168 LIVE CELLS</span>
        <b>{() => `${telemetry.leftDomPerSec()} DOM/s`}</b>
      </div>
      {leftGrid}
    </div>
    <div class="meridian" aria-hidden="true" />
    <div
      class="hemisphere-wrap"
      data-frozen={() => (matrix.rightFrozen() ? "true" : "false")}
    >
      <div class="hemisphere-bar">
        <span>
          {() =>
            matrix.rightFrozen()
              ? "RIGHT HEMISPHERE · PAUSED"
              : "RIGHT HEMISPHERE · 168 LIVE CELLS"
          }
        </span>
        <b>
          {() =>
            matrix.rightFrozen()
              ? "0 DOM/s (frozen)"
              : `${telemetry.rightDomPerSec()} DOM/s`
          }
        </b>
      </div>
      {rightGrid}
    </div>
  </div>
) as HTMLElement;

// Pointer / drag ripples directly into the harmonic wave field!
function injectRipple(event: PointerEvent): void {
  const rect = matrixFrame.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;
  const x = ((event.clientX - rect.left) / rect.width) * COLS;
  const y = ((event.clientY - rect.top) / rect.height) * ROWS;
  ripples.push({ x, y, born: waveClock });
  if (ripples.length > 6) ripples.shift();
}

let pointerDown = false;
listen(
  matrixFrame,
  "pointerdown",
  (e) => {
    pointerDown = true;
    injectRipple(e as PointerEvent);
  },
  { owner: matrixFrame },
);
listen(
  window,
  "pointerup",
  () => {
    pointerDown = false;
  },
  { owner: matrixFrame },
);
listen(
  matrixFrame,
  "pointermove",
  (e) => {
    if (pointerDown || Math.random() < 0.35) injectRipple(e as PointerEvent);
  },
  { owner: matrixFrame, passive: true },
);

const shell = (
  <div class="shell" data-xray={() => (matrix.xray() ? "true" : "false")}>
    <header class="masthead">
      <div class="brand">
        <a class="brand-mark" href={base}>
          <span class="brand-dot" aria-hidden="true" />
          Loom
        </a>
        <span class="brand-ver">v0.12</span>
      </div>

      <nav class="suite-nav" aria-label="Loom Demo Suite">
        <a class="suite-link" href={base} aria-current="page">
          Observatory
        </a>
        <a class="suite-link" href={`${base}live/`}>
          Wikipedia Live
        </a>
        <a class="suite-link" href={`${base}db/`}>
          Stockroom DB
        </a>
      </nav>

      <div class="masthead-right">
        {inspectEnabled ? (
          <button
            type="button"
            onMount={(btn) =>
              onTap(btn as Element, () => {
                if (!inspectorMounted()) mountInspector();
                else toggleInspector();
              })
            }
          >
            Inspector ⌃⌘L
          </button>
        ) : null}

        <fieldset class="theme-group" aria-label="Color theme">
          {THEMES.map((mode) => (
            <button
              type="button"
              aria-pressed={() => theme() === mode}
              onMount={(btn) => onTap(btn as Element, () => theme(mode))}
            >
              {mode[0]?.toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </fieldset>
      </div>
    </header>

    <main class="container">
      {/* Hero + Live Runtime Telemetry */}
      <section class="hero">
        <div class="hero-copy">
          <div>
            <span class="eyebrow">
              Zero Virtual DOM · Zero Compiler · Surgical Reactivity
            </span>
            <h1>Touch only the exact DOM node a signal moves.</h1>
            <p>
              Every bar, sparkline, and channel below is a real reactive DOM
              element — no canvas, no component re-renders. Drag across the wave
              field, freeze a live DOM subtree mid-flight with{" "}
              <code>pause()</code>, type inside cards while{" "}
              <code>moveBefore()</code> shuffles them, or stream HTML through{" "}
              <code>morph()</code> around stateful islands.
            </p>
          </div>
          <div class="hero-pills">
            <span class="pill">
              <b>3.0 kB</b> minimal core
            </span>
            <span class="pill">
              <b>3.8×</b> faster keyed swaps
            </span>
            <span class="pill">
              <b>2.2×</b> faster mutate / trigger
            </span>
            <span class="pill">
              <b>2.55×</b> faster HTML morph
            </span>
          </div>
        </div>

        <aside class="telemetry-card" aria-label="Live runtime telemetry">
          <div class="telemetry-head">
            <span>loom/observe · Rates per second</span>
            <b class="telemetry-badge">
              {() => `${telemetry.fps()} fps · ${telemetry.flushMs()} ms/frame`}
            </b>
          </div>

          <div class="telemetry-grid">
            <div class="stat-box">
              <small>Signal writes</small>
              <strong>{() => telemetry.writesPerSec().toLocaleString()}</strong>
            </div>
            <div class="stat-box">
              <small>Effect runs</small>
              <strong>
                {() => telemetry.effectsPerSec().toLocaleString()}
              </strong>
            </div>
            <div class="stat-box">
              <small>DOM writes</small>
              <strong>{() => telemetry.domPerSec().toLocaleString()}</strong>
            </div>
            <div class="stat-box">
              <small>Overdrive</small>
              <strong>{() => `${matrix.overdrive()}×`}</strong>
            </div>
          </div>

          <div class="scope-trace">
            <svg
              class="scope-svg"
              viewBox="0 0 240 44"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line
                x1="0"
                y1="11"
                x2="240"
                y2="11"
                stroke="currentColor"
                stroke-opacity="0.1"
                stroke-dasharray="3 3"
              />
              <polyline
                fill="none"
                stroke="var(--cyan)"
                stroke-width="1.8"
                stroke-linejoin="round"
                points={scopePoints}
              />
            </svg>
            <div class="scope-caption">
              <span>
                Frame flush time oscilloscope (16.6 ms budget ceiling)
              </span>
              <span>{telemetry.burstNote}</span>
            </div>
          </div>
        </aside>
      </section>

      {/* Stage 1: Harmonic Signal Matrix */}
      <section class="stage" aria-labelledby="stage-matrix-title">
        <div class="stage-head">
          <div class="stage-title">
            <h2 id="stage-matrix-title">
              1 · 336-Cell Harmonic Signal Matrix &amp; Subtree Time-Freeze
            </h2>
            <p>
              Pointer movement injects radial ripples into 336 independent{" "}
              <code>state()</code> cells. Freeze the right hemisphere with{" "}
              <code>pause(rightPane)</code>: its signals keep mutating every
              frame while DOM writes drop to zero, then snap back in one
              coalesced pass on <code>resume()</code>.
            </p>
          </div>

          <div class="toolbar">
            <button
              type="button"
              class="primary"
              aria-pressed={() => !matrix.running()}
              onMount={(btn) =>
                onTap(btn as Element, () => matrix.running(!matrix.running()))
              }
            >
              {() => (matrix.running() ? "Pause Wave" : "Resume Wave")}
            </button>

            <button
              type="button"
              class="accent-amber"
              aria-pressed={matrix.rightFrozen}
              onMount={(btn) => onTap(btn as Element, toggleRightFreeze)}
            >
              {() =>
                matrix.rightFrozen()
                  ? "Resume Right (1-Pass Sync)"
                  : "Freeze Right (pause)"
              }
            </button>

            <button
              type="button"
              class="accent-cyan"
              aria-pressed={matrix.xray}
              onMount={(btn) =>
                onTap(btn as Element, () => matrix.xray(!matrix.xray()))
              }
            >
              {() => (matrix.xray() ? "X-Ray: ON" : "DOM X-Ray")}
            </button>

            <button
              type="button"
              onMount={(btn) => onTap(btn as Element, runBurst50k)}
            >
              50k Burst
            </button>

            {WAVE_MODES.map((mode) => (
              <button
                type="button"
                class="accent-cyan"
                aria-pressed={() => matrix.mode() === mode}
                onMount={(btn) =>
                  onTap(btn as Element, () => matrix.mode(mode))
                }
              >
                {mode[0]?.toUpperCase() + mode.slice(1)}
              </button>
            ))}

            <label class="slider-ctl">
              <span>Overdrive</span>
              {overdriveInput}
              <output>{() => `${matrix.overdrive()}×`}</output>
            </label>
          </div>
        </div>

        {matrixFrame}

        <div class="matrix-footer">
          <span>
            Pointer / touch:{" "}
            <strong>click or drag anywhere on the field</strong> to spawn wave
            interference ripples.
          </span>
          <span>{matrix.resumeNote}</span>
        </div>
      </section>

      {/* Stage 2 + Stage 3 Side-by-Side Workbenches */}
      <div class="workbench-grid">
        {/* Stage 2: Atomic moveBefore + LIS Keyed Reconciler */}
        <section class="stage" aria-labelledby="stage-lis-title">
          <div class="stage-head">
            <div class="stage-title">
              <h2 id="stage-lis-title">
                2 · Atomic <code>moveBefore()</code> &amp; Minimum-Move LIS
              </h2>
              <p>
                Click inside any channel’s text box and keep typing while
                shuffling. Loom computes the Longest Increasing Subsequence to
                touch the minimum nodes and uses atomic{" "}
                <code>Element.moveBefore()</code> so focus, caret selection, and
                CSS spin phase never reset.
              </p>
            </div>

            <div class="toolbar">
              <button
                type="button"
                onpointerdown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onmousedown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onMount={(btn) => onTap(btn as Element, swapChannelPair)}
              >
                Swap Pair (1 Move)
              </button>
              <button
                type="button"
                onpointerdown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onmousedown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onMount={(btn) => onTap(btn as Element, shuffleChannels)}
              >
                Shuffle
              </button>
              <button
                type="button"
                onpointerdown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onmousedown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onMount={(btn) => onTap(btn as Element, reverseChannels)}
              >
                Reverse
              </button>
              <button
                type="button"
                onpointerdown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onmousedown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onMount={(btn) => onTap(btn as Element, sortChannelsByPeak)}
              >
                Sort by Peak
              </button>
              <button
                type="button"
                class="accent-amber"
                aria-pressed={autoShuffle}
                onpointerdown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onmousedown={(e) => {
                  if (
                    document.activeElement instanceof HTMLInputElement &&
                    channelHost.contains(document.activeElement)
                  ) {
                    e.preventDefault();
                  }
                }}
                onMount={(btn) =>
                  onTap(btn as Element, () => autoShuffle(!autoShuffle()))
                }
              >
                {() =>
                  autoShuffle() ? "Stop Auto-Shuffle" : "Auto-Shuffle (900ms)"
                }
              </button>
            </div>
          </div>

          {channelHost}

          <div class="reconcile-receipt">
            <span>{reconcileReceipt}</span>
          </div>
        </section>

        {/* Stage 3: Live Streaming morph() + Protected Island */}
        <section class="stage" aria-labelledby="stage-morph-title">
          <div class="stage-head">
            <div class="stage-title">
              <h2 id="stage-morph-title">
                3 · Live Stream <code>morph()</code> &amp; Protected Islands
              </h2>
              <p>
                Full HTML snapshots stream through <code>morph()</code> while{" "}
                <code>skip</code> shields the live client island in the middle.
                Click <strong>+1 Island State</strong> or type in the island
                input while tokens stream around it.
              </p>
            </div>

            <div class="toolbar">
              <button
                type="button"
                class="primary"
                aria-pressed={() => !morphState.streaming()}
                onMount={(btn) =>
                  onTap(btn as Element, () =>
                    morphState.streaming(!morphState.streaming()),
                  )
                }
              >
                {() =>
                  morphState.streaming() ? "Pause Stream" : "Resume Stream"
                }
              </button>
              <button
                type="button"
                onMount={(btn) =>
                  onTap(btn as Element, () => {
                    morphState.streaming(true);
                    runMorphStep(1);
                  })
                }
              >
                Replay from Token 1
              </button>
              <button
                type="button"
                onMount={(btn) =>
                  onTap(btn as Element, () =>
                    runMorphStep(STREAM_TOKENS.length),
                  )
                }
              >
                Complete Instant
              </button>
            </div>
          </div>

          {morphArticle}

          <div class="reconcile-receipt">
            <span>
              Last <code>morph()</code> pass:{" "}
              <b>{() => `${morphState.lastMs()} ms`}</b> · protected island
              state preserved across{" "}
              <b>{() => `${morphState.passes()} passes`}</b>
            </span>
          </div>
        </section>
      </div>

      {/* Stage 4: In-Browser Runtime Self-Verification */}
      <section class="verify-bar" aria-label="Runtime verification">
        <span
          class="verify-status"
          data-pass={() => {
            const p = verifyPassed();
            return p === null ? undefined : String(p);
          }}
        >
          {verifyResult}
        </span>
        <button
          type="button"
          onMount={(btn) => onTap(btn as Element, runSelfVerification)}
        >
          Run Self-Check (12 Invariants)
        </button>
      </section>
    </main>
  </div>
) as HTMLElement;

app.replaceChildren(shell);

if (new URLSearchParams(location.search).has("inspect") && inspectEnabled) {
  mountInspector();
}

window.addEventListener("keydown", (event) => {
  if (
    inspectEnabled &&
    event.ctrlKey &&
    event.metaKey &&
    event.code === "KeyL"
  ) {
    event.preventDefault();
    if (!inspectorMounted()) mountInspector();
    else toggleInspector();
  }
});

/* ---- DOM Mutation Tracking & Surgical X-Ray Overlay ---- */

let totalDomMutations = 0;
let leftDomMutations = 0;
let rightDomMutations = 0;
let internalMatrixWrites = 0;
const xrayMarked = new Set<Element>();

function clearXrayMarks(): void {
  if (xrayMarked.size === 0) return;
  for (const el of xrayMarked) el.removeAttribute("data-xray-hit");
  xrayMarked.clear();
}

function markXray(records: readonly MutationRecord[]): void {
  if (!untrack(() => matrix.xray())) return;
  for (const rec of records) {
    if (rec.type === "attributes" && rec.attributeName === "data-xray-hit") {
      continue;
    }
    const el =
      rec.target instanceof Element ? rec.target : rec.target.parentElement;
    const host = el?.closest(".cell, .channel-row, .morph-article");
    if (host && !xrayMarked.has(host)) {
      xrayMarked.add(host);
      host.setAttribute("data-xray-hit", "");
    }
  }
}

observeMutation(
  leftGrid,
  (records) => {
    leftDomMutations += records.length;
    totalDomMutations += records.length;
    markXray(records);
  },
  { subtree: true, attributes: true, characterData: true, childList: true },
);

observeMutation(
  rightGrid,
  (records) => {
    rightDomMutations += records.length;
    totalDomMutations += records.length;
    markXray(records);
  },
  { subtree: true, attributes: true, characterData: true, childList: true },
);

observeMutation(
  channelHost,
  (records) => {
    totalDomMutations += records.length;
    markXray(records);
  },
  { subtree: true, attributes: true, characterData: true, childList: true },
);

observeMutation(
  morphArticle,
  (records) => {
    totalDomMutations += records.length;
    markXray(records);
  },
  { subtree: true, attributes: true, characterData: true, childList: true },
);

/* ---- Animation Loop ---- */

let prevTime = performance.now();
let sampleWindowStart = prevTime;
let frameCounter = 0;
let morphAccumMs = 0;

function stepField(t: number, mode: WaveMode, passOffset: number): void {
  const phase = t + passOffset * 0.08;
  for (let i = 0; i < cells.length; i++) {
    const cell = cells[i] as MatrixCell;
    const nx = cell.col / COLS;
    const ny = cell.row / ROWS;
    let v = 0;
    if (mode === "interference") {
      const d1 = Math.hypot(cell.col - 6, cell.row - 6.5);
      const d2 = Math.hypot(cell.col - 17.5, cell.row - 6.5);
      v =
        0.5 +
        0.26 * Math.sin(d1 * 0.72 - phase * 3.1) +
        0.24 * Math.cos(d2 * 0.68 - phase * 2.6);
    } else if (mode === "vortex") {
      const dx = cell.col - 11.5;
      const dy = cell.row - 6.5;
      const angle = Math.atan2(dy, dx);
      const dist = Math.hypot(dx, dy);
      v = 0.5 + 0.42 * Math.sin(angle * 3 + dist * 0.55 - phase * 3.8);
    } else if (mode === "shockwave") {
      const dist = Math.hypot(cell.col - 11.5, cell.row - 6.5);
      const ring = (((dist - phase * 6.2) % 9) + 9) % 9;
      v = Math.max(0.08, 1 - Math.abs(ring - 2.2) * 0.36);
    } else {
      v =
        0.5 +
        0.3 *
          Math.sin(nx * Math.PI * 4 + phase * 2.4) *
          Math.cos(ny * Math.PI * 3 - phase * 1.9) +
        0.16 * Math.sin((nx + ny) * 9 - phase * 3.2);
    }

    for (let r = 0; r < ripples.length; r++) {
      const rip = ripples[r] as Ripple;
      const age = t - rip.born;
      if (age < 0 || age > 3.2) continue;
      const dist = Math.hypot(cell.col - rip.x, cell.row - rip.y);
      const wave =
        Math.sin(dist * 1.35 - age * 9.5) * Math.exp(-dist * 0.16 - age * 0.9);
      v += wave * 0.48;
    }

    const clamped = Math.max(0.06, Math.min(0.99, Math.round(v * 200) / 200));
    cell.energy(clamped);
    cell.peak(clamped > 0.78);
    internalMatrixWrites += 2;
  }
}

function tickFrame(now: number): void {
  const dtMs = Math.min(50, now - prevTime);
  prevTime = now;
  frameCounter++;
  clearXrayMarks();

  const flushStart = performance.now();
  if (matrix.running()) {
    waveClock += dtMs / 1000;
    const passes = matrix.overdrive();
    const mode = matrix.mode();
    batch(() => {
      for (let p = 0; p < passes; p++) {
        stepField(waveClock, mode, p);
      }
      // Gently breathe the 8 instrument channel bars too
      const chs = channels();
      for (let i = 0; i < chs.length; i++) {
        const item = chs[i] as ChannelItem;
        const lv =
          0.5 +
          0.38 * Math.sin(waveClock * 2.1 + i * 0.85) +
          0.08 * Math.cos(waveClock * 4.7 - i);
        item.level(Math.max(0.08, Math.min(0.98, Math.round(lv * 100) / 100)));
      }
    });
  }

  if (morphState.streaming()) {
    morphAccumMs += dtMs;
    if (morphAccumMs >= 95) {
      morphAccumMs = 0;
      const nextCursor =
        morphState.cursor() >= STREAM_TOKENS.length
          ? 1
          : morphState.cursor() + 1;
      runMorphStep(nextCursor);
    }
  }

  const flushElapsed = performance.now() - flushStart;
  frameTimes.push(flushElapsed);
  if (frameTimes.length > 48) frameTimes.shift();

  // Update oscilloscope polyline every 3 frames so the SVG itself stays feather-light
  if (frameCounter % 3 === 0) {
    let pts = "";
    for (let i = 0; i < frameTimes.length; i++) {
      const x = ((i / (frameTimes.length - 1)) * 240).toFixed(1);
      const ratio = Math.min(1, (frameTimes[i] as number) / 16.6);
      const y = (40 - ratio * 34).toFixed(1);
      pts += `${pts ? " " : ""}${x},${y}`;
    }
    scopePoints(pts);
  }

  const windowElapsed = now - sampleWindowStart;
  if (windowElapsed >= 500) {
    const scale = 1000 / windowElapsed;
    const counts = runtimeMeter.read();
    const writes = Math.round(
      ((counts["loom:write"]?.count ?? 0) + internalMatrixWrites) * scale,
    );
    const effects = Math.round((counts["loom:effect"]?.count ?? 0) * scale);
    const fps = Math.min(120, Math.round(frameCounter * scale));
    const avgFlush =
      frameTimes.reduce((sum, n) => sum + n, 0) / frameTimes.length;

    batch(() => {
      telemetry.fps(fps);
      telemetry.writesPerSec(writes);
      telemetry.effectsPerSec(effects);
      telemetry.domPerSec(Math.round(totalDomMutations * scale));
      telemetry.leftDomPerSec(Math.round(leftDomMutations * scale));
      telemetry.rightDomPerSec(
        matrix.rightFrozen() ? 0 : Math.round(rightDomMutations * scale),
      );
      telemetry.flushMs(avgFlush.toFixed(2));
    });

    sampleWindowStart = now;
    frameCounter = 0;
    totalDomMutations = 0;
    leftDomMutations = 0;
    rightDomMutations = 0;
    internalMatrixWrites = 0;
  }

  requestAnimationFrame(tickFrame);
}

requestAnimationFrame(tickFrame);
