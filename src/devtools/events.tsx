// Events tab: a live, newest-on-top stream of state mutations, read from the loom:write channel's
// *samples* view (timestamp + id + prev→next per write — the channel ring holds the last 1024). On
// the panel heartbeat (~120ms) it drains the ring into a capped, newest-first log rendered through
// the windowing vlist; every write that reached the ring is shown in order. Click the list to pause
// (freeze it to read); click again to resume (the ring's last 1024 catch up). The panel drives it
// through four seams (buildEventsPane / renderEvents / showEvents / teardownEvents).
import { type Meter, meter } from "loom";
import { events, inspect } from "loom/observe";
import { type VirtualList, virtualList } from "../dom/vlist.js";

const EVENT_ROW_H = 22; // uniform row height (must match the .li-ev CSS)
const LOG_CAP = 1024; // the visible log depth — matches the loom:write ring (the last 1024 writes)
const VALUE_MAX = 200; // cap a recorded value's text so a giant string can't bloat the DOM/tooltip

type EventRow = {
  readonly seq: number; // unique, monotonic — the vlist key (the log shifts as it prepends)
  readonly timeText: string;
  readonly name: string;
  readonly prevText: string;
  readonly prevCls: string;
  readonly nextText: string;
  readonly nextCls: string;
  readonly full: string; // untruncated line, for the hover title
};

let eventsVList: VirtualList<EventRow> | null = null;
let eventsMeter: Meter | null = null;
let eventLog: EventRow[] = []; // newest-first, capped at LOG_CAP
let eventsPaused = false;
let rowSeq = 0; // monotonic key source

export function buildEventsPane(): HTMLElement {
  eventsMeter = meter([events.write], "samples"); // the records view of the write instrument
  eventsVList = virtualList<EventRow>({
    rowHeight: EVENT_ROW_H,
    key: (r) => r.seq,
    render: evRender,
  });
  eventsVList.el.classList.add("li-pane", "li-events");
  // Click anywhere toggles pause — the way to actually read a fast stream (freeze, then scroll).
  eventsVList.el.addEventListener("click", () => {
    eventsPaused = !eventsPaused;
    eventsVList?.el.classList.toggle("li-ev-paused", eventsPaused);
    if (!eventsPaused) renderEvents(); // resume: catch up immediately
  });
  return eventsVList.el;
}

// Drain the write ring into the log (newest-first) and re-window. Called on the heartbeat while the
// tab is active; a no-op while paused (the ring still holds the last 1024, so resume catches up).
export function renderEvents(): void {
  if (eventsPaused || eventsMeter === null || eventsVList === null) return;
  const samples = eventsMeter.read()["loom:write"]?.samples;
  if (!samples || samples.length === 0) return;
  const labels = labelMap();
  for (const s of samples) {
    const id = s["id"] as number;
    const name = labels.get(id) ?? `#${id}`;
    const prevText = evFormat(s["prev"]);
    const nextText = evFormat(s["next"]);
    eventLog.unshift({
      seq: rowSeq++,
      timeText: evTime(s["t"] as number),
      name,
      prevText,
      prevCls: evValueClass(s["prev"]),
      nextText,
      nextCls: evValueClass(s["next"]),
      full: `${name}: ${prevText} → ${nextText}`,
    });
  }
  if (eventLog.length > LOG_CAP) eventLog.length = LOG_CAP; // drop oldest past the window
  eventsVList.setItems(eventLog);
}

// Tab shown: re-window for the now-visible pane (the vlist no-ops reconciles while hidden), then once
// more next frame — the first reconcile can race the layout of the just-un-hidden pane, which would
// otherwise leave the top rows blank until a scroll nudged it.
export function showEvents(): void {
  renderEvents();
  eventsVList?.setItems(eventLog);
  requestAnimationFrame(() => eventsVList?.refresh());
}

export function teardownEvents(): void {
  eventsMeter?.stop();
  eventsMeter = null;
  eventsVList = null;
  eventLog = [];
  eventsPaused = false;
}

// id → label for the current snapshot, so a write shows its cell name (disposed cells fall back to
// their id). Off the hot path — it runs on the heartbeat only while this tab is active.
function labelMap(): Map<number, string> {
  const m = new Map<number, string>();
  for (const n of inspect().nodes) m.set(n.id, n.label);
  return m;
}

function evRender(item: EventRow, reuse: HTMLElement | null): HTMLElement {
  const row = reuse ?? evCreateRow();
  (row.children[0] as HTMLElement).textContent = item.timeText;
  (row.children[1] as HTMLElement).textContent = item.name;
  const change = row.children[2] as HTMLElement;
  const prev = change.children[0] as HTMLElement;
  prev.textContent = item.prevText;
  prev.className = `li-ev-val ${item.prevCls}`;
  const next = change.children[2] as HTMLElement;
  next.textContent = item.nextText;
  next.className = `li-ev-val ${item.nextCls}`;
  row.title = item.full; // hover shows the untruncated line
  return row;
}

function evCreateRow(): HTMLElement {
  return (
    <div class="li-ev">
      <span class="li-ev-time" />
      <span class="li-ev-name" />
      <span class="li-ev-change">
        <span class="li-ev-val" />
        <span class="li-ev-arrow"> → </span>
        <span class="li-ev-val" />
      </span>
    </div>
  ) as HTMLElement;
}

// Wall-clock minute:second.millis of the write — enough to order/correlate within a session.
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
