// Events tab: a live, newest-on-top stream of reactive events, read from the loom:write and/or
// loom:read channels' *samples* views (each channel ring holds the last 1024). A header selector
// picks which types stream — writes (default), reads, or all (interleaved by timestamp). On the
// panel heartbeat (~120ms) it drains the selected ring(s) into a capped, newest-first log rendered
// through the windowing vlist. Pause/resume freezes it to read; the filter narrows by cell name;
// hovering a row outlines the DOM node(s) that cell drives. Panel seams: buildEventsPane /
// renderEvents / showEvents / teardownEvents.
import { type Meter, meter } from "loom";
import { events, inspect } from "loom/observe";
import { type VirtualList, virtualList } from "../dom/vlist.js";
import { clearGraphHighlight, highlightCell } from "./graph.js";

const EVENT_ROW_H = 22; // uniform row height (must match the .li-ev CSS)
const LOG_CAP = 1024; // the visible log depth — matches each channel ring
const VALUE_MAX = 200; // cap a recorded value's text so a giant string can't bloat the DOM/tooltip

type EventMode = "writes" | "reads" | "all";

type EventRow = {
  readonly seq: number; // unique, monotonic — the vlist key (the log shifts as it prepends)
  readonly id: number; // the cell id — for hover-highlighting the DOM nodes it drives
  readonly kind: "read" | "write";
  readonly timeText: string;
  readonly name: string;
  readonly prevText: string; // writes only
  readonly prevCls: string;
  readonly nextText: string;
  readonly nextCls: string;
  readonly full: string; // untruncated line, for the hover title
};

let eventsVList: VirtualList<EventRow> | null = null;
let writeMeter: Meter | null = null;
let readMeter: Meter | null = null;
let eventMode: EventMode = "all";
let eventsRoot: HTMLElement | null = null;
let eventsScroll: HTMLElement | null = null;
let pauseBtn: HTMLButtonElement | null = null;
let eventLog: EventRow[] = []; // newest-first, capped at LOG_CAP
let eventsPaused = false;
let eventsFilter = ""; // lowercased name substring; "" = no filter
let rowSeq = 0; // monotonic key source
let lastHoverId = -1; // cell id currently hover-highlighted (avoids re-snapshotting within a row)

export function buildEventsPane(): HTMLElement {
  applyMode(); // attaches the write meter for the default mode

  eventsVList = virtualList<EventRow>({
    rowHeight: EVENT_ROW_H,
    key: (r) => r.seq,
    render: evRender,
  });

  pauseBtn = (
    <button type="button" class="li-ev-btn" title="Pause / resume the stream">
      ⏸
    </button>
  ) as HTMLButtonElement;
  pauseBtn.addEventListener("click", () => setPaused(!eventsPaused));

  const modeSel = (
    <select class="li-ev-mode" title="Which events to stream">
      <option value="writes">writes</option>
      <option value="reads">reads</option>
      <option value="all">all</option>
    </select>
  ) as HTMLSelectElement;
  modeSel.value = eventMode; // reflect the default ("all")
  modeSel.addEventListener("change", () => {
    eventMode = modeSel.value as EventMode;
    applyMode();
  });

  const filter = (
    <input
      type="text"
      class="li-ev-filter"
      placeholder="filter by name…"
      spellcheck={false}
    />
  ) as HTMLInputElement;
  filter.addEventListener("input", () => {
    eventsFilter = filter.value.trim().toLowerCase();
    applyView();
  });

  eventsScroll = (<div class="li-ev-scroll" />) as HTMLElement;
  eventsScroll.append(eventsVList.el);
  // Hover a row to outline the DOM node(s) that cell drives — same overlay the Graph uses. Delegated
  // (rows are reused) and guarded so moving within a row doesn't re-snapshot.
  eventsScroll.addEventListener("pointerover", (e) => {
    const row = (e.target as Element).closest?.(".li-ev") as HTMLElement | null;
    const id = row?.dataset["id"];
    if (id !== undefined && Number(id) !== lastHoverId) {
      lastHoverId = Number(id);
      highlightCell(lastHoverId);
    }
  });
  eventsScroll.addEventListener("pointerleave", () => {
    lastHoverId = -1;
    clearGraphHighlight();
  });
  eventsRoot = (
    <div class="li-pane li-events">
      <div class="li-ev-bar">
        {pauseBtn}
        {modeSel}
        {filter}
      </div>
      {eventsScroll}
    </div>
  ) as HTMLElement;
  return eventsRoot;
}

// (Re)attach the channel meters for the current mode and restart the stream. Writes always carry
// detail; reads are the high-frequency firehose, so the read meter is attached only when selected.
function applyMode(): void {
  writeMeter?.stop();
  writeMeter = null;
  readMeter?.stop();
  readMeter = null;
  if (eventMode !== "reads") writeMeter = meter([events.write], "samples");
  if (eventMode !== "writes") readMeter = meter([events.read], "samples");
  eventLog = [];
  applyView();
  renderEvents();
}

// Drain the selected ring(s) into the log (newest-first) and re-window. A no-op while paused.
export function renderEvents(): void {
  if (eventsPaused || eventsVList === null) return;
  const fresh: Array<{ s: Readonly<Record<string, unknown>>; kind: "read" | "write" }> = [];
  const writes = writeMeter?.read()["loom:write"]?.samples;
  if (writes) for (const s of writes) fresh.push({ s, kind: "write" });
  const reads = readMeter?.read()["loom:read"]?.samples;
  if (reads) for (const s of reads) fresh.push({ s, kind: "read" });
  if (fresh.length === 0) return;
  // Interleave the two rings by their recorded timestamp when streaming both.
  if (eventMode === "all")
    fresh.sort((a, b) => (a.s["t"] as number) - (b.s["t"] as number));
  const labels = labelMap();
  for (const { s, kind } of fresh) eventLog.unshift(makeRow(s, kind, labels));
  if (eventLog.length > LOG_CAP) eventLog.length = LOG_CAP; // drop oldest past the window
  applyView();
}

// Tab shown: re-window for the now-visible pane (the vlist no-ops reconciles while hidden), then once
// more next frame — the first reconcile can race the layout of the just-un-hidden pane, which would
// otherwise leave the top rows blank until a scroll nudged it.
export function showEvents(): void {
  renderEvents();
  applyView();
  requestAnimationFrame(() => eventsVList?.refresh());
}

export function teardownEvents(): void {
  writeMeter?.stop();
  writeMeter = null;
  readMeter?.stop();
  readMeter = null;
  eventsVList = null;
  eventsRoot = null;
  eventsScroll = null;
  pauseBtn = null;
  eventLog = [];
  eventsPaused = false;
  eventsFilter = "";
  eventMode = "all";
  lastHoverId = -1;
}

function setPaused(paused: boolean): void {
  eventsPaused = paused;
  if (pauseBtn) pauseBtn.textContent = paused ? "▶" : "⏸";
  eventsRoot?.classList.toggle("li-ev-paused", paused);
  if (!paused) renderEvents(); // resume: catch up immediately
}

// Re-window with the active filter applied (a name substring match).
function applyView(): void {
  if (eventsVList === null) return;
  eventsVList.setItems(
    eventsFilter
      ? eventLog.filter((r) => r.name.toLowerCase().includes(eventsFilter))
      : eventLog,
  );
}

function makeRow(
  s: Readonly<Record<string, unknown>>,
  kind: "read" | "write",
  labels: Map<number, string>,
): EventRow {
  const id = s["id"] as number;
  const name = labels.get(id) ?? `#${id}`;
  const timeText = evTime(s["t"] as number);
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
      full: `${name} (read)`,
    };
  }
  const prevText = evFormat(s["prev"]);
  const nextText = evFormat(s["next"]);
  return {
    seq: rowSeq++,
    id,
    kind,
    timeText,
    name,
    prevText,
    prevCls: evValueClass(s["prev"]),
    nextText,
    nextCls: evValueClass(s["next"]),
    full: `${name}: ${prevText} → ${nextText}`,
  };
}

// id → label for the current snapshot, so an event shows its cell name (disposed cells fall back to
// their id). Off the hot path — it runs on the heartbeat only while this tab is active.
function labelMap(): Map<number, string> {
  const m = new Map<number, string>();
  for (const n of inspect().nodes) m.set(n.id, n.label);
  return m;
}

function evRender(item: EventRow, reuse: HTMLElement | null): HTMLElement {
  const row = reuse ?? evCreateRow();
  const kind = row.children[0] as HTMLElement;
  kind.textContent = item.kind === "read" ? "R" : "W";
  kind.className = `li-ev-kind li-ev-kind-${item.kind}`;
  (row.children[1] as HTMLElement).textContent = item.timeText;
  (row.children[2] as HTMLElement).textContent = item.name;
  const change = row.children[3] as HTMLElement;
  const prev = change.children[0] as HTMLElement;
  const arrow = change.children[1] as HTMLElement;
  const next = change.children[2] as HTMLElement;
  if (item.kind === "read") {
    prev.textContent = "";
    arrow.textContent = "";
    next.textContent = "";
  } else {
    prev.textContent = item.prevText;
    prev.className = `li-ev-val ${item.prevCls}`;
    arrow.textContent = " → ";
    next.textContent = item.nextText;
    next.className = `li-ev-val ${item.nextCls}`;
  }
  row.title = item.full; // hover shows the untruncated line
  row.dataset["id"] = String(item.id); // for hover-highlight (delegated on the scroll container)
  return row;
}

function evCreateRow(): HTMLElement {
  return (
    <div class="li-ev">
      <span class="li-ev-kind" />
      <span class="li-ev-time" />
      <span class="li-ev-name" />
      <span class="li-ev-change">
        <span class="li-ev-val" />
        <span class="li-ev-arrow" />
        <span class="li-ev-val" />
      </span>
    </div>
  ) as HTMLElement;
}

// Wall-clock minute:second.millis of the event — enough to order/correlate within a session.
function evTime(t: number): string {
  if (!t) return "";
  const d = new Date(t);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getMinutes())}:${p(d.getSeconds())}.${String(d.getMilliseconds()).padStart(3, "0")}`;
}

// Compact value display; full strings are kept (CSS ellipsis truncates them at the right edge),
// only capped against pathological lengths.
function evFormat(v: unknown): string {
  if (v === undefined) return "—";
  if (v === null) return "null";
  if (typeof v === "number")
    return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === "string")
    return v.length > VALUE_MAX ? `"${v.slice(0, VALUE_MAX)}…"` : `"${v}"`;
  if (typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.length}]`;
  if (typeof v === "object") return "{…}";
  return String(v);
}
function evValueClass(v: unknown): string {
  if (typeof v === "number") return "li-gv-num";
  if (typeof v === "string") return "li-gv-str";
  if (typeof v === "boolean") return "li-gv-bool";
  if (v === null || v === undefined) return "li-gv-nul";
  return "";
}
