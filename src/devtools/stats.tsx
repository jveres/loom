// Stats ("Info") tab + the whole metrics subsystem: the meter-driven reactive-pipeline rates, the
// rAF frame-rate / lag probes, the web-vital PerformanceObserver sources, the live resource census,
// and the gauge / histogram / sparkline widgets. Owns its module state and its own (pausable) scope;
// the panel drives it through wireStats / pauseStats / resumeStats / stopStats.
import {
  type Meter,
  meter,
  type Polled,
  polled,
  type Read,
  type Scope,
  type SourceConnect,
  scope,
  source,
  untrack,
} from "loom";
import { text } from "loom/dom";
import { events, inspectResources } from "loom/observe";
import { bind, PANEL_OPTS } from "./bindings.js";
import { PANEL_ID } from "./css.js";
import { renderGraphThrottled } from "./graph.js";
import { renderTrace } from "./trace.js";

/* ---- geometry ---- */
const FRAME_N = 138; // frame-time histogram samples (matches the demo overlay)
const GAUGE_R = 34;
const GAUGE_C = 2 * Math.PI * GAUGE_R;
const GAUGE_ARC = GAUGE_C * 0.75; // 270° gauge
const SPARK_N = 48;
const SPARK_W = 58;
const SPARK_LINE = 11;
const SPARK_H = SPARK_LINE * 2;
const SPARK_C = SPARK_H / 2; // center: writes deflect up, DOM updates down (equals SPARK_LINE here)
const SPARK_GAP = 1; // rest each trace a hair off-center so they don't merge into one line when flat
const SPARK_DECAY = 0.9; // per-tick gain decay (~1s): the auto-scale eases down instead of popping
const SPARK_FLOOR = 8; // min normalizing peak (events/tick) so faint bursts read, idle stays flat
const SPARK_RAMP: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.4, 0.03],
  [0.7, 0.11],
  [0.88, 0.22],
  [1, 0.34],
];
const POLL_MS = 120;
const POLL_S = POLL_MS / 1000;
const LAG_MS = 200;

/* ---- module state ---- */
// Set by wireStats so renderActiveTab() can read the active tab + minimized state without importing it.
let activeTabFn: () => string | undefined = () => undefined;
let isMinimizedFn: () => boolean = () => false;

let heartbeat: Polled<number> | null = null;
let lagTimer: ReturnType<typeof setInterval> | null = null;
let rafHandle: number | null = null;
// The stats tab's scope: paused when its tab isn't the active one (so a hidden subtree does no work).
let statsScope: Scope | null = null;
// Advances every tick (regardless of tab) so the always-visible spark keeps moving; the value-dedup
// leaves the display:none-hidden Info bindings asleep until that tab is shown.
let metricSeq = 0;

// A pull-based meter on the runtime's built-in `events`; poll() drains it every tick for the
// smoothed per-second rates. The meter is a scope resource, so minimizing detaches it.
let metricsMeter: Meter | null = null; // count view: the per-channel rates
let flushMeter: Meter | null = null; // samples view: the last flush's batch size + duration
let readRate = 0;
let writeRate = 0;
let computedRate = 0;
let effectRate = 0;
let flushRate = 0;
let createRate = 0;
let disposeRate = 0;
let lastFlushBatch = 0;
let lastFlushMs = 0;

// Frame rate / frame times (rAF), main-thread lag (timer), web-vitals (PerformanceObserver).
let fps = 0;
let fpsReady = false;
let fpsAcc = 0;
let fpsFrames = 0;
let lastFrameT = 0;
let lastFrameMs = 0;
const frameMs: number[] = [];
let lag = 0;
let lagPeak = 0;
let lagExpected = 0;
let lagWasHidden = false; // tab was hidden during the current inter-tick interval (see startMetrics)

let clsSource: Read<number> | null = null;
let lcpSource: Read<number> | null = null;
let inpSource: Read<number> | null = null;
let longTasksSource: Read<number> | null = null;
let heapSource: Polled<number> | null = null;

// Derived health, recomputed each poll; the gauge / FPS / label bindings read these.
let score = 100;
let healthKey = "";
let healthReady = false;
let fpsKey = "";

// Live resource census, recomputed once per poll while the Info tab is visible.
let nodeStates = 0;
let nodeComputeds = 0;
let nodeEffects = 0;
let nodeViews = 0;
let nodeSources = 0;
let nodeScopes = 0;
let nodeChannels = 0;
let nodeUnread = 0;

// Rendering-pipeline sparkline series: writes up vs DOM updates down. The buffers hold the gain-
// applied amplitudes (0..1, normalized at write-time against a decaying peak — see SPARK_DECAY), so
// old samples keep their recorded height and the scale eases rather than popping when chaos stops.
const sparkIn: number[] = [];
const sparkOut: number[] = [];
let sparkPeakIn = SPARK_FLOOR;
let sparkPeakOut = SPARK_FLOOR;

/* ---- binding helpers ---- */
function bindAttr(node: Element, name: string, read: () => string): void {
  let prev: string | undefined;
  bind(() => {
    const next = read();
    if (next === prev) return;
    prev = next;
    node.setAttribute(name, next);
  });
}

// Read the heartbeat (so the binding re-runs each poll) then return the current value.
function pulse<T>(read: () => T): () => T {
  return () => {
    heartbeat?.read();
    return read();
  };
}
/* ---- formatting + web-vital sources ---- */
const ema = (prev: number, delta: number): number =>
  prev * 0.6 + (delta / POLL_S) * 0.4;

function fmtRate(n: number): string {
  const r = Math.round(n);
  if (r >= 10000) return `${Math.round(r / 1000)}k`;
  if (r >= 1000) return `${(r / 1000).toFixed(1)}k`;
  return String(r);
}

function health(f: number): { key: string; label: string; score: number } {
  const s = Math.round(100 * Math.max(0, Math.min(1, f / 55)));
  if (s >= 70) return { key: "ok", label: "healthy", score: s };
  if (s >= 40) return { key: "warn", label: "strained", score: s };
  return { key: "bad", label: "overloaded", score: s };
}

function frameColor(ms: number): string {
  const f = 1000 / ms;
  return f >= 55 ? "h-ok" : f >= 30 ? "h-warn" : "h-bad";
}

function vitalColor(v: number, good: number, ni: number): string {
  if (!v) return "";
  return v <= good ? "h-ok" : v <= ni ? "h-warn" : "h-bad";
}

/* --- web-vitals as lazy sources: each wires a PerformanceObserver while observed --- */

// Wraps the shared scaffolding (feature guard, try/catch, disconnect) around a PerformanceObserver
// source. `build(set)` creates per-connection state, constructs the observer, calls observe(), and
// returns it; a throw (e.g. unsupported entry type) degrades to a no-op source.
function observerSource(
  build: (set: (v: number) => void) => PerformanceObserver,
): SourceConnect<number> {
  return (set) => {
    if (typeof PerformanceObserver !== "function") return () => {};
    try {
      const obs = build(set);
      return () => obs.disconnect();
    } catch {
      return () => {};
    }
  };
}

// Cumulative layout shift — the worst session window (matches Chrome's CLS, not a running total).
const connectCls = observerSource((set) => {
  let win = 0;
  let first = 0;
  let prev = 0;
  let max = 0;
  const obs = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const ls = entry as PerformanceEntry & {
        value?: number;
        hadRecentInput?: boolean;
      };
      if (ls.hadRecentInput || typeof ls.value !== "number") continue;
      const t = entry.startTime;
      if (win > 0 && (t - prev > 1000 || t - first > 5000)) win = 0;
      if (win === 0) first = t;
      win += ls.value;
      prev = t;
      if (win > max) {
        max = win;
        set(max);
      }
    }
  });
  obs.observe({ type: "layout-shift", buffered: true });
  return obs;
});

// Largest contentful paint (ms) — latest candidate.
const connectLcp = observerSource((set) => {
  const obs = new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (e.entryType === "largest-contentful-paint") set(e.startTime);
    }
  });
  obs.observe({ type: "largest-contentful-paint", buffered: true });
  return obs;
});

// Interaction to next paint (ms) — worst interaction latency so far.
const connectInp = observerSource((set) => {
  let worst = 0;
  const obs = new PerformanceObserver((list) => {
    for (const e of list.getEntries()) {
      if (
        (e.entryType === "first-input" ||
          (e as PerformanceEventTiming).interactionId) &&
        e.duration > worst
      ) {
        worst = e.duration;
        set(worst);
      }
    }
  });
  obs.observe({
    type: "event",
    buffered: true,
    durationThreshold: 40,
  } as PerformanceObserverInit);
  obs.observe({ type: "first-input", buffered: true });
  return obs;
});

// Whether the Long Tasks API exists (Chrome/FF yes, Safari/WebKit no). Lets the "blocked" row
// distinguish a genuine 0 ms (no blocking — good) from "unsupported" (—).
const LONGTASKS_SUPPORTED =
  typeof PerformanceObserver === "function" &&
  PerformanceObserver.supportedEntryTypes?.includes("longtask") === true;

// Total main-thread blocking time (sum of long-task durations) — the standardized cousin of the
// `lag` probe. Unsupported in Safari/WebKit, where the row reads "—".
const connectLongTasks = observerSource((set) => {
  let total = 0;
  const obs = new PerformanceObserver((list) => {
    for (const e of list.getEntries()) total += e.duration;
    set(total);
  });
  obs.observe({ type: "longtask", buffered: true });
  return obs;
});

function gaugeClass(base: string): string {
  return `${base} ${healthReady ? `h-${healthKey}` : "li-loading"}`;
}
/* ---- SVG widgets ---- */
function buildGauge(): HTMLElement {
  const arc = (
    <circle
      class="li-garc"
      cx={44}
      cy={44}
      r={GAUGE_R}
      fill="none"
      stroke-width={9}
      stroke-linecap="round"
      transform="rotate(135 44 44)"
      stroke-dasharray={`0 ${GAUGE_C}`}
    />
  );
  const num = <text class="li-gnum" x={44} y={48} text-anchor="middle" />;
  bindAttr(
    arc,
    "stroke-dasharray",
    pulse(() =>
      healthReady
        ? `${(GAUGE_ARC * score) / 100} ${GAUGE_C}`
        : `0.1 ${GAUGE_C}`,
    ),
  );
  bindAttr(
    arc,
    "class",
    pulse(() => gaugeClass("li-garc")),
  );
  num.append(
    text(
      pulse(() => (healthReady ? String(score) : "100")),
      PANEL_OPTS,
    ),
  );
  bindAttr(
    num,
    "class",
    pulse(() => gaugeClass("li-gnum")),
  );
  return (
    <svg
      width={88}
      height={88}
      viewBox="0 0 88 88"
      role="img"
      aria-label="Health"
    >
      <circle
        class="li-gtrack"
        cx={44}
        cy={44}
        r={GAUGE_R}
        fill="none"
        stroke-width={9}
        stroke-linecap="round"
        transform="rotate(135 44 44)"
        stroke-dasharray={`${GAUGE_ARC} ${GAUGE_C}`}
      />
      {arc}
      {num}
      <text class="li-glbl" x={44} y={61} text-anchor="middle">
        HEALTH
      </text>
    </svg>
  );
}

function buildHisto(): HTMLElement {
  const bars: Element[] = [];
  for (let i = 0; i < FRAME_N; i++) {
    bars.push(<rect x={i + 0.1} width={0.8} y={20} height={0} />);
  }
  bind(() => {
    heartbeat?.read();
    const off = bars.length - frameMs.length;
    for (let i = 0; i < bars.length; i++) {
      const bar = bars[i];
      if (!bar) continue;
      const ms = i >= off ? (frameMs[i - off] ?? 0) : 0;
      const hgt = Math.max(0, Math.min(20, (ms / 50) * 20));
      bar.setAttribute("y", String(20 - hgt));
      bar.setAttribute("height", String(hgt));
      bar.setAttribute("class", ms ? frameColor(ms) : "");
    }
  });
  return (
    <div class="li-histo" title={TIP.frames}>
      <svg
        preserveAspectRatio="none"
        viewBox={`0 0 ${FRAME_N} 20`}
        role="img"
        aria-label="Frame times"
      >
        {bars}
      </svg>
    </div>
  );
}

// Deflect from the center: dir −1 sends writes up, dir +1 sends DOM updates down, each resting a
// SPARK_GAP off-center so the flat traces stay separate. Samples are already gain-normalized to 0..1.
function plotPoints(data: number[], dir: -1 | 1): string {
  const step = data.length > 1 ? SPARK_W / (data.length - 1) : 0;
  const span = SPARK_LINE - 2 - SPARK_GAP;
  return data
    .map(
      (v, i) =>
        `${(i * step).toFixed(1)},${(SPARK_C + dir * (SPARK_GAP + v * span)).toFixed(1)}`,
    )
    .join(" ");
}

function buildSpark(): HTMLElement {
  // `flip` reverses the vertical ramp so the dense end sits at the center axis for both halves
  // (top half fades up, bottom half fades down) — the gradient mirrors around the center line too.
  const grad = (id: string, cls: string, flip = false): HTMLElement => (
    <linearGradient id={id} x1={0} y1={flip ? 1 : 0} x2={0} y2={flip ? 0 : 1}>
      {SPARK_RAMP.map(([offset, opacity]) => (
        <stop offset={offset} class={cls} stop-opacity={opacity} />
      ))}
    </linearGradient>
  );
  const inLine = (
    <polyline
      class="li-spk-up"
      fill="none"
      stroke-width={1}
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  );
  const outLine = (
    <polyline
      class="li-spk-down"
      fill="none"
      stroke-width={1}
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  );
  bindAttr(
    inLine,
    "points",
    pulse(() => plotPoints(sparkIn, -1)),
  );
  bindAttr(
    outLine,
    "points",
    pulse(() => plotPoints(sparkOut, 1)),
  );
  return (
    <span
      class="li-spark"
      title="rendering pipeline — writes in (green ↑) vs DOM updates out (red ↓)"
    >
      <svg
        width={SPARK_W}
        height={SPARK_H}
        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        role="img"
        aria-label="Rendering pipeline utilization"
      >
        <defs>
          {grad(`${PANEL_ID}-spk-up`, "li-spk-up")}
          {grad(`${PANEL_ID}-spk-down`, "li-spk-down", true)}
        </defs>
        <rect
          x={0}
          y={0}
          width={SPARK_W}
          height={SPARK_LINE}
          fill={`url(#${PANEL_ID}-spk-up)`}
        />
        <rect
          x={0}
          y={SPARK_LINE}
          width={SPARK_W}
          height={SPARK_LINE}
          fill={`url(#${PANEL_ID}-spk-down)`}
        />
        {inLine}
        {outLine}
      </svg>
    </span>
  );
}

/* ---- stats tab ---- */
function stat(
  label: string,
  get: () => string,
  cls = "",
  title = "",
): HTMLElement {
  const val = (<span class={`li-stat-v ${cls}`} />) as HTMLElement;
  val.append(text(pulse(get), PANEL_OPTS));
  return (
    <div class="li-stat">
      <span class="li-stat-k" title={title}>
        {label}
      </span>
      {val}
    </div>
  );
}

// Hover descriptions for each stat label.
const TIP = {
  fps: "Frames per second, averaged over ~0.5s windows.",
  health: "Overall health (0–100) derived from FPS against a 55fps target.",
  frames: "Recent per-frame render times; taller/red bars are slower frames.",
  lag: "Main-thread lag: how late a fixed 200ms timer fires (now · peak). High = jank.",
  heap: "JS heap used (Chrome only), re-sampled every 5s via polled().",
  cls: "Cumulative Layout Shift — unitless score (not pixels), worst session window (Core Web Vital).",
  lcp: "Largest Contentful Paint — time to the largest paint (Core Web Vital).",
  inp: "Interaction to Next Paint — worst interaction latency (Core Web Vital).",
  blocked:
    "Total main-thread blocking from long tasks >50ms (lazy source). Not supported in Safari.",
  frameTime: "Render time of the most recent frame. ~16.7ms ≈ 60fps.",
  writes: "State writes per second (state:set events).",
  reads: "Tracked reads per second (reads inside effects/computeds).",
  computedsRate: "Computed values recomputed to a new result per second.",
  effectRuns:
    "Effect runs per second — DOM bindings + app effects (the rendering output of the pipeline).",
  flushes: "Reactive flush cycles per second.",
  effectsPerFlush: "Effects run in the most recent flush (its batch size).",
  flushTime: "Wall-clock duration of the most recent flush.",
  creates:
    "Reactive nodes (state/computed/effect) created per second — graph allocation rate.",
  disposes: "Reactive nodes disposed per second — graph teardown rate.",
  states: "Live state cells in the reactive graph.",
  computeds: "Live computed values.",
  effects:
    "Live app effects (your effect() calls), excluding DOM-binding views.",
  views:
    "Live DOM bindings (text/attr/class/style/list) — the rendering output.",
  sources:
    "Live lazy sources (source/polled) — external producers wired into the graph.",
  scopes: "Live scopes grouping effects and resources.",
  channels:
    "Registered channels — gated ring-buffer event streams for any use (7 built-in reactive ones + any the app declares).",
  unread:
    "States/computeds nothing currently reads (no subscribers). Some are normal; a count that keeps climbing under steady state suggests leaked cells.",
} as const;

function buildStatsPane(): HTMLElement {
  const fpsValue = (<span class="li-perfh-fps" />) as HTMLElement;
  fpsValue.append(
    text(
      pulse(() => (fpsReady ? `${Math.round(fps)} fps` : "— fps")),
      PANEL_OPTS,
    ),
  );
  bindAttr(
    fpsValue,
    "class",
    pulse(() => `li-perfh-fps ${fpsKey}`),
  );

  const hlabel = (<div class="li-hlabel" title={TIP.health} />) as HTMLElement;
  hlabel.append(
    text(
      pulse(() => (fpsReady ? health(fps).label.toUpperCase() : "LOADING")),
      PANEL_OPTS,
    ),
  );
  bindAttr(
    hlabel,
    "class",
    pulse(() => (healthReady ? `li-hlabel h-${healthKey}` : "li-hlabel")),
  );

  const side = (
    <div class="li-hstats">
      {hlabel}
      {stat(
        "lag",
        () => `${lag.toFixed(0)} · pk ${lagPeak.toFixed(0)} ms`,
        "lo",
        TIP.lag,
      )}
    </div>
  );
  // Main-thread blocking (long tasks) sits with lag as a responsiveness signal; lazy source.
  const blockedValue = (): number => longTasksSource?.() ?? 0;
  side.append(
    vitalStat(
      "blocked",
      () => {
        if (!LONGTASKS_SUPPORTED) return "—";
        const v = blockedValue();
        return v < 1000 ? `${v.toFixed(0)} ms` : `${(v / 1000).toFixed(1)} s`;
      },
      () => {
        if (!LONGTASKS_SUPPORTED) return "";
        const v = blockedValue();
        return v <= 200 ? "h-ok" : v <= 600 ? "h-warn" : "h-bad";
      },
      TIP.blocked,
    ),
  );
  // Reading these source values inside the bindings is what lazily wires their PerformanceObservers.
  const clsValue = (): number => clsSource?.() ?? 0;
  const lcpValue = (): number => lcpSource?.() ?? 0;
  const inpValue = (): number => inpSource?.() ?? 0;
  side.append(
    vitalStat(
      "CLS",
      () => clsValue().toFixed(2),
      () => {
        const v = clsValue();
        return v < 0.1 ? "h-ok" : v < 0.25 ? "h-warn" : "h-bad";
      },
      TIP.cls,
    ),
  );
  side.append(
    vitalStat(
      "LCP",
      () => (lcpValue() ? `${(lcpValue() / 1000).toFixed(2)} s` : "—"),
      () => vitalColor(lcpValue(), 2500, 4000),
      TIP.lcp,
    ),
  );
  side.append(
    vitalStat(
      "INP",
      () => (inpValue() ? `${inpValue().toFixed(0)} ms` : "—"),
      () => vitalColor(inpValue(), 200, 500),
      TIP.inp,
    ),
  );

  return (
    <div class="li-pane">
      <div class="li-perfh">
        <span title={TIP.fps}>Performance</span>
        {fpsValue}
      </div>
      {buildHisto()}
      <div class="li-hblock">
        {buildGauge()}
        {side}
      </div>
      {stat(
        "frame time",
        () => `${lastFrameMs.toFixed(1)} ms`,
        "",
        TIP.frameTime,
      )}
      {heapMem() ? buildHeapStat() : null}
      {stat("writes / s", () => fmtRate(writeRate), "hi", TIP.writes)}
      {stat("reads / s", () => fmtRate(readRate), "hi", TIP.reads)}
      {stat(
        "computeds / s",
        () => fmtRate(computedRate),
        "",
        TIP.computedsRate,
      )}
      {stat("effect runs / s", () => fmtRate(effectRate), "lo", TIP.effectRuns)}
      {stat("flushes / s", () => fmtRate(flushRate), "lo", TIP.flushes)}
      {stat(
        "effects / flush",
        () => String(lastFlushBatch),
        "",
        TIP.effectsPerFlush,
      )}
      {stat(
        "flush time",
        () => `${lastFlushMs.toFixed(1)} ms`,
        "",
        TIP.flushTime,
      )}
      {stat("creates / s", () => fmtRate(createRate), "lo", TIP.creates)}
      {stat("disposes / s", () => fmtRate(disposeRate), "lo", TIP.disposes)}
      {stat("states", () => String(nodeStates), "", TIP.states)}
      {stat("computeds", () => String(nodeComputeds), "", TIP.computeds)}
      {vitalStat(
        "unread",
        () => String(nodeUnread),
        () => (nodeUnread > 0 ? "h-warn" : ""),
        TIP.unread,
      )}
      {stat("effects", () => String(nodeEffects), "", TIP.effects)}
      {stat("views", () => String(nodeViews), "", TIP.views)}
      {stat("sources", () => String(nodeSources), "", TIP.sources)}
      {stat("scopes", () => String(nodeScopes), "", TIP.scopes)}
      {stat("channels", () => String(nodeChannels), "", TIP.channels)}
    </div>
  );
}

function vitalStat(
  label: string,
  get: () => string,
  color: () => string,
  title = "",
): HTMLElement {
  const row = stat(label, get, "", title);
  const val = row.querySelector(".li-stat-v");
  if (val)
    bindAttr(
      val,
      "class",
      pulse(() => `li-stat-v ${color()}`),
    );
  return row;
}

function heapMem(): { usedJSHeapSize: number } | undefined {
  return (performance as { memory?: { usedJSHeapSize: number } }).memory;
}

function buildHeapStat(): HTMLElement {
  // Heap drifts slowly, so it's a polled() source (created in wireStats) sampled every 5s.
  return stat(
    "heap",
    () => {
      const bytes = heapSource?.read() ?? 0;
      return bytes ? `${(bytes / 1048576).toFixed(1)} MB` : "—";
    },
    "lo",
    TIP.heap,
  );
}

/* ---- metrics loop ---- */
function poll(): number {
  const frame = metricsMeter?.read();
  const dr = frame?.["loom:read"]?.count ?? 0;
  const dw = frame?.["loom:write"]?.count ?? 0;
  const deff = frame?.["loom:effect"]?.count ?? 0;
  const dc = frame?.["loom:compute"]?.count ?? 0;
  const dcr = frame?.["loom:create"]?.count ?? 0;
  const ddi = frame?.["loom:dispose"]?.count ?? 0;
  const flushFrame = flushMeter?.read()?.["loom:flush"];
  readRate = ema(readRate, dr);
  writeRate = ema(writeRate, dw);
  effectRate = ema(effectRate, deff);
  computedRate = ema(computedRate, dc);
  createRate = ema(createRate, dcr);
  disposeRate = ema(disposeRate, ddi);
  flushRate = ema(flushRate, flushFrame?.count ?? 0);
  const lastFlush = flushFrame?.samples.at(-1) as
    | { batchSize: number; durationMs: number }
    | undefined;
  if (lastFlush !== undefined) {
    lastFlushBatch = lastFlush.batchSize;
    lastFlushMs = lastFlush.durationMs;
  }
  // Sparkline = rendering-pipeline utilization: writes entering vs effect runs produced. Each side
  // tracks a peak that jumps to new highs but decays smoothly, and the sample is stored already
  // normalized against it — so the auto-scale glides down after a burst instead of snapping.
  sparkPeakIn = Math.max(dw, sparkPeakIn * SPARK_DECAY, SPARK_FLOOR);
  sparkPeakOut = Math.max(deff, sparkPeakOut * SPARK_DECAY, SPARK_FLOOR);
  sparkIn.push(dw / sparkPeakIn);
  sparkOut.push(deff / sparkPeakOut);
  if (sparkIn.length > SPARK_N) sparkIn.shift();
  if (sparkOut.length > SPARK_N) sparkOut.shift();

  if (!fpsReady) {
    healthReady = false;
    fpsKey = "";
  } else {
    const h = health(fps);
    score = h.score;
    healthKey = h.key;
    healthReady = true;
    fpsKey = fps >= 55 ? "h-ok" : fps >= 30 ? "h-warn" : "h-bad";
  }

  // The sequence advances every tick so the value bindings + the always-visible spark re-render. The
  // heavy per-tab refresh is split into renderActiveTab() and driven off the critical path.
  return ++metricSeq;
}

// The active tab's heavy refresh — the node census (stats), the graph reconcile, or draining the
// trace ring(s). Run via a deferred effect (see wireStats) so it yields to the app under load:
// idle-first, ~POLL_MS floor. Only the visible tab does work, and the graph self-throttles to ~3/s.
function renderActiveTab(): void {
  const visible = !isMinimizedFn();
  if (activeTabFn() === "stats" && visible) {
    const c = inspectResources();
    nodeStates = c.states;
    nodeComputeds = c.computeds;
    nodeEffects = c.effects;
    nodeViews = c.views;
    nodeSources = c.sources;
    nodeScopes = c.scopes;
    nodeChannels = c.channels;
    nodeUnread = c.unread;
  } else if (activeTabFn() === "graph" && visible) {
    renderGraphThrottled();
  } else if (activeTabFn() === "trace" && visible) {
    renderTrace(); // drain the trace ring(s) into the log
  }
}

// Mark that the tab went hidden. This fires even while the lag timer is throttled/frozen, so the flag
// is already set when the catch-up tick runs on return — independent of whether that tick or the
// visibilitychange-to-visible event arrives first.
function onLagVisibility(): void {
  if (document.hidden) lagWasHidden = true;
}

function startMetrics(): void {
  // The reactive-pipeline rates come from a pull-based meter on the runtime's built-in `events`,
  // created inside the panel's scope (see wireStats) so minimizing detaches it. Web vitals
  // (CLS/LCP/INP) are lazy sources whose PerformanceObservers connect with their readouts.
  lagExpected = performance.now() + LAG_MS;
  lagTimer = setInterval(() => {
    const t = performance.now();
    const expected = lagExpected;
    lagExpected = t + LAG_MS;
    // A backgrounded tab throttles/freezes this timer, so a tick's delta spans the time away — but you
    // can't tell that from the delta's size (a long real task is also a big delta). Use the actual
    // signal, the Page Visibility API: skip the tick if the tab is hidden now, or was hidden anytime
    // during this interval (lagWasHidden, set by visibilitychange before the timer froze, so it holds
    // regardless of whether the catch-up tick or the visible event lands first). Otherwise the delta
    // is genuine main-thread lag — record it, however large.
    if (document.hidden) {
      lagWasHidden = true;
      return;
    }
    if (lagWasHidden) {
      lagWasHidden = false; // first tick back after the tab was hidden — its delta is the time away
      return;
    }
    lag = Math.max(0, t - expected);
    if (lag > lagPeak) lagPeak = lag;
  }, LAG_MS);
  document.addEventListener("visibilitychange", onLagVisibility);

  lastFrameT = 0;
  const onFrame = (t: number): void => {
    rafHandle = requestAnimationFrame(onFrame);
    if (lastFrameT) {
      const dt = Math.min(t - lastFrameT, 1000);
      lastFrameMs = dt;
      frameMs.push(dt);
      if (frameMs.length > FRAME_N) frameMs.shift();
      fpsAcc += dt;
      fpsFrames++;
      if (fpsAcc >= 500) {
        const sample = (fpsFrames * 1000) / fpsAcc;
        fps = fpsReady ? fps * 0.5 + sample * 0.5 : sample;
        fpsReady = true;
        fpsAcc = 0;
        fpsFrames = 0;
      }
    }
    lastFrameT = t;
  };
  rafHandle = requestAnimationFrame(onFrame);
}

/* ---- seams the panel drives ---- */

interface StatsPanes {
  readonly statsPane: HTMLElement;
  readonly sparkEl: HTMLElement;
}

// Wire the metrics subsystem. Called inside the panel's scope so the meter + heartbeat become its
// resources (detach on minimize); the web-vital sources + the Info pane go in a nested scope that
// pauses when the Info tab isn't active. Returns the Info pane and the (always-live) header spark.
export function wireStats(opts: {
  activeTab: () => string | undefined;
  isMinimized: () => boolean;
}): StatsPanes {
  activeTabFn = opts.activeTab;
  isMinimizedFn = opts.isMinimized;
  metricsMeter = meter([
    events.read,
    events.write,
    events.compute,
    events.effect,
    events.create,
    events.dispose,
  ]); // default "count" view — rates only, no per-event allocation
  flushMeter = meter([events.flush], "samples"); // the one channel we read records from
  heartbeat = polled(poll, POLL_MS, PANEL_OPTS);
  // The heavy per-tab refresh runs in the deferred lane — ticked by the heartbeat but off the
  // critical path (idle-first, ~POLL_MS floor), so under app load it yields instead of competing each
  // frame. untracked so it re-runs only on the tick, not on whatever the render reads. Owned by the
  // panel scope, so it pauses with minimize like the heartbeat.
  bind(
    () => {
      heartbeat?.read();
      untrack(renderActiveTab);
    },
    { defer: true, maxStale: POLL_MS },
  );
  let statsPane!: HTMLElement;
  statsScope = scope(() => {
    clsSource = source(connectCls, 0, PANEL_OPTS);
    lcpSource = source(connectLcp, 0, PANEL_OPTS);
    inpSource = source(connectInp, 0, PANEL_OPTS);
    longTasksSource = source(connectLongTasks, 0, PANEL_OPTS);
    if (heapMem()) {
      heapSource = polled(
        () => heapMem()?.usedJSHeapSize ?? 0,
        5000,
        PANEL_OPTS,
      );
    }
    statsPane = buildStatsPane();
  }, PANEL_OPTS);
  const sparkEl = buildSpark();
  startMetrics();
  return { statsPane, sparkEl };
}

export function pauseStats(): void {
  statsScope?.pause();
}

export function resumeStats(): void {
  statsScope?.resume();
}

// Tear down the metrics subsystem and reset its state (from unmountInspector).
export function stopStats(): void {
  metricsMeter?.stop();
  metricsMeter = null;
  flushMeter?.stop();
  flushMeter = null;
  heartbeat?.stop();
  heartbeat = null;
  if (lagTimer != null) clearInterval(lagTimer);
  lagTimer = null;
  document.removeEventListener("visibilitychange", onLagVisibility);
  if (rafHandle != null) cancelAnimationFrame(rafHandle);
  rafHandle = null;
  // statsScope owns the heap + web-vital sources and the Info-pane bindings; stopping it tears them
  // all down (and any future resource added inside), so they need no individual teardown here.
  statsScope?.stop();
  statsScope = null;
  heapSource = clsSource = lcpSource = inpSource = longTasksSource = null;
  metricSeq = 0;
  readRate = writeRate = computedRate = effectRate = flushRate = 0;
  createRate = disposeRate = 0;
  lastFlushBatch = lastFlushMs = 0;
  fps = 0;
  fpsReady = false;
  fpsAcc = fpsFrames = lastFrameT = lastFrameMs = 0;
  frameMs.length = 0;
  lag = lagPeak = 0;
  healthReady = false;
  nodeStates = nodeComputeds = nodeEffects = nodeViews = 0;
  nodeSources = nodeScopes = nodeChannels = nodeUnread = 0;
  sparkIn.length = 0;
  sparkOut.length = 0;
  sparkPeakIn = SPARK_FLOOR;
  sparkPeakOut = SPARK_FLOOR;
}
