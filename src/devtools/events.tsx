// Events tab: a live, newest-on-top stream of state mutations, read from the loom:write channel's
// *samples* view (id + prev→next per write — the channel ring holds the last 1024). On the panel
// heartbeat (~120ms) it drains the ring into a capped, newest-first log rendered through the
// windowing vlist; every write that reached the ring is shown in order. Click the list to pause
// (freeze it to read); click again to resume (the ring's last 1024 catch up). The panel drives it
// through four seams (buildEventsPane / renderEvents / showEvents / teardownEvents).
import { type Meter, meter } from "loom";
import { events, inspect } from "loom/observe";
import { type VirtualList, virtualList } from "../dom/vlist.js";

const EVENT_ROW_H = 22; // uniform row height (must match the .li-ev CSS)
const LOG_CAP = 1024; // the visible log depth — matches the loom:write ring (the last 1024 writes)

type EventRow = {
  readonly seq: number; // unique, monotonic — the vlist key (the log shifts as it prepends)
  readonly name: string;
  readonly prevText: string;
  readonly prevCls: string;
  readonly nextText: string;
  readonly nextCls: string;
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
    eventLog.unshift({
      seq: rowSeq++,
      name: labels.get(id) ?? `#${id}`,
      prevText: evFormat(s["prev"]),
      prevCls: evValueClass(s["prev"]),
      nextText: evFormat(s["next"]),
      nextCls: evValueClass(s["next"]),
    });
  }
  if (eventLog.length > LOG_CAP) eventLog.length = LOG_CAP; // drop oldest past the window
  eventsVList.setItems(eventLog);
}

// Tab shown: resync now so it isn't blank until the next heartbeat.
export function showEvents(): void {
  renderEvents();
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
  const kids = row.children;
  (kids[0] as HTMLElement).textContent = item.name;
  const prev = kids[1] as HTMLElement;
  prev.textContent = item.prevText;
  prev.className = `li-ev-val ${item.prevCls}`;
  const next = kids[3] as HTMLElement;
  next.textContent = item.nextText;
  next.className = `li-ev-val ${item.nextCls}`;
  return row;
}

function evCreateRow(): HTMLElement {
  return (
    <div class="li-ev">
      <span class="li-ev-name" />
      <span class="li-ev-val" />
      <span class="li-ev-arrow">→</span>
      <span class="li-ev-val" />
    </div>
  ) as HTMLElement;
}

// Compact value display, mirroring the graph's cells.
function evFormat(v: unknown): string {
  if (v === undefined) return "—";
  if (v === null) return "null";
  if (typeof v === "number")
    return Number.isInteger(v) ? String(v) : v.toFixed(2);
  if (typeof v === "string")
    return v.length > 16 ? `"${v.slice(0, 15)}…"` : `"${v}"`;
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
