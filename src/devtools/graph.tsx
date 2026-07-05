// Graph tab: a grouped tree of states/computeds (by fields() group) rendered through a windowing —
// only the on-screen rows are in the DOM, built lazily for the visible window (see gListSource).
// renderGraph() rebuilds the group structure on the heartbeat; rows update value + flash on change
// and outline their DOM node(s) on hover. fields() cells fold under a collapsible header; standalone
// cells at the root. Owns its module state; the panel drives it through five seams (buildGraphPane /
// renderGraphThrottled / showGraph / clearGraphHighlight / teardownGraph).
import type { State } from "loom";
import {
  type ListSource,
  type VirtualList,
  virtualList,
} from "loom/dom/virtual-list";
import type { InspectNode } from "loom/observe";
import { formatValue, valueClass } from "./format.js";
import {
  ICON_BOUND,
  ICON_CHEVRON,
  ICON_COMPUTED,
  ICON_LOCATE,
  ICON_UNBOUND,
  icon,
} from "./icons.js";
import { mirrorSync } from "./mirror.js";

const GRAPH_RENDER_MS = 300; // throttle the (heavy) graph reconcile below the 120ms heartbeat
const GRAPH_ROW_H = 22; // uniform graph row/header height (must match the .li-grow/.li-gns-h CSS)
const GRAPH_VALUE_MAX = 16; // string-value truncation budget in the (narrow) graph rows

type GraphItem =
  | {
      readonly kind: "header";
      readonly gid: number;
      readonly label: string;
      readonly count: number;
    }
  | {
      readonly kind: "cell";
      readonly node: InspectNode;
      readonly child: boolean;
    };
let graphVList: VirtualList<GraphItem> | null = null;
// Which mirror revisions this tab has rendered: skip everything when the world hasn't moved
// (gLastRevision) and skip the partition+sort when only values moved (gLastSetRevision).
let gLastRevision = -1;
let gLastSetRevision = -1;
let graphGroupsData: Array<{
  gid: number;
  label: string;
  cells: InspectNode[];
}> = [];
let graphSingles: InspectNode[] = [];
let gOverlays: HTMLElement[] = []; // active hover-highlight overlay boxes
let gEditing: HTMLInputElement | null = null; // the open in-place value editor, if any
let gEditingId = -1; // node id whose value is being edited (its row skips value updates)
let lastGraphRender = 0; // performance.now() of the last graph reconcile (see GRAPH_RENDER_MS)
// Flash suppression: when the graph tab is re-shown its values must resync without a flash burst
// (they changed unseen while hidden). gGraphJustShown gates the first render after show.
let gSuppressFlash = false;
let gGraphJustShown = false;
const graphCollapsed = new Set<number>();
let gRevealId = -1; // a cell to flash on its next render (set by revealCell, from the Trace tab)

export function buildGraphPane(): HTMLElement {
  graphVList = virtualList<GraphItem>({
    rowHeight: GRAPH_ROW_H,
    key: (it) => (it.kind === "header" ? `g${it.gid}` : it.node.id),
    render: gRender,
  });
  graphVList.el.classList.add("li-pane", "li-graph");
  return graphVList.el;
}

// A cell is "bound" (filled dot) when editing it would visibly change the UI — i.e. it drives at
// least one DOM node (element or text) downstream. Hollow means nothing in the DOM reflects it
// (read only by non-rendering computeds, or read by nothing).
function gBound(n: InspectNode): boolean {
  return gTargetsFor(n.id).length > 0;
}
// Parse an edited string back toward the previous value's type (the rest stay strings).
function gCoerce(input: string, prev: unknown): unknown {
  if (typeof prev === "number") {
    const n = Number(input);
    return Number.isNaN(n) ? prev : n;
  }
  return input;
}
// Editable = a state cell (has a writable source) holding a primitive.
function gEditable(n: InspectNode): boolean {
  if (n.kind !== "state" || !n.source) return false;
  const v = n.value;
  return (
    v === null ||
    typeof v === "number" ||
    typeof v === "string" ||
    typeof v === "boolean"
  );
}
// Paint a row's value cell (text + type colour), flashing on change. Skipped while the row's value
// is being edited (its <span> is detached into an <input>). prevVal lives on the element's dataset
// so flash fires only on a genuine change of an on-screen row, not on scroll-in.
// `silent` suppresses the change flash for self-initiated edits (the user just typed the value, so
// flashing it as "updated" is noise). It still writes dataset.prev, so the next render poll — which
// sees the now-current value — won't flash it either.
function gPaintVal(
  row: HTMLElement,
  value: unknown,
  id: number,
  silent = false,
): void {
  if (gEditingId === id) return;
  const val = row.querySelector(".li-gval") as HTMLElement | null;
  if (!val) return;
  const text = formatValue(value, GRAPH_VALUE_MAX);
  if (
    !silent &&
    !gSuppressFlash &&
    row.dataset["prev"] !== undefined &&
    row.dataset["prev"] !== text
  )
    gFlash(row);
  val.textContent = text;
  const edit = val.classList.contains("li-edit") ? " li-edit" : "";
  val.className = `li-gval${edit} ${valueClass(value)}`;
  row.dataset["prev"] = text;
}
// Open the in-place editor for a state cell: booleans toggle, others get an <input> that commits on
// Enter/blur (Escape cancels) and writes straight back to the live cell.
function gBeginEdit(
  id: number,
  cell: State<unknown>,
  val: HTMLElement,
  row: HTMLElement,
): void {
  const prev = cell();
  if (typeof prev === "boolean") {
    cell(!prev);
    gPaintVal(row, cell(), id, true);
    gReframe(id, row);
    return;
  }
  if (prev !== null && typeof prev !== "number" && typeof prev !== "string") {
    return; // value turned non-primitive since the handler was wired
  }
  const input = document.createElement("input");
  input.className = "li-gedit";
  input.value = typeof prev === "string" ? prev : String(prev);
  gEditing = input;
  gEditingId = id;
  val.replaceWith(input);
  input.focus();
  input.select();
  const restore = (): void => {
    gEditing = null;
    gEditingId = -1;
    if (input.parentNode) input.replaceWith(val);
  };
  const commit = (): void => {
    if (gEditing !== input) return;
    cell(gCoerce(input.value, prev));
    restore();
    gPaintVal(row, cell(), id, true);
    gReframe(id, row);
  };
  input.onblur = commit; // also fires when the row is scrolled out of the window
  input.onkeydown = (e) => {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") restore();
  };
}

// After a self-edit the cell may drive DOM whose size just changed; if the row is still hovered, its
// highlight overlay now frames the old bounds, so re-measure it (a no-op when the row isn't hovered).
function gReframe(id: number, row: HTMLElement): void {
  if (row.matches(":hover")) gPaint(gTargetsFor(id), true);
}

// Views aren't listed; instead, hovering a state/computed outlines every DOM node it drives — walk
// subscribers through computeds to the effects that write the DOM. A binding's target is an Element
// (attr/class/style/list) or a Text node (text binding); both count, so a cell that only feeds a
// text readout is still "bound" (editing it visibly changes the UI).
function gTargetsFor(id: number): Node[] {
  const nodes = mirrorSync().nodes;
  const out: Node[] = [];
  const seen = new Set<number>([id]);
  const start = nodes.get(id);
  const queue = start ? [...start.subs] : [];
  while (queue.length > 0) {
    const sid = queue.shift();
    if (sid === undefined || seen.has(sid)) continue;
    seen.add(sid);
    const node = nodes.get(sid);
    if (!node) continue;
    if (node.kind === "effect") {
      const t = node.target;
      if (t instanceof Element || t instanceof CharacterData) out.push(t);
    } else for (const s of node.subs) queue.push(s);
  }
  return out;
}
// Union of the downstream targets of every cell in a fields() group (hover the group header).
function gGroupTargets(gid: number): Node[] {
  const out: Node[] = [];
  const seen = new Set<Node>();
  for (const n of mirrorSync().nodes.values()) {
    if (n.group !== gid) continue;
    for (const t of gTargetsFor(n.id))
      if (!seen.has(t)) {
        seen.add(t);
        out.push(t);
      }
  }
  return out;
}
// The on-screen rect of a target: an element's box, or a text node's rendered bounds (via a Range,
// since a Text node has no getBoundingClientRect).
function gRect(t: Node): DOMRect | null {
  if (!t.isConnected) return null;
  if (t instanceof Element) return t.getBoundingClientRect();
  const range = document.createRange();
  range.selectNode(t);
  return range.getBoundingClientRect();
}
// Highlight via fixed overlay boxes (not `outline`, which follows the target's border-radius in
// modern browsers) so the marker is always a sharp rectangle. Transient: it tracks a hover.
function gPaint(targets: Node[], on: boolean): void {
  for (const o of gOverlays) o.remove();
  gOverlays = [];
  if (!on) return;
  for (const t of targets) {
    const r = gRect(t);
    if (!r || (r.width === 0 && r.height === 0)) continue;
    const o = document.createElement("div");
    o.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`;
    document.body.append(o);
    gOverlays.push(o);
  }
}
// Outline the DOM node(s) a given cell drives — for callers outside the graph (the Trace tab).
// Freshness comes from the shared mirror (gTargetsFor pulls it): sweeping the pointer down the
// trace list costs a meter read per row, not a snapshot. clearGraphHighlight() removes the overlay.
export function highlightCell(id: number): void {
  gPaint(gTargetsFor(id), true);
}
function gFlash(row: HTMLElement): void {
  row.classList.remove("li-flash");
  void row.offsetWidth; // reflow so the animation restarts even on rapid updates
  row.classList.add("li-flash");
}
// Scroll the first of these DOM targets into view, then re-assert the highlight at the settled
// position (the fixed overlays are stale after a scroll). It is not auto-cleared — the hover that
// owns it (mouseleave on the header) does that — so it persists while the row stays hovered.
// `stillActive` guards the late repaint from firing after the pointer has already left.
function gScrollToTargets(targets: Node[], stillActive: () => boolean): void {
  const t = targets[0];
  const el = t instanceof Element ? t : (t?.parentElement ?? null);
  if (!el) return;
  gPaint([], false); // drop the now-stale overlay while scrolling
  el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" });
  let done = false;
  const settle = (): void => {
    if (done) return;
    done = true;
    window.removeEventListener("scrollend", settle);
    if (stillActive()) gPaint(targets, true);
  };
  window.addEventListener("scrollend", settle);
  window.setTimeout(settle, 600); // fallback: scrollend may not fire (already in view / unsupported)
}

// A group's display name: the fields() label prefix ("card 3" from "card 3.title"), else anonymous.
function gGroupLabel(gid: number, cells: InspectNode[]): string {
  const first = cells[0];
  const dot = first ? first.label.lastIndexOf(".") : -1;
  return first && dot > 0 ? first.label.slice(0, dot) : `fields #${gid}`;
}

/* ---- virtual-list row renderers (create when reuse is null, else update in place) ---- */

function gRender(item: GraphItem, reuse: HTMLElement | null): HTMLElement {
  if (item.kind === "header")
    return reuse ? gUpdateHeader(reuse, item) : gCreateHeader(item);
  const row = reuse ? gUpdateCell(reuse, item) : gCreateCell(item);
  if (item.node.id === gRevealId) {
    gFlash(row); // a jump from the Trace tab — flash the revealed cell
    gRevealId = -1;
  }
  return row;
}

function gCreateHeader(item: GraphItem & { kind: "header" }): HTMLElement {
  const count = (
    <span class="li-gns-c">{`(${item.count})`}</span>
  ) as HTMLElement;
  const labelEl = <span class="li-gns-lbl">{item.label}</span>;
  const chev = icon(ICON_CHEVRON, 11);
  chev.classList.add("li-chev");
  // Locate button: scrolls the group's rendered output into view. A span (not the bare svg, which is
  // pointer-events:none) so it catches the click; stopPropagation keeps it from toggling collapse.
  const locate = (
    <span class="li-glocate" title="Scroll into view" />
  ) as HTMLElement;
  locate.append(icon(ICON_LOCATE, 11));
  const header = (
    <div class="li-gns-h">
      {chev}
      {labelEl}
      {count}
      {locate}
    </div>
  ) as HTMLElement;
  const gid = item.gid;
  if (graphCollapsed.has(gid)) header.classList.add("collapsed");
  header.onclick = () => {
    if (graphCollapsed.has(gid)) graphCollapsed.delete(gid);
    else graphCollapsed.add(gid);
    graphVList?.setItems(gListSource());
  };
  locate.onclick = (e) => {
    e.stopPropagation();
    gScrollToTargets(gGroupTargets(gid), () => header.matches(":hover"));
  };
  header.onmouseenter = () => gPaint(gGroupTargets(gid), true);
  header.onmouseleave = () => gPaint(gGroupTargets(gid), false);
  return header;
}
function gUpdateHeader(
  header: HTMLElement,
  item: GraphItem & { kind: "header" },
): HTMLElement {
  const c = header.querySelector(".li-gns-c");
  if (c) c.textContent = `(${item.count})`;
  const l = header.querySelector(".li-gns-lbl");
  if (l) l.textContent = item.label;
  header.classList.toggle("collapsed", graphCollapsed.has(item.gid));
  return header;
}

function gCreateCell(item: GraphItem & { kind: "cell" }): HTMLElement {
  const n = item.node;
  const val = <span class="li-gval" />;
  const bound = gBound(n);
  const ic = icon(
    n.kind === "computed" ? ICON_COMPUTED : bound ? ICON_BOUND : ICON_UNBOUND,
    13,
  );
  ic.classList.add(
    "li-gicon",
    !bound
      ? "li-gi-dim"
      : n.kind === "computed"
        ? "li-gi-computed"
        : "li-gi-state",
  );
  const labelText = item.child ? (n.key ?? n.label) : n.label;
  const row = (
    <div class="li-grow">
      {ic}
      <span class="li-glabel">{labelText}</span>
      {val}
    </div>
  ) as HTMLElement;
  if (item.child) row.classList.add("li-grow-child");
  row.onmouseenter = () => gPaint(gTargetsFor(n.id), true);
  row.onmouseleave = () => gPaint(gTargetsFor(n.id), false);
  if (gEditable(n) && n.source) {
    val.classList.add("li-edit");
    const cell = n.source;
    val.onclick = () => gBeginEdit(n.id, cell, val, row);
  }
  gPaintVal(row, n.value, n.id);
  return row;
}
function gUpdateCell(
  row: HTMLElement,
  item: GraphItem & { kind: "cell" },
): HTMLElement {
  gPaintVal(row, item.node.value, item.node.id);
  return row;
}

// The visible row list as a lazy source for the vlist: it needs only the total count (for scroll
// height) plus random access to the viewport rows, so items are built on demand for the ~25 visible
// rows rather than materialising the whole tree each tick. Honours collapse state.
function gListLength(): number {
  let n = graphSingles.length;
  for (const g of graphGroupsData)
    n += 1 + (graphCollapsed.has(g.gid) ? 0 : g.cells.length);
  return n;
}

function gItemAt(index: number): GraphItem | undefined {
  let i = index;
  for (const g of graphGroupsData) {
    if (i === 0)
      return {
        kind: "header",
        gid: g.gid,
        label: g.label,
        count: g.cells.length,
      };
    i -= 1; // the header
    if (!graphCollapsed.has(g.gid)) {
      if (i < g.cells.length)
        return { kind: "cell", node: g.cells[i] as InspectNode, child: true };
      i -= g.cells.length;
    }
  }
  return i < graphSingles.length
    ? { kind: "cell", node: graphSingles[i] as InspectNode, child: false }
    : undefined;
}

function gListSource(): ListSource<GraphItem> {
  return { length: gListLength(), at: gItemAt };
}

function renderGraph(): void {
  if (!graphVList) return;
  const sync = mirrorSync();
  // The world hasn't moved since the last render: two meter counts are the whole cost.
  if (!gGraphJustShown && sync.revision === gLastRevision) return;
  const setChanged = sync.setRevision !== gLastSetRevision;
  gLastRevision = sync.revision;
  gLastSetRevision = sync.setRevision;

  if (setChanged) {
    // Nodes were created/disposed: rebuild the group structure. The tree holds active state +
    // computed cells only (subscriber-less cells and ghosts are dropped, matching the old
    // inspect({ active: true }) filter); views (effects) are reached by hover, not listed.
    const groups = new Map<number, InspectNode[]>();
    const singles: InspectNode[] = [];
    for (const n of sync.nodes.values()) {
      if (n.internal || n.kind === "effect" || n.subs.length === 0) continue;
      if (n.group !== undefined) {
        const arr = groups.get(n.group);
        if (arr) arr.push(n);
        else groups.set(n.group, [n]);
      } else singles.push(n);
    }
    graphGroupsData = [];
    for (const [gid, cells] of groups) {
      cells.sort((a, b) => (a.key ?? a.label).localeCompare(b.key ?? b.label));
      graphGroupsData.push({ gid, label: gGroupLabel(gid, cells), cells });
    }
    graphSingles = singles;
  } else {
    // Same node set, fresh values: swap in the new snapshot objects, keeping structure and order.
    for (const g of graphGroupsData) {
      g.cells = g.cells.map((n) => sync.nodes.get(n.id) ?? n);
    }
    graphSingles = graphSingles.map((n) => sync.nodes.get(n.id) ?? n);
  }
  // First render after the tab was re-shown: resync values without flashing (they changed unseen).
  gSuppressFlash = gGraphJustShown;
  graphVList.setItems(gListSource());
  gSuppressFlash = false;
  gGraphJustShown = false;
}

/* ---- seams the panel drives ---- */

// Drop any lingering hover-highlight overlay (the panel calls this when leaving the graph tab).
export function clearGraphHighlight(): void {
  gPaint([], false);
}

// Throttle the heavy graph walk below the heartbeat (the inspect() walk is the costly part).
export function renderGraphThrottled(): void {
  const now = performance.now();
  if (now - lastGraphRender >= GRAPH_RENDER_MS) {
    lastGraphRender = now;
    renderGraph();
  }
}

// Graph tab became visible: CSS animations pause under display:none and resume when shown, so strip
// any half-played flash and suppress the first render's flash burst, then re-window at the restored
// scroll position.
export function showGraph(): void {
  if (!graphVList) return;
  for (const r of graphVList.el.querySelectorAll(".li-flash"))
    r.classList.remove("li-flash");
  gGraphJustShown = true;
  graphVList.refresh();
}

// The flat index of a cell in the rendered tree, expanding its group if it's collapsed.
function gIndexOf(id: number): number {
  let i = 0;
  for (const g of graphGroupsData) {
    const ci = g.cells.findIndex((c) => c.id === id);
    if (ci >= 0) {
      if (graphCollapsed.has(g.gid)) {
        graphCollapsed.delete(g.gid);
        graphVList?.setItems(gListSource());
      }
      return i + 1 + ci; // +1 for the group header
    }
    i += 1 + (graphCollapsed.has(g.gid) ? 0 : g.cells.length);
  }
  const si = graphSingles.findIndex((c) => c.id === id);
  return si >= 0 ? i + si : -1;
}

// Jump the graph to a cell — used by the Trace tab's clickable name. Rebuilds the tree so the cell
// is current, expands its group if needed, scrolls it to centre, and flashes it on render.
export function revealCell(id: number): void {
  if (graphVList === null) return;
  renderGraph();
  const index = gIndexOf(id);
  if (index < 0) return;
  gRevealId = id;
  graphVList.scrollToIndex(index);
}

// Tear down the graph tab's DOM and state (from unmountInspector).
export function teardownGraph(): void {
  for (const o of gOverlays) o.remove();
  gOverlays = [];
  gEditing = null;
  gEditingId = -1;
  graphVList?.destroy();
  graphVList = null;
  graphGroupsData = [];
  graphSingles = [];
  graphCollapsed.clear();
  gLastRevision = -1;
  gLastSetRevision = -1;
}
