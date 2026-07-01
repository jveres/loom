// Trace tab: a live, newest-on-top causal trace of reactive events, read from the loom:write and/or
// loom:read channels' *samples* views (each channel ring holds the last 1024). Each event carries
// its source — the effect/computed that read or wrote the cell — so a row reads "X — by Y". A header
// selector picks which types stream (writes, reads, or all interleaved by timestamp); pause freezes
// it, clear empties it, the filter narrows by cell name, hovering a row outlines the DOM node(s) the
// cell drives, and tapping a name jumps to it in the Graph. Driven off the panel heartbeat (in the
// deferred lane), it drains the selected ring(s) into a capped, newest-first log rendered via the vlist.
// Panel seams: buildTracePane / renderTrace / showTrace / teardownTrace.
import { type Meter, meter } from "loom";
import { tap } from "loom/dom";
import { events, inspect } from "loom/observe";
import { type VirtualList, virtualList } from "../dom/virtual-list.js";
import { formatValue, valueClass } from "./format.js";
import { clearGraphHighlight, highlightCell } from "./graph.js";
import { ICON_CLEAR, ICON_PAUSE, ICON_PLAY, icon } from "./icons.js";
import { wireScrollFade } from "./scroll-fade.js";

const TRACE_ROW_H = 22; // uniform row height (must match the .li-tr CSS)
const VALUE_MAX = 200; // cap a recorded value's text so a giant string can't bloat the DOM/tooltip
let windowSize = 1000; // how many events the log keeps; set from the inspector menu

type TraceMode = "writes" | "reads" | "all";

type TraceRow = {
  readonly seq: number; // unique, monotonic — the vlist key (the log shifts as it prepends)
  readonly id: number; // the cell id — for hover-highlighting the DOM nodes it drives
  readonly kind: "read" | "write";
  readonly timeText: string;
  readonly name: string;
  readonly prevText: string; // writes only
  readonly prevCls: string;
  readonly nextText: string;
  readonly nextCls: string;
  readonly srcText: string; // "by <source>" — who read/wrote it; "" when external/none
  readonly full: string; // untruncated line, for the hover title
};

let traceVList: VirtualList<TraceRow> | null = null;
let writeMeter: Meter | null = null;
let readMeter: Meter | null = null;
let traceMode: TraceMode = "all";
let traceRoot: HTMLElement | null = null;
let traceScroll: HTMLElement | null = null;
let traceFade: { refresh: () => void; dispose: () => void } | null = null;
let pauseBtn: HTMLButtonElement | null = null;
let liveDot: HTMLElement | null = null;
let traceLog: TraceRow[] = []; // newest-first, capped at windowSize
let filterLog: TraceRow[] = []; // when a filter is active, its own newest-first window of matches
let tracePaused = false;
let traceActive = false; // is the Trace tab the visible one? (the live view only updates then)
let traceFilter = ""; // lowercased name substring; "" = no filter
let rowSeq = 0; // monotonic key source
let lastTopSeq = -1; // seq of the row that was the top before the last update (new-arrivals boundary)
let lastHoverId = -1; // cell id currently hover-highlighted (avoids re-snapshotting within a row)
let onLocate: ((id: number) => void) | null = null; // jump-to-graph, wired by the panel

// Wire the "click a name to jump to it in the Graph" action (set by the panel, which owns tab state).
export function setTraceLocate(fn: (id: number) => void): void {
  onLocate = fn;
}

// The panel owns the live dot (it lives in the Trace tab); reflect the current state on it.
export function setTraceLiveDot(el: HTMLElement | null): void {
  liveDot = el;
  updateLiveDot();
}

// The Trace tab became (in)active (tab shown AND panel not minimized). The meters are attached only
// while active — detaching them drops the channels' samples count, so the core stops recording read/
// write detail entirely (zero hot-path cost) when the trace isn't on screen. Same idea as the stats
// scope's pause, done explicitly so the per-mode meter set survives mode changes.
export function setTraceActive(active: boolean): void {
  if (traceActive === active) return;
  traceActive = active;
  if (active) {
    attachMeters();
    renderTrace(); // catch up immediately on show
  } else {
    detachMeters();
  }
  updateLiveDot();
}

// Hidden when the tab isn't shown; a hollow ring when paused; a pulsing dot when live.
function updateLiveDot(): void {
  if (!liveDot) return;
  liveDot.classList.toggle("inactive", !traceActive);
  liveDot.classList.toggle("off", tracePaused);
  liveDot.title = !traceActive
    ? "Trace"
    : tracePaused
      ? "Paused"
      : "Live — capturing";
}

export function buildTracePane(): HTMLElement {
  applyMode(); // resets state; meters attach only once the tab goes active (setTraceActive)

  traceVList = virtualList<TraceRow>({
    rowHeight: TRACE_ROW_H,
    key: (r) => r.seq,
    render: trRender,
  });

  pauseBtn = (
    <button type="button" class="li-tr-btn" title="Pause / resume the trace" />
  ) as HTMLButtonElement;
  pauseBtn.append(icon(ICON_PAUSE, 12));
  tap(pauseBtn, () => setPaused(!tracePaused)); // tap, not click — click is dropped under load on iOS

  const clearBtn = (
    <button type="button" class="li-tr-btn" title="Clear the trace" />
  ) as HTMLButtonElement;
  clearBtn.append(icon(ICON_CLEAR, 12));
  tap(clearBtn, () => clearLog());

  const modeSel = (
    <select class="li-tr-mode" title="Which events to stream">
      <option value="writes">writes</option>
      <option value="reads">reads</option>
      <option value="all">all</option>
    </select>
  ) as HTMLSelectElement;
  modeSel.value = traceMode; // reflect the default ("all")
  modeSel.addEventListener("change", () => {
    traceMode = modeSel.value as TraceMode;
    applyMode();
  });

  const filter = (
    <input
      type="text"
      class="li-tr-filter"
      placeholder="filter by name…"
      spellcheck={false}
    />
  ) as HTMLInputElement;
  filter.addEventListener("input", () => {
    traceFilter = filter.value.trim().toLowerCase();
    // Seed the filtered window from the recent raw log, then keep accumulating matches into it (see
    // renderTrace) so a narrow filter retains its own last-`windowSize` events rather than being
    // purged as the raw window slides past them.
    filterLog = traceFilter
      ? traceLog.filter((r) => r.name.toLowerCase().includes(traceFilter))
      : [];
    applyView();
  });

  traceScroll = (<div class="li-tr-scroll li-fade-y" />) as HTMLElement;
  traceScroll.append(traceVList.el);
  traceFade = wireScrollFade(traceScroll, "y"); // same edge fade as the panel body
  // Hover a row to outline the DOM node(s) that cell drives — same overlay the Graph uses. Delegated
  // (rows are reused) and guarded so moving within a row doesn't re-snapshot.
  traceScroll.addEventListener("pointerover", (e) => {
    const row = (e.target as Element).closest?.(".li-tr") as HTMLElement | null;
    const id = row?.dataset["id"];
    if (id !== undefined && Number(id) !== lastHoverId) {
      lastHoverId = Number(id);
      highlightCell(lastHoverId);
    }
  });
  traceScroll.addEventListener("pointerleave", () => {
    lastHoverId = -1;
    clearGraphHighlight();
  });
  // Tap a cell name to jump to it in the Graph tab (tap, not click — click is dropped under load on
  // iOS; tap's slop also ignores a scroll drag).
  tap(traceScroll, (e) => {
    const name = (e.target as Element).closest?.(".li-tr-name");
    const row = name?.closest(".li-tr") as HTMLElement | null;
    const id = row?.dataset["id"];
    if (id === undefined) return;
    lastHoverId = -1;
    clearGraphHighlight(); // drop the hover overlay before jumping
    onLocate?.(Number(id));
  });
  traceRoot = (
    <div class="li-pane li-trace">
      <div class="li-tr-bar">
        {pauseBtn}
        {modeSel}
        {filter}
        {clearBtn}
      </div>
      {traceScroll}
    </div>
  ) as HTMLElement;
  return traceRoot;
}

// Attach the samples meters the current mode needs (writes always carry detail; reads are the
// high-frequency firehose, metered only when selected). Each samples meter bumps the channel's
// samples count, which is what unlocks detail recording in the core.
function attachMeters(): void {
  if (traceMode !== "reads" && !writeMeter)
    writeMeter = meter([events.write], "samples");
  if (traceMode !== "writes" && !readMeter)
    readMeter = meter([events.read], "samples");
}
function detachMeters(): void {
  writeMeter?.stop();
  writeMeter = null;
  readMeter?.stop();
  readMeter = null;
}

// Mode changed: swap the meter set (only while active — detached panes stay zero-cost) and re-filter
// the view to the new kind(s). The accumulated log is kept — the selector filters, it doesn't wipe.
function applyMode(): void {
  detachMeters();
  if (traceActive) attachMeters();
  lastTopSeq = -1; // the new-arrivals boundary is stale after a mode switch
  applyView();
  renderTrace();
}

// Empty the trace (both windows) — useful to start a clean capture before reproducing something.
function clearLog(): void {
  traceLog = [];
  filterLog = [];
  lastTopSeq = -1;
  applyView();
}

// Set how many events the log keeps (the window). Exposed for the inspector menu.
export function setTraceWindow(n: number): void {
  windowSize = n;
  if (traceLog.length > n) traceLog.length = n;
  if (filterLog.length > n) filterLog.length = n;
  applyView();
}

// Drain the selected ring(s) into the log (newest-first) and re-window. A no-op while paused.
export function renderTrace(): void {
  if (tracePaused || traceVList === null) return;
  const fresh: Array<{
    s: Readonly<Record<string, unknown>>;
    kind: "read" | "write";
  }> = [];
  const writes = writeMeter?.read()["loom:write"]?.samples;
  if (writes) for (const s of writes) fresh.push({ s, kind: "write" });
  const reads = readMeter?.read()["loom:read"]?.samples;
  if (reads) for (const s of reads) fresh.push({ s, kind: "read" });
  if (fresh.length === 0) return;
  // Interleave the two rings by their recorded timestamp when streaming both.
  if (traceMode === "all")
    fresh.sort((a, b) => (a.s["t"] as number) - (b.s["t"] as number));
  const labels = labelMap();
  const prevTop = (traceFilter ? filterLog : traceLog)[0]?.seq ?? -1;
  for (const { s, kind } of fresh) {
    const row = makeRow(s, kind, labels);
    traceLog.unshift(row);
    // Accumulate matches into the filtered window too, so filtering keeps its own last-`windowSize`.
    if (traceFilter && row.name.toLowerCase().includes(traceFilter))
      filterLog.unshift(row);
  }
  if (traceLog.length > windowSize) traceLog.length = windowSize; // drop oldest past the window
  if (filterLog.length > windowSize) filterLog.length = windowSize;
  // Mark where the top was, so this update's new rows are demarcated — only if the displayed list
  // actually gained rows (a filtered view may not have) and the boundary is still within it.
  const newTop = (traceFilter ? filterLog : traceLog)[0]?.seq ?? -1;
  lastTopSeq = newTop !== prevTop ? prevTop : -1;
  applyView();
}

// Tab shown: re-window for the now-visible pane (the vlist no-ops reconciles while hidden), then once
// more next frame — the first reconcile can race the layout of the just-un-hidden pane, which would
// otherwise leave the top rows blank until a scroll nudged it.
export function showTrace(): void {
  renderTrace();
  applyView();
  requestAnimationFrame(() => traceVList?.refresh());
}

export function teardownTrace(): void {
  detachMeters();
  traceVList = null;
  traceRoot = null;
  traceScroll = null;
  traceFade?.dispose();
  traceFade = null;
  pauseBtn = null;
  liveDot = null;
  traceLog = [];
  filterLog = [];
  lastTopSeq = -1;
  tracePaused = false;
  traceActive = false;
  traceFilter = "";
  traceMode = "all";
  lastHoverId = -1;
  onLocate = null;
}

function setPaused(paused: boolean): void {
  tracePaused = paused;
  pauseBtn?.replaceChildren(icon(paused ? ICON_PLAY : ICON_PAUSE, 12));
  updateLiveDot();
  traceRoot?.classList.toggle("li-tr-paused", paused);
  if (!paused) renderTrace(); // resume: catch up immediately
}

// Re-window with the active filter applied (a name substring match).
function applyView(): void {
  const base = traceFilter ? filterLog : traceLog;
  traceVList?.setItems(
    traceMode === "all"
      ? base
      : base.filter(
          (r) => r.kind === (traceMode === "writes" ? "write" : "read"),
        ),
  );
  traceFade?.refresh(); // content height changed — the ResizeObserver won't catch that
}

function makeRow(
  s: Readonly<Record<string, unknown>>,
  kind: "read" | "write",
  labels: Map<number, string>,
): TraceRow {
  const id = s["id"] as number;
  const name = labels.get(id) ?? `#${id}`;
  const timeText = trTime(s["t"] as number);
  const source = s["by"];
  const srcName =
    source !== undefined ? (labels.get(source as number) ?? `#${source}`) : "";
  const srcText = srcName ? `by ${srcName}` : "";
  if (kind === "read") {
    return {
      seq: rowSeq++,
      id,
      kind,
      timeText,
      name,
      prevText: "",
      prevCls: "",
      nextText: "",
      nextCls: "",
      srcText,
      full: `${name} — read ${srcText || "(external)"}`,
    };
  }
  const prevText = formatValue(s["prev"], VALUE_MAX);
  const nextText = formatValue(s["next"], VALUE_MAX);
  return {
    seq: rowSeq++,
    id,
    kind,
    timeText,
    name,
    prevText,
    prevCls: valueClass(s["prev"]),
    nextText,
    nextCls: valueClass(s["next"]),
    srcText,
    full: `${name}: ${prevText} → ${nextText} ${srcText || "(external)"}`,
  };
}

// id → label for the current snapshot, so an event shows its cell/source name (disposed nodes fall
// back to their id). Off the hot path — it runs on the heartbeat only while this tab is active.
function labelMap(): Map<number, string> {
  const m = new Map<number, string>();
  for (const n of inspect().nodes) m.set(n.id, n.label);
  return m;
}

function trRender(item: TraceRow, reuse: HTMLElement | null): HTMLElement {
  const row = reuse ?? trCreateRow();
  const kind = row.children[0] as HTMLElement;
  kind.textContent = item.kind === "read" ? "R" : "W";
  kind.className = `li-tr-kind li-tr-kind-${item.kind}`;
  (row.children[1] as HTMLElement).textContent = item.timeText;
  (row.children[2] as HTMLElement).textContent = item.name;
  const change = row.children[3] as HTMLElement;
  const prev = change.children[0] as HTMLElement;
  const arrow = change.children[1] as HTMLElement;
  const next = change.children[2] as HTMLElement;
  const src = change.children[3] as HTMLElement;
  if (item.kind === "read") {
    prev.textContent = "";
    prev.className = "li-tr-val"; // drop any value-type class left from a reused write row
    arrow.textContent = "";
    next.textContent = "";
    next.className = "li-tr-val";
  } else {
    prev.textContent = item.prevText;
    prev.className = `li-tr-val ${item.prevCls}`;
    arrow.textContent = " → ";
    next.textContent = item.nextText;
    next.className = `li-tr-val ${item.nextCls}`;
  }
  src.textContent = item.srcText; // "by <source>" — the effect/computed that read/wrote it
  row.title = item.full; // hover shows the untruncated line
  row.dataset["id"] = String(item.id); // for hover-highlight (delegated on the scroll container)
  row.classList.toggle("li-tr-mark", item.seq === lastTopSeq); // new-arrivals boundary
  return row;
}

function trCreateRow(): HTMLElement {
  return (
    <div class="li-tr">
      <span class="li-tr-kind" />
      <span class="li-tr-time" />
      <span class="li-tr-name" />
      <span class="li-tr-change">
        <span class="li-tr-val" />
        <span class="li-tr-arrow" />
        <span class="li-tr-val" />
        <span class="li-tr-src" />
      </span>
    </div>
  ) as HTMLElement;
}

// Wall-clock minute:second.millis of the event — enough to order/correlate within a session.
function trTime(t: number): string {
  if (!t) return "";
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMinutes())}:${p(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}
