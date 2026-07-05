// Floating dev inspector for Loom apps. Dogfoods Loom: the panel is built with Loom JSX (incl.
// SVG) and every live value is a Loom effect. It is a strict no-op until mountInspector() runs —
// no observers, timers, or DOM exist before that, and unmountInspector() tears everything down.
//
// All of the inspector's own reactive bindings and UI state are created `internal`, so Loom's
// observability filters them out: the inspector measures the app, never itself.
import { configure, type Scope, type State, scope, state } from "loom";
import { scrollFade, tap } from "loom/dom";
import { bind, disposeBindings, PANEL_OPTS } from "./bindings.js";
import { CSS, PANEL_ID } from "./css.js";
import {
  buildGraphPane,
  clearGraphHighlight,
  revealCell,
  showGraph,
  teardownGraph,
} from "./graph.js";
import {
  elementFromMarkup,
  ICON_MAXIMIZE,
  ICON_MINIMIZE,
  ICON_MONITOR,
  ICON_MOON,
  ICON_SETTINGS,
  ICON_SUN,
  loomLogo,
  svgMarkup,
} from "./icons.js";
import { pauseStats, resumeStats, stopStats, wireStats } from "./stats.js";
import {
  buildTracePane,
  setTraceActive,
  setTraceLiveDot,
  setTraceLocate,
  setTraceWindow,
  showTrace,
  teardownTrace,
} from "./trace.js";

type Theme = "system" | "light" | "dark";
const THEME_ICONS: Record<Theme, string> = {
  system: ICON_MONITOR,
  light: ICON_SUN,
  dark: ICON_MOON,
};

/* ============================================================ module state ========= */

export type TabId = "stats" | "graph" | "trace";
const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: "stats", label: "Info" },
  { id: "graph", label: "Graph" },
  { id: "trace", label: "Trace" },
];

let panel: HTMLElement | null = null;
let menuEl: HTMLElement | null = null;
let bodyEl: HTMLElement | null = null;
let closeMenuOnOutside: ((e: Event) => void) | null = null;
const scrollFades: Array<() => void> = [];
// Scopes for collective pause: the whole panel (paused when minimized) and, nested inside it, the
// stats tab (paused when it isn't the active tab) — so a hidden subtree does no reactive work.
let inspectorScope: Scope | null = null;

// Inspector-owned UI state (internal: filtered from observation). Lazily created on first mount.
let ui: State<TabId> | null = null;
// Per-tab body scroll position, preserved across tab switches (the panes share one scroller, so
// switching otherwise clobbers it as the content height changes).
const scrollByTab = new Map<TabId, number>();
let prevTab: TabId | null = null;

/* ============================================================ persistence ========== */

function lsGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
function lsSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* localStorage unavailable */
  }
}

const THEME_KEY = `${PANEL_ID}-theme`;
const MIN_KEY = `${PANEL_ID}-min`;
const POS_KEY = `${PANEL_ID}-pos`;
const SIZE_KEY = `${PANEL_ID}-size`;
const LOGSIZE_KEY = `${PANEL_ID}-logsize`;
const LOG_SIZES = [1000, 5000, 25000];

function loadTheme(): Theme {
  const t = lsGet(THEME_KEY);
  return t === "light" || t === "dark" || t === "system" ? t : "system";
}
function loadLogSize(): number {
  const n = Number(lsGet(LOGSIZE_KEY));
  return LOG_SIZES.includes(n) ? n : 1000;
}
// A persisted numeric record (panel position/size): every named field must parse as a number, else
// null (missing, malformed JSON, or a clobbered value all fall back to the defaults).
function loadNumbers<K extends string>(
  storageKey: string,
  keys: readonly K[],
): Record<K, number> | null {
  const raw = lsGet(storageKey);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    const out = {} as Record<K, number>;
    for (const key of keys) {
      if (typeof v?.[key] !== "number") return null;
      out[key] = v[key];
    }
    return out;
  } catch {
    /* malformed */
  }
  return null;
}
let panelPos = loadNumbers(POS_KEY, ["left", "top"]);
let panelSize = loadNumbers(SIZE_KEY, ["width", "height"]);

/* ============================================================ chrome helpers ======= */

// Snap a CSS-pixel value to the device-pixel grid. The panel is positioned/sized via JS during
// drag and resize; a fractional device-pixel origin makes the browser re-round the panel's
// content (notably the SVG icons) frame to frame, so they shimmer/jitter left-right. Snapping
// the panel to whole device pixels keeps every child pixel-aligned.
function snapPx(v: number): number {
  const dpr = window.devicePixelRatio || 1;
  return Math.round(v * dpr) / dpr;
}

function clampPanel(
  target: HTMLElement,
  barH: number,
  left: number,
  top: number,
): { left: number; top: number } {
  const w = target.offsetWidth;
  const edge = Math.min(80, w);
  return {
    left: snapPx(Math.min(window.innerWidth - edge, Math.max(edge - w, left))),
    top: snapPx(Math.min(window.innerHeight - barH, Math.max(0, top))),
  };
}

function clampOnScreen(
  target: HTMLElement,
  left: number,
  top: number,
): { left: number; top: number } {
  const maxLeft = Math.max(0, window.innerWidth - target.offsetWidth);
  const maxTop = Math.max(0, window.innerHeight - target.offsetHeight);
  return {
    left: snapPx(Math.max(0, Math.min(left, maxLeft))),
    top: snapPx(Math.max(0, Math.min(top, maxTop))),
  };
}

function bindPointerDrag(
  handle: HTMLElement,
  onMove: (event: PointerEvent) => void,
  onUp: () => void,
): () => void {
  handle.addEventListener("pointermove", onMove);
  handle.addEventListener("pointerup", onUp);
  handle.addEventListener("pointercancel", onUp);
  return () => {
    handle.removeEventListener("pointermove", onMove);
    handle.removeEventListener("pointerup", onUp);
    handle.removeEventListener("pointercancel", onUp);
  };
}

// The shared pointer-gesture session behind drag and resize: snapshot the rect, pin the panel to
// left/top positioning (dragging/resizing can't work against right/bottom anchoring), capture the
// pointer, and freeze text selection for the duration. `onMove` gets the pointerdown-time rect to do
// its per-gesture math against; `onCommit` runs on release (persist the result, restore cursor).
function startDragSession(
  handle: HTMLElement,
  target: HTMLElement,
  e: PointerEvent,
  onMove: (ev: PointerEvent, rect: DOMRect) => void,
  onCommit: () => void,
): void {
  const rect = target.getBoundingClientRect();
  target.style.left = `${snapPx(rect.left)}px`;
  target.style.top = `${snapPx(rect.top)}px`;
  target.style.right = "auto";
  target.style.bottom = "auto";
  handle.setPointerCapture?.(e.pointerId);
  const prevUserSelect = document.body.style.userSelect;
  document.body.style.userSelect = "none";
  let unbindDrag = (): void => {};
  const onUp = (): void => {
    handle.releasePointerCapture?.(e.pointerId);
    document.body.style.userSelect = prevUserSelect;
    onCommit();
    unbindDrag();
  };
  unbindDrag = bindPointerDrag(handle, (ev) => onMove(ev, rect), onUp);
}

function makeDraggable(handle: HTMLElement, target: HTMLElement): void {
  handle.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement | null)?.closest("button")) return;
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    handle.style.cursor = "grabbing";
    startDragSession(
      handle,
      target,
      e,
      (ev, rect) => {
        const { left, top } = clampPanel(
          target,
          handle.offsetHeight || 40,
          rect.left + ev.clientX - startX,
          rect.top + ev.clientY - startY,
        );
        target.style.left = `${left}px`;
        target.style.top = `${top}px`;
        panelPos = { left, top };
      },
      () => {
        handle.style.cursor = "";
        if (panelPos) lsSet(POS_KEY, JSON.stringify(panelPos));
      },
    );
  });
}

function makeResizable(handle: HTMLElement, target: HTMLElement): void {
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startY = e.clientY;
    startDragSession(
      handle,
      target,
      e,
      (ev, rect) => {
        const w = snapPx(
          Math.max(
            240,
            Math.min(
              window.innerWidth - rect.left - 8,
              rect.width + ev.clientX - startX,
            ),
          ),
        );
        const h = snapPx(
          Math.max(
            160,
            Math.min(
              window.innerHeight - rect.top - 8,
              rect.height + ev.clientY - startY,
            ),
          ),
        );
        target.style.width = `${w}px`;
        target.style.height = `${h}px`;
        panelSize = { width: w, height: h };
      },
      () => {
        if (panelSize) lsSet(SIZE_KEY, JSON.stringify(panelSize));
      },
    );
  });
}

/* ============================================================ SVG widgets ========== */

// Bar-button icon: the <svg> fills the button's content box and the 24-unit glyph is inset via
// the viewBox to ~14px visual. A small centered svg *box* leaves margins that round to
// sub-device-pixels on scaled displays (fractional DPR), making the icon's gap shimmer in
// Safari; filling the box removes the gap and centers the glyph in resolution-independent SVG
// space instead. (24px content box · 24/14 ⇒ viewBox side 41.143, inset 8.571.)
function barIcon(inner: string): Element {
  return elementFromMarkup(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`,
  );
}

/* ============================================================ mount / unmount ====== */

/** Mount the floating inspector panel (dev only). Idempotent; a no-op until called. */
export function mountInspector(target: Element = document.body): void {
  if (panel || typeof document === "undefined") return;

  // Inspection is opt-in and off by default; mounting the panel is the explicit request for it, so
  // turn it on. Only nodes created from here on carry metadata — enable earlier (configure({ inspect:
  // true }) at startup) if you want pre-existing nodes in the census too.
  configure({ inspect: true });

  if (!document.getElementById(`${PANEL_ID}-css`)) {
    const style = document.createElement("style");
    style.id = `${PANEL_ID}-css`;
    style.textContent = CSS;
    document.head.append(style);
  }

  ui = state<TabId>("stats", PANEL_OPTS);

  let theme = loadTheme();
  const themeVal = <span class="li-menu-val" />;
  const applyTheme = (): void => {
    panel?.setAttribute("data-theme", theme);
    menuEl?.setAttribute("data-theme", theme);
    themeVal.innerHTML = svgMarkup(THEME_ICONS[theme], 13);
    themeItem.title = `Theme: ${theme} (click to cycle)`;
  };
  const themeItem = (
    <button type="button" class="li-menu-item" title="Click to change theme">
      <span>Theme</span>
      {themeVal}
    </button>
  ) as HTMLButtonElement;
  tap(themeItem, (): void => {
    const order: Theme[] = ["system", "light", "dark"];
    theme = order[(order.indexOf(theme) + 1) % order.length] ?? "system";
    lsSet(THEME_KEY, theme);
    applyTheme();
  });
  const menu = <div class="li-menu" hidden />;
  menu.id = `${PANEL_ID}-menu`;
  menu.append(themeItem);
  menuEl = menu;

  // Trace-log window size — cycle 1k / 5k / 25k (how many events the Trace tab keeps).
  let logSize = loadLogSize();
  const sizeVal = <span class="li-menu-val" />;
  const applyLogSize = (): void => {
    sizeVal.textContent = `${logSize / 1000}k`;
    setTraceWindow(logSize);
  };
  const sizeItem = (
    <button
      type="button"
      class="li-menu-item"
      title="Trace log size (click to cycle)"
    >
      <span>Log size</span>
      {sizeVal}
    </button>
  ) as HTMLButtonElement;
  tap(sizeItem, (): void => {
    logSize =
      LOG_SIZES[(LOG_SIZES.indexOf(logSize) + 1) % LOG_SIZES.length] ?? 1000;
    lsSet(LOGSIZE_KEY, String(logSize));
    applyLogSize();
  });
  menu.append(sizeItem);
  applyLogSize();
  const closeMenu = (): void => {
    menu.hidden = true;
  };
  const hideItem = (
    <button
      type="button"
      class="li-menu-item"
      title="Hide the inspector (⌃⌘L toggles)"
    >
      <span>Hide</span>
      <span class="li-kbd">⌃⌘L</span>
    </button>
  ) as HTMLButtonElement;
  tap(hideItem, (): void => {
    closeMenu();
    unmountInspector();
  });
  menu.append(hideItem);

  const gear = (<button type="button" title="Settings" />) as HTMLButtonElement;
  gear.append(barIcon(ICON_SETTINGS));
  tap(gear, (e): void => {
    e.stopPropagation();
    if (!menu.hidden) {
      closeMenu();
      return;
    }
    menu.hidden = false;
    // Anchor below-left of the gear, then keep the menu on screen: right-align to the gear if it
    // would overflow the right edge, and flip above if it would overflow the bottom.
    const r = gear.getBoundingClientRect();
    const m = menu.getBoundingClientRect();
    const margin = 8;
    let left = r.left;
    if (left + m.width > window.innerWidth - margin) left = r.right - m.width;
    let top = r.bottom;
    if (top + m.height > window.innerHeight - margin) top = r.top - m.height;
    menu.style.left = `${Math.max(margin, left)}px`;
    menu.style.top = `${Math.max(margin, top)}px`;
  });

  const min = (<button type="button" />) as HTMLButtonElement;
  const paintMin = (isMin: boolean): void => {
    min.title = isMin ? "Expand" : "Collapse";
    min.replaceChildren(barIcon(isMin ? ICON_MAXIMIZE : ICON_MINIMIZE));
  };
  const startMin = lsGet(MIN_KEY) === "1";
  paintMin(startMin);
  tap(min, (): void => {
    const isMin = !!panel?.classList.toggle("li-min");
    paintMin(isMin);
    lsSet(MIN_KEY, isMin ? "1" : "0");
    // Freeze (or thaw) the panel's reactivity while collapsed.
    if (isMin) inspectorScope?.pause();
    else inspectorScope?.resume();
    setTraceActive(!isMin && ui?.() === "trace"); // detach/re-attach the trace meters with minimize
  });

  const brand = (
    <span class="li-brand">
      {loomLogo(15)}
      <b>Loom</b>
    </span>
  );
  const bar = (
    <div class="li-bar">
      {brand}
      <span class="li-sp" />
      {gear}
      {min}
    </div>
  );

  // Build the reactive UI inside the inspector scope so minimizing can pause the whole panel; the
  // stats pane gets its own nested scope so switching tabs pauses just it. The scope's options
  // mark everything created inside as internal/PANEL_ID — so the heartbeat, vitals, heap timer and
  // bindings inherit them without repeating the opts. Resources live in the scope that owns them:
  // the heartbeat in the panel scope (it pauses only on minimize), the vitals + heap timer in the
  // stats scope (they feed only the stats tab, so their observers/timer suspend when it's hidden
  // and reconnect — buffered — on return).
  // Definite-assignment: scope() runs its callback synchronously (see loom's scope()), so it is
  // assigned before the scope() call returns and before it's read below.
  let statsPane!: HTMLElement;
  inspectorScope = scope(() => {
    statsPane = wireStats({
      activeTab: () => ui?.(),
      isMinimized: () => panel?.classList.contains("li-min") ?? false,
    });
  }, PANEL_OPTS);
  if (startMin) inspectorScope.pause();

  // Panes: Info (stats), Graph, and Trace are each their own module.
  const panes = new Map<TabId, HTMLElement>();
  const tabBtns = new Map<TabId, HTMLElement>();
  bodyEl = <div class="li-body" />;
  for (const t of TABS) {
    const pane =
      t.id === "stats"
        ? statsPane
        : t.id === "graph"
          ? buildGraphPane()
          : buildTracePane();
    panes.set(t.id, pane);
    bodyEl.append(pane);
  }
  // Clicking a trace row's name jumps to that cell in the Graph tab (the panel owns tab state).
  setTraceLocate((id): void => {
    ui?.("graph");
    revealCell(id);
  });

  const tabscroll = <div class="li-tabscroll" />;
  for (const t of TABS) {
    const btn = (
      <button type="button" class="li-tab">
        {t.label}
      </button>
    ) as HTMLButtonElement;
    if (t.id === "trace") {
      // Live indicator lives on the Trace tab, so it's visible from any tab.
      const dot = (
        <span class="li-tr-live" title="Live — capturing" />
      ) as HTMLElement;
      btn.append(dot);
      setTraceLiveDot(dot);
    }
    tap(btn, (): void => ui?.(t.id));
    tabBtns.set(t.id, btn);
    tabscroll.append(btn);
  }
  const tabs = <div class="li-tabs">{tabscroll}</div>;

  const resize = (
    <div class="li-resize" title="Drag to resize">
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="M18 10 A8 8 0 0 1 10 18" />
      </svg>
    </div>
  ) as HTMLElement;
  panel = (
    <div>
      {bar}
      {tabs}
      {bodyEl}
      {resize}
    </div>
  ) as HTMLElement;
  panel.id = PANEL_ID;
  if (startMin) panel.classList.add("li-min");
  applyTheme();

  makeDraggable(bar, panel);
  makeResizable(resize, panel);
  closeMenuOnOutside = (e: Event): void => {
    const target = e.target instanceof Node ? e.target : null;
    if (
      !menu.hidden &&
      (target === null || !menu.contains(target)) &&
      e.target !== gear
    )
      closeMenu();
  };
  document.addEventListener("pointerdown", closeMenuOnOutside);

  target.append(panel);
  document.body.append(menu);

  if (panelSize) {
    panel.style.width = `${Math.max(240, Math.min(panelSize.width, window.innerWidth - 16))}px`;
    panel.style.height = `${Math.max(160, Math.min(panelSize.height, window.innerHeight - 16))}px`;
  }
  if (panelPos) {
    const { left, top } = clampOnScreen(panel, panelPos.left, panelPos.top);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
    panel.style.right = "auto";
    panel.style.bottom = "auto";
  }

  // Reactive tab switching (dogfood: ui -> pane visibility + active styling).
  bind(() => {
    const tab = ui?.();
    // Save the outgoing tab's scroll before its pane is hidden (heights differ per tab).
    if (prevTab && prevTab !== tab && bodyEl)
      scrollByTab.set(prevTab, bodyEl.scrollTop);
    // Suspend the stats pane's bindings whenever its tab isn't the visible one.
    if (tab === "stats") resumeStats();
    else pauseStats();
    if (tab !== "graph") clearGraphHighlight(); // drop any lingering hover highlight
    for (const t of TABS) {
      const on = t.id === tab;
      const pane = panes.get(t.id);
      const btn = tabBtns.get(t.id);
      if (pane) pane.style.display = on ? "" : "none";
      if (btn) {
        btn.classList.toggle("active", on);
        // Scroll a partially-hidden active tab fully into view (overflowing tab strip).
        if (on)
          btn.scrollIntoView({
            inline: "nearest",
            block: "nearest",
            behavior: "smooth",
          });
      }
    }
    // Restore the incoming tab's scroll now its pane is laid out (its content height is back).
    // The content may have shrunk while we were away (e.g. the graph lost rows), so clamp the saved
    // offset to the current valid range rather than letting it sit out of bounds.
    if (tab && bodyEl) {
      const saved = scrollByTab.get(tab) ?? 0;
      const max = Math.max(0, bodyEl.scrollHeight - bodyEl.clientHeight);
      bodyEl.scrollTop = Math.min(saved, max);
      if (tab === "graph") showGraph();
      else if (tab === "trace") showTrace();
    }
    // Trace is "active" only while its tab is shown AND the panel isn't minimized — drives both the
    // live dot and (the point) detaching its meters so the core records zero detail when off-screen.
    setTraceActive(
      tab === "trace" && panel?.classList.contains("li-min") !== true,
    );
    prevTab = tab ?? null;
  });

  scrollFades.push(scrollFade(bodyEl), scrollFade(tabscroll, { axis: "x" }));
}

/** Remove the panel and stop all observation/timers. Safe to call when not mounted. */
export function unmountInspector(): void {
  stopStats();
  for (const dispose of scrollFades) dispose();
  scrollFades.length = 0;
  disposeBindings();
  // inspectorScope owns the meters, heartbeat, the deferred render effect and every binding; stopping
  // it is the authoritative teardown, so a resource added to the scope but not tracked above can't leak.
  inspectorScope?.stop();
  inspectorScope = null;
  if (closeMenuOnOutside)
    document.removeEventListener("pointerdown", closeMenuOnOutside);
  closeMenuOnOutside = null;
  menuEl?.remove();
  menuEl = null;
  panel?.remove();
  panel = null;
  bodyEl = null;
  ui = null;
  scrollByTab.clear();
  prevTab = null;
  teardownGraph();
  teardownTrace();
}

/** Whether the inspector is currently mounted. */
export function inspectorMounted(): boolean {
  return panel !== null;
}

/** Show the inspector if hidden, hide it if shown. */
export function toggleInspector(target: Element = document.body): void {
  if (panel) unmountInspector();
  else mountInspector(target);
}
