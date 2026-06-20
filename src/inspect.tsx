// Floating dev inspector for Loom apps. Dogfoods Loom: the panel is built with Loom JSX (incl.
// SVG) and every live value is a Loom effect. It is a strict no-op until mountInspector() runs —
// no observers, timers, or DOM exist before that, and unmountInspector() tears everything down.
//
// All of the inspector's own reactive bindings and UI state are created `internal`, so Loom's
// observability filters them out: the inspector measures the app, never itself.
import {
  channels,
  configure,
  effect,
  type InspectNode,
  inspect,
  inspectResources,
  type Meter,
  meter,
  type Polled,
  polled,
  type Read,
  type Scope,
  type SourceConnect,
  type State,
  type Stop,
  scope,
  source,
  state,
} from "loom";
import { tap } from "loom/dom";

/* ============================================================ palette + css ========= */

const PANEL_ID = "loom-inspector";
// Shared options for every Loom node the inspector creates: internal (filtered from the
// observability it reports) and namespaced to the panel. Set once on the scope; nodes inherit it.
const PANEL_OPTS = { internal: true, namespace: PANEL_ID } as const;
const SANS =
  "ui-sans-serif,-apple-system,'SF Pro Text',Inter,system-ui,sans-serif";
const MONO = "ui-monospace,'SF Mono','JetBrains Mono',Menlo,monospace";
const LIGHT_VARS = `--li-bg:#fbfbfd;--li-fg:#16161c;--li-muted:#83838c;
  --li-border:rgba(0,0,0,.17);--li-border-soft:rgba(0,0,0,.09);--li-hover:rgba(0,0,0,.05);
  --li-fill:#eeeef3;--li-accent:#6d5cf0;--li-accent-soft:rgba(109,92,240,.16);
  --li-bar-bg:rgba(109,92,240,.1);--li-key:#6d5cf0;--li-node:#51515b;--li-vkind:#2f7ff0;
  --li-num:#2f9e5a;--li-str:#c0801f;--li-bool:#e5446b;--li-nul:#83838c;--li-input-bg:#fff;
  --li-input-fg:#16161c;--li-uline:rgba(0,0,0,.3);--li-scroll:rgba(0,0,0,.2)`;
const DARK_VARS = `--li-bg:#15151d;--li-fg:#ededf0;--li-muted:#8f8f9b;--li-border:rgba(255,255,255,.14);
  --li-border-soft:rgba(255,255,255,.08);--li-hover:rgba(255,255,255,.06);--li-fill:#1d1d28;
  --li-accent:#8b7cff;--li-accent-soft:rgba(139,124,255,.3);--li-bar-bg:rgba(139,124,255,.12);
  --li-key:#8b7cff;--li-node:#b6b6c0;--li-vkind:#5b9dff;--li-num:#57c97e;--li-str:#f0b65a;
  --li-bool:#ff7a9c;--li-nul:#8f8f9b;--li-input-bg:#ededf0;--li-input-fg:#16161c;--li-uline:rgba(255,255,255,.4);
  --li-scroll:rgba(255,255,255,.22)`;
const CSS = `
#${PANEL_ID}{${DARK_VARS};
  position:fixed;right:12px;bottom:12px;width:360px;height:440px;max-height:calc(100vh - 24px);
  z-index:2147483647;display:flex;flex-direction:column;font:12px/1.5 ${SANS};
  color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);
  border-radius:10px;box-shadow:0 6px 22px rgba(0,0,0,.26);overflow:hidden}
/* Self-contained reset so host-page element styles (e.g. a global button{min-height})
   can't bleed into the panel (or its portalled menu) and break the chrome dimensions. */
#${PANEL_ID} *,#${PANEL_ID}-menu *{box-sizing:border-box}
#${PANEL_ID} button,#${PANEL_ID}-menu button{min-height:0;margin:0;line-height:1.5}
#${PANEL_ID}-menu{${DARK_VARS};
  position:fixed;z-index:2147483647;min-width:150px;padding:5px;display:flex;flex-direction:column;gap:1px;
  font:11px/1.45 ${SANS};color:var(--li-fg);background:var(--li-bg);
  border:1px solid var(--li-border);border-radius:9px;box-shadow:0 4px 16px rgba(0,0,0,.22)}
#${PANEL_ID}-menu[hidden]{display:none}
#${PANEL_ID}-menu svg{display:block;pointer-events:none}
#${PANEL_ID}[data-theme=light],#${PANEL_ID}-menu[data-theme=light]{${LIGHT_VARS}}
@media (prefers-color-scheme:light){#${PANEL_ID}[data-theme=system],#${PANEL_ID}-menu[data-theme=system]{${LIGHT_VARS}}}
#${PANEL_ID}.li-min{height:auto!important}
#${PANEL_ID}.li-min .li-resize{display:none}
#${PANEL_ID} .li-resize{position:absolute;right:0;bottom:0;width:20px;height:20px;cursor:nwse-resize;
  touch-action:none}
#${PANEL_ID} .li-resize svg{width:100%;height:100%}
#${PANEL_ID} .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6;stroke-linecap:round;
  opacity:.55;transition:stroke .15s,opacity .15s}
#${PANEL_ID} .li-resize:hover path{stroke:var(--li-accent);opacity:1}
#${PANEL_ID} .li-bar{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:move;
  user-select:none;touch-action:none;
  background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft)}
#${PANEL_ID} .li-bar b{font-size:12px}
#${PANEL_ID} .li-brand{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto;pointer-events:none}
#${PANEL_ID} .li-brand svg{color:var(--li-key)}
#${PANEL_ID} .li-bar .li-sp{flex:1}
#${PANEL_ID} .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);
  border-radius:6px;width:26px;height:26px;padding:0;cursor:pointer;flex:0 0 auto;
  display:inline-flex;align-items:center;justify-content:center}
#${PANEL_ID} .li-bar button:hover{border-color:var(--li-accent)}
#${PANEL_ID}-menu .li-menu-item{font:inherit;color:var(--li-fg);background:transparent;border:0;border-radius:6px;
  padding:6px 8px;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px;white-space:nowrap}
#${PANEL_ID}-menu .li-menu-item:hover{background:var(--li-hover)}
#${PANEL_ID}-menu .li-menu-item>span:first-child{flex:1 1 auto}
#${PANEL_ID}-menu .li-menu-val{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;color:var(--li-muted);text-transform:capitalize}
#${PANEL_ID}-menu .li-menu-val svg{color:var(--li-accent)}
#${PANEL_ID}-menu .li-kbd{flex:0 0 auto;font:10px ${MONO};color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;padding:1px 5px}
#${PANEL_ID} .li-body{flex:1;min-height:0;overflow:auto;padding:8px 4px;background:transparent;
  scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;
  --li-fade-a:0px;--li-fade-b:0px;
  -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 var(--li-fade-a),#000 calc(100% - var(--li-fade-b)),transparent 100%);
  -webkit-mask-repeat:no-repeat;-webkit-mask-size:100% 100%;
  mask-image:linear-gradient(to bottom,transparent 0,#000 var(--li-fade-a),#000 calc(100% - var(--li-fade-b)),transparent 100%);
  mask-repeat:no-repeat;mask-size:100% 100%}
#${PANEL_ID} .li-body::-webkit-scrollbar{width:8px;height:8px}
#${PANEL_ID} .li-body::-webkit-scrollbar-track{background:transparent}
#${PANEL_ID} .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);border-radius:4px;
  border:2px solid transparent;background-clip:padding-box}
#${PANEL_ID} .li-empty{color:var(--li-muted);padding:16px 10px;font-size:12px;line-height:1.5}
#${PANEL_ID}.li-min .li-body,#${PANEL_ID}.li-min .li-tabs{display:none}
#${PANEL_ID} .li-stat-v,#${PANEL_ID} .li-perfh-fps{font-family:${MONO}}
#${PANEL_ID} svg{display:block;margin:0 auto;pointer-events:none}
#${PANEL_ID} .li-bar button svg{display:block;width:100%;height:100%}
#${PANEL_ID} .li-tabs{display:flex;align-items:flex-end;gap:8px;padding:0 8px;flex:0 0 auto;min-height:28px;
  background:transparent;border-bottom:2px solid var(--li-accent-soft)}
#${PANEL_ID} .li-perfh{display:flex;justify-content:space-between;align-items:baseline;
  padding:6px 10px 4px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted)}
#${PANEL_ID} .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}
#${PANEL_ID} .li-perfh-fps.h-ok{color:var(--li-num)}
#${PANEL_ID} .li-perfh-fps.h-warn{color:var(--li-str)}
#${PANEL_ID} .li-perfh-fps.h-bad{color:var(--li-bool)}
#${PANEL_ID} .li-histo{margin:0 10px 8px}
#${PANEL_ID} .li-histo svg{display:block;width:100%;height:24px;background:var(--li-hover);border-radius:5px}
#${PANEL_ID} .li-histo rect.h-ok{fill:var(--li-accent)}
#${PANEL_ID} .li-histo rect.h-warn{fill:var(--li-str)}
#${PANEL_ID} .li-histo rect.h-bad{fill:var(--li-bool)}
#${PANEL_ID} .li-hblock{display:flex;gap:12px;align-items:center;margin:0 10px;padding:2px 0 10px;
  border-bottom:1px solid var(--li-border-soft)}
#${PANEL_ID} .li-hblock svg{flex:0 0 auto;margin:0}
#${PANEL_ID} .li-gtrack{stroke:var(--li-hover)}
#${PANEL_ID} .li-garc{transition:stroke-dasharray .2s}
#${PANEL_ID} .li-garc.h-ok{stroke:var(--li-num)}
#${PANEL_ID} .li-garc.h-warn{stroke:var(--li-str)}
#${PANEL_ID} .li-garc.h-bad{stroke:var(--li-bool)}
#${PANEL_ID} .li-gnum{font:600 22px ${MONO};fill:var(--li-fg)}
#${PANEL_ID} .li-gnum.h-ok{fill:var(--li-num)}
#${PANEL_ID} .li-gnum.h-warn{fill:var(--li-str)}
#${PANEL_ID} .li-gnum.h-bad{fill:var(--li-bool)}
#${PANEL_ID} .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}
#${PANEL_ID} .li-garc.li-loading{stroke:var(--li-muted)}
#${PANEL_ID} .li-glbl{fill:var(--li-muted);font:9px ${SANS}}
#${PANEL_ID} .li-hstats{flex:1 1 auto;min-width:0}
#${PANEL_ID} .li-hstats .li-stat{padding:2px 0}
#${PANEL_ID} .li-hlabel{font-size:10.5px;letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px}
#${PANEL_ID} .li-hlabel.h-ok{color:var(--li-num)}
#${PANEL_ID} .li-hlabel.h-warn{color:var(--li-str)}
#${PANEL_ID} .li-hlabel.h-bad{color:var(--li-bool)}
#${PANEL_ID} .li-stat{display:flex;justify-content:space-between;align-items:baseline;gap:10px;
  padding:1px 0;border-bottom:1px dashed var(--li-border-soft)}
#${PANEL_ID} .li-pane>.li-stat{margin:0 10px}
#${PANEL_ID} .li-stat:last-child{border-bottom:0}
#${PANEL_ID} .li-stat-k{color:var(--li-muted);white-space:nowrap}
#${PANEL_ID} .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}
#${PANEL_ID} .li-stat-v.hi{color:var(--li-key)}
#${PANEL_ID} .li-stat-v.lo{color:var(--li-num)}
#${PANEL_ID} .li-stat-v.h-ok{color:var(--li-num)}
#${PANEL_ID} .li-stat-v.h-warn{color:var(--li-str)}
#${PANEL_ID} .li-stat-v.h-bad{color:var(--li-bool)}
#${PANEL_ID} .li-graph{padding:4px 0 8px;overflow-y:auto}
#${PANEL_ID} .li-gns-h{display:flex;align-items:center;gap:6px;padding:4px 10px 3px;cursor:pointer;
  color:var(--li-muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em;user-select:none}
#${PANEL_ID} .li-gns-h:hover{background:var(--li-hover)}
#${PANEL_ID} .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}
#${PANEL_ID} .li-chev{flex:0 0 auto;margin:0;color:var(--li-muted);transition:transform .12s ease}
#${PANEL_ID} .li-gns.collapsed .li-chev{transform:rotate(-90deg)}
#${PANEL_ID} .li-gns.collapsed .li-gns-body{display:none}
#${PANEL_ID} .li-grow{display:flex;align-items:center;gap:7px;padding:2px 10px 2px 22px;
  font-size:11.5px;border-radius:4px;cursor:default;
  content-visibility:auto;contain-intrinsic-size:auto 21px}
#${PANEL_ID} .li-gns-body .li-grow{padding-left:30px}
#${PANEL_ID} .li-grow:hover{background:var(--li-hover)}
#${PANEL_ID} .li-gicon{flex:0 0 auto;margin:0}
#${PANEL_ID} .li-gi-state{color:var(--li-key)}
#${PANEL_ID} .li-gi-computed{color:var(--li-num)}
#${PANEL_ID} .li-gi-dim{color:var(--li-muted);opacity:.7}
#${PANEL_ID} .li-glabel{color:var(--li-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${PANEL_ID} .li-gns-tag{flex:0 0 auto;font-size:9px;color:var(--li-muted);background:var(--li-fill);
  border-radius:3px;padding:0 4px;text-transform:uppercase;letter-spacing:.03em}
#${PANEL_ID} .li-gval{font-family:${MONO};color:var(--li-muted);white-space:nowrap;
  font-variant-numeric:tabular-nums;min-width:0;overflow:hidden;text-overflow:ellipsis}
#${PANEL_ID} .li-gv-num{color:var(--li-num)}
#${PANEL_ID} .li-gv-str{color:var(--li-str)}
#${PANEL_ID} .li-gv-bool{color:var(--li-bool)}
#${PANEL_ID} .li-gv-nul{color:var(--li-nul)}
#${PANEL_ID} .li-gval.li-edit{cursor:text;border-bottom:1px dotted transparent}
#${PANEL_ID} .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}
#${PANEL_ID} .li-gval.li-edit.li-gv-bool{cursor:pointer}
#${PANEL_ID} .li-gedit{font:inherit;font-family:${MONO};color:var(--li-input-fg);
  background:var(--li-input-bg);border:0;border-radius:3px;padding:0 4px;min-width:0;width:9ch;
  outline:1px solid var(--li-accent)}
#${PANEL_ID} .li-flash{animation:li-insp-flash .6s ease-out}
@keyframes li-insp-flash{from{background:var(--li-accent-soft)}to{background:transparent}}
#${PANEL_ID} .li-tabscroll{display:flex;align-items:flex-end;gap:1px;flex:1 1 auto;margin-top:6px;
  min-width:0;overflow-x:auto;scrollbar-width:none;
  --li-fade-a:0px;--li-fade-b:0px;
  -webkit-mask-image:linear-gradient(to right,transparent 0,#000 var(--li-fade-a),#000 calc(100% - var(--li-fade-b)),transparent 100%);
  -webkit-mask-repeat:no-repeat;-webkit-mask-size:100% 100%;
  mask-image:linear-gradient(to right,transparent 0,#000 var(--li-fade-a),#000 calc(100% - var(--li-fade-b)),transparent 100%);
  mask-repeat:no-repeat;mask-size:100% 100%}
#${PANEL_ID} .li-tabscroll::-webkit-scrollbar{display:none}
#${PANEL_ID} .li-tab{font:inherit;font-size:10.5px;color:var(--li-muted);background:var(--li-fill);border:0;
  border-radius:5px 5px 0 0;padding:5px 11px;cursor:pointer;white-space:nowrap;flex:0 0 auto;
  letter-spacing:.04em;transition:color .12s,background .12s}
#${PANEL_ID} .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}
#${PANEL_ID} .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}
#${PANEL_ID} .li-spark{flex:0 0 auto;display:flex;align-items:center;gap:5px;opacity:.82;align-self:center;padding-top:2px}
#${PANEL_ID} .li-spark svg{margin:0}
#${PANEL_ID} .li-spk-cr{stop-color:var(--li-num)}
#${PANEL_ID} .li-spk-cw{stop-color:var(--li-bool)}
`;

/* ============================================================ icons ================= */

// Lucide icons (https://lucide.dev) as inline SVG; stroke inherits currentColor.
function svgMarkup(inner: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
const ICON_MINIMIZE =
  '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="14" x2="21" y1="10" y2="3"/><line x1="3" x2="10" y1="21" y2="14"/>';
const ICON_MAXIMIZE =
  '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>';
const ICON_POINTER =
  '<path d="M12.034 12.681a.498.498 0 0 1 .647-.647l9 3.5a.5.5 0 0 1-.033.943l-3.444 1.068a1 1 0 0 0-.66.66l-1.067 3.443a.5.5 0 0 1-.943.033z"/><path d="M5 3a2 2 0 0 0-2 2"/><path d="M19 3a2 2 0 0 1 2 2"/><path d="M5 21a2 2 0 0 1-2-2"/><path d="M9 3h1"/><path d="M9 21h2"/><path d="M14 3h1"/><path d="M3 9v1"/><path d="M21 9v2"/><path d="M3 14v1"/>';
const ICON_SUN =
  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
const ICON_MOON = '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>';
const ICON_MONITOR =
  '<rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/>';
const ICON_SETTINGS =
  '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>';
// State markers: a filled dot when the cell drives a DOM element downstream (bound — the hover
// highlight can outline it), a hollow ring otherwise (text-only or unread). Computed = function (ƒ).
const ICON_BOUND =
  '<circle cx="12" cy="12" r="5" fill="currentColor" stroke="none"/>';
const ICON_UNBOUND = '<circle cx="12" cy="12" r="5"/>';
const ICON_COMPUTED =
  '<path d="M5 19c.264.956.797 2 2.187 2c2.407 0 3.008-2 4.813-9s2.406-9 4.813-9c1.39 0 1.923 1.044 2.187 2M9 10h8"/>';
const ICON_CHEVRON = '<path d="m6 9 6 6 6-6"/>';

type Theme = "system" | "light" | "dark";
const THEME_ICONS: Record<Theme, string> = {
  system: ICON_MONITOR,
  light: ICON_SUN,
  dark: ICON_MOON,
};

/* ============================================================ geometry ============== */

const FRAME_N = 138; // frame-time histogram samples (matches the demo overlay)
const GAUGE_R = 34;
const GAUGE_C = 2 * Math.PI * GAUGE_R;
const GAUGE_ARC = GAUGE_C * 0.75; // 270° gauge
const SPARK_N = 48;
const SPARK_W = 58;
const SPARK_LINE = 11;
const SPARK_H = SPARK_LINE * 2;
const SPARK_RAMP: ReadonlyArray<readonly [number, number]> = [
  [0, 0],
  [0.4, 0.03],
  [0.7, 0.11],
  [0.88, 0.22],
  [1, 0.34],
];

/* ============================================================ module state ========= */

type TabId = "stats" | "graph" | "writes";
const TABS: ReadonlyArray<{ id: TabId; label: string }> = [
  { id: "stats", label: "Info" },
  { id: "graph", label: "Graph" },
  { id: "writes", label: "Writes" },
];

let panel: HTMLElement | null = null;
let menuEl: HTMLElement | null = null;
let bodyEl: HTMLElement | null = null;
let closeMenuOnOutside: ((e: Event) => void) | null = null;
let heartbeat: Polled<number> | null = null;
let lagTimer: ReturnType<typeof setInterval> | null = null;
let rafHandle: number | null = null;
const scrollFades: { refresh: () => void; dispose: () => void }[] = [];
// Every reactive binding + the tab effect; all `internal`, all disposed on unmount.
const bindings: Stop[] = [];
// Scopes for collective pause: the whole panel (paused when minimized) and, nested inside it, the
// stats tab (paused when it isn't the active tab) — so a hidden subtree does no reactive work.
let inspectorScope: Scope | null = null;
let statsScope: Scope | null = null;

// Inspector-owned UI state (internal: filtered from observation). Lazily created on first mount.
let ui: State<TabId> | null = null;
// Wakes the Info-tab bindings each poll while that tab is visible (see startMetrics()).
let metricSeq = 0;

// A pull-based meter on the core's built-in reactive channels; poll() drains it every tick for
// the smoothed per-second rates. These map 1:1 onto the loom-next pipeline stages:
// writes -> computed recompute -> flush -> effect run. The meter is a scope resource, so minimizing
// the panel detaches it and the core's emit sites go fully dormant.
let metricsMeter: Meter | null = null;
let readRate = 0;
let writeRate = 0;
let computedRate = 0;
let effectRate = 0;
let flushRate = 0;
let createRate = 0;
let disposeRate = 0;
let lastFlushBatch = 0;
let lastFlushMs = 0;

// Frame rate / frame times (rAF), main-thread lag (timer), and web-vitals (PerformanceObserver).
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

// Web vitals are lazy external sources (PerformanceObserver): they connect when their Info-tab
// readouts first subscribe (panel mount) and auto-disconnect when those bindings dispose
// (unmount) — no manual observer teardown. Created in mountInspector().
let clsSource: Read<number> | null = null;
let lcpSource: Read<number> | null = null;
let inpSource: Read<number> | null = null;
// Long-task blocking time — another lazy PerformanceObserver source (unsupported in Safari).
let longTasksSource: Read<number> | null = null;
// Heap (Chrome-only) is a slow imperative value, so it's a polled source rather than a lazy one.
let heapSource: Polled<number> | null = null;

// Derived health, recomputed each poll; the gauge / FPS / label bindings read these.
let score = 100;
let healthKey = "";
let healthReady = false;
let fpsKey = "";

// Live resource census, recomputed once per poll (while the Info tab is visible) via a single
// inspectResources() walk shared by all the count rows.
let nodeStates = 0;
let nodeComputeds = 0;
let nodeEffects = 0;
let nodeViews = 0;
let nodeSources = 0;
let nodeScopes = 0;
let nodeChannels = 0;

// Graph tab: an imperative namespace-grouped tree of states/computeds/views, reconciled in
// renderGraph() on the heartbeat while the tab is visible. Rows update value + flash on change and
// outline their DOM node(s) on hover. Imperative (not loom bindings) to stay light at hundreds of
// rows and to keep hover/expand state across reconciles.
interface GraphRow {
  readonly row: HTMLElement;
  readonly val: HTMLElement;
  prevVal: string;
}
interface GraphGroup {
  readonly wrap: HTMLElement;
  readonly body: HTMLElement;
  readonly count: HTMLElement;
  readonly labelEl: HTMLElement;
}
let graphEl: HTMLElement | null = null;
let graphById = new Map<number, InspectNode>();
let gOverlays: HTMLElement[] = []; // active hover-highlight overlay boxes
let gEditing: HTMLInputElement | null = null; // the open in-place value editor, if any
let lastGraphRender = 0; // performance.now() of the last graph reconcile (see GRAPH_RENDER_MS)
const graphRows = new Map<number, GraphRow>();
const graphGroups = new Map<number, GraphGroup>(); // keyed by fields() group id
const graphCollapsed = new Set<number>();

// Rendering-pipeline sparkline series: writes in (top) vs DOM updates out (bottom), per poll.
const sparkIn: number[] = [];
const sparkOut: number[] = [];

const POLL_MS = 120;
const POLL_S = POLL_MS / 1000;
const GRAPH_RENDER_MS = 300; // throttle the (heavy) graph reconcile below the 120ms heartbeat
const LAG_MS = 200;

/* ============================================================ binding helpers ====== */

// Run `fn` as an internal effect and remember it for disposal. Internal so its reads/runs are
// excluded from the metrics the inspector reports (it must never observe itself).
function bind(fn: () => void): void {
  bindings.push(effect(fn, PANEL_OPTS));
}

function bindText(node: Element, read: () => string): void {
  let prev: string | undefined;
  bind(() => {
    const next = read();
    if (next === prev) return;
    prev = next;
    node.textContent = next;
  });
}

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

/* ============================================================ formatting =========== */

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

// Live node census from a Loom snapshot, by the three node kinds. Inspector-owned nodes are
// `internal`, so they're skipped.
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

function loadTheme(): Theme {
  const t = lsGet(THEME_KEY);
  return t === "light" || t === "dark" || t === "system" ? t : "system";
}
function loadPos(): { left: number; top: number } | null {
  const raw = lsGet(POS_KEY);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (typeof v?.left === "number" && typeof v?.top === "number")
      return { left: v.left, top: v.top };
  } catch {
    /* malformed */
  }
  return null;
}
function loadSize(): { width: number; height: number } | null {
  const raw = lsGet(SIZE_KEY);
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    if (typeof v?.width === "number" && typeof v?.height === "number")
      return { width: v.width, height: v.height };
  } catch {
    /* malformed */
  }
  return null;
}
let panelPos = loadPos();
let panelSize = loadSize();

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

function makeDraggable(handle: HTMLElement, target: HTMLElement): void {
  handle.addEventListener("pointerdown", (e) => {
    if ((e.target as HTMLElement | null)?.closest("button")) return;
    e.preventDefault();
    const rect = target.getBoundingClientRect();
    const startLeft = rect.left;
    const startTop = rect.top;
    const startX = e.clientX;
    const startY = e.clientY;
    target.style.left = `${snapPx(startLeft)}px`;
    target.style.top = `${snapPx(startTop)}px`;
    target.style.right = "auto";
    target.style.bottom = "auto";
    handle.setPointerCapture?.(e.pointerId);
    handle.style.cursor = "grabbing";
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    const onMove = (ev: PointerEvent): void => {
      const { left, top } = clampPanel(
        target,
        handle.offsetHeight || 40,
        startLeft + ev.clientX - startX,
        startTop + ev.clientY - startY,
      );
      target.style.left = `${left}px`;
      target.style.top = `${top}px`;
      panelPos = { left, top };
    };
    const onUp = (): void => {
      handle.releasePointerCapture?.(e.pointerId);
      handle.style.cursor = "";
      document.body.style.userSelect = prevUserSelect;
      if (panelPos) lsSet(POS_KEY, JSON.stringify(panelPos));
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  });
}

function makeResizable(handle: HTMLElement, target: HTMLElement): void {
  handle.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = target.getBoundingClientRect();
    target.style.left = `${snapPx(rect.left)}px`;
    target.style.top = `${snapPx(rect.top)}px`;
    target.style.right = "auto";
    target.style.bottom = "auto";
    const startW = rect.width;
    const startH = rect.height;
    const startX = e.clientX;
    const startY = e.clientY;
    handle.setPointerCapture?.(e.pointerId);
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";
    const onMove = (ev: PointerEvent): void => {
      const w = snapPx(
        Math.max(
          240,
          Math.min(
            window.innerWidth - rect.left - 8,
            startW + ev.clientX - startX,
          ),
        ),
      );
      const h = snapPx(
        Math.max(
          160,
          Math.min(
            window.innerHeight - rect.top - 8,
            startH + ev.clientY - startY,
          ),
        ),
      );
      target.style.width = `${w}px`;
      target.style.height = `${h}px`;
      panelSize = { width: w, height: h };
    };
    const onUp = (): void => {
      handle.releasePointerCapture?.(e.pointerId);
      document.body.style.userSelect = prevUserSelect;
      if (panelSize) lsSet(SIZE_KEY, JSON.stringify(panelSize));
      handle.removeEventListener("pointermove", onMove);
      handle.removeEventListener("pointerup", onUp);
      handle.removeEventListener("pointercancel", onUp);
    };
    handle.addEventListener("pointermove", onMove);
    handle.addEventListener("pointerup", onUp);
    handle.addEventListener("pointercancel", onUp);
  });
}

// Edge fade for a scroller, only as far as content is actually hidden. rAF-throttled.
function wireScrollFade(
  scroller: HTMLElement,
  axis: "x" | "y",
): { refresh: () => void; dispose: () => void } {
  const FADE = 16;
  const DEAD = 6;
  let frame = 0;
  const update = (): void => {
    frame = 0;
    const size = axis === "x" ? scroller.clientWidth : scroller.clientHeight;
    const full = axis === "x" ? scroller.scrollWidth : scroller.scrollHeight;
    const before = axis === "x" ? scroller.scrollLeft : scroller.scrollTop;
    const after = Math.max(0, full - size) - before;
    scroller.style.setProperty(
      "--li-fade-a",
      `${before < DEAD ? 0 : Math.min(before, FADE)}px`,
    );
    scroller.style.setProperty(
      "--li-fade-b",
      `${after < DEAD ? 0 : Math.min(after, FADE)}px`,
    );
  };
  const schedule = (): void => {
    if (frame) return;
    frame = requestAnimationFrame(update);
  };
  scroller.addEventListener("scroll", schedule, { passive: true });
  const ro =
    typeof ResizeObserver === "function" ? new ResizeObserver(schedule) : null;
  ro?.observe(scroller);
  schedule();
  return {
    refresh: schedule,
    dispose: (): void => {
      scroller.removeEventListener("scroll", schedule);
      ro?.disconnect();
      if (frame) cancelAnimationFrame(frame);
    },
  };
}

/* ============================================================ SVG widgets ========== */

// Parse the icon markup and return the <svg> element directly (no wrapper), so it sits as a
// direct child of the bar button / brand exactly like the reference.
function icon(inner: string, size: number): Element {
  const tmp = document.createElement("div");
  tmp.innerHTML = svgMarkup(inner, size);
  const svg = tmp.firstElementChild;
  if (!svg) throw new Error("icon markup produced no element");
  return svg;
}

// Bar-button icon: the <svg> fills the button's content box and the 24-unit glyph is inset via
// the viewBox to ~14px visual. A small centered svg *box* leaves margins that round to
// sub-device-pixels on scaled displays (fractional DPR), making the icon's gap shimmer in
// Safari; filling the box removes the gap and centers the glyph in resolution-independent SVG
// space instead. (24px content box · 24/14 ⇒ viewBox side 41.143, inset 8.571.)
function barIcon(inner: string): Element {
  const tmp = document.createElement("div");
  tmp.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
  const svg = tmp.firstElementChild;
  if (!svg) throw new Error("icon markup produced no element");
  return svg;
}

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
  const num = (
    <text class="li-gnum" x={44} y={48} text-anchor="middle">
      100
    </text>
  );
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
  bindText(
    num,
    pulse(() => (healthReady ? String(score) : "100")),
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

function plotPoints(data: number[], bandTop: number): string {
  const max = Math.max(1, ...data);
  const step = data.length > 1 ? SPARK_W / (data.length - 1) : 0;
  const baseline = bandTop + SPARK_LINE - 1;
  const span = SPARK_LINE - 2;
  return data
    .map(
      (v, i) =>
        `${(i * step).toFixed(1)},${(baseline - (v / max) * span).toFixed(1)}`,
    )
    .join(" ");
}

function buildSpark(): HTMLElement {
  const grad = (id: string, cls: string): HTMLElement => (
    <linearGradient id={id} x1={0} y1={0} x2={0} y2={1}>
      {SPARK_RAMP.map(([offset, opacity]) => (
        <stop offset={offset} class={cls} stop-opacity={opacity} />
      ))}
    </linearGradient>
  );
  const inLine = (
    <polyline
      fill="none"
      stroke="#5fd39a"
      stroke-width={1}
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  );
  const outLine = (
    <polyline
      fill="none"
      stroke="#ff6b81"
      stroke-width={1}
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  );
  bindAttr(
    inLine,
    "points",
    pulse(() => plotPoints(sparkIn, 0)),
  );
  bindAttr(
    outLine,
    "points",
    pulse(() => plotPoints(sparkOut, SPARK_LINE)),
  );
  return (
    <span
      class="li-spark"
      title="rendering pipeline — writes in (green) vs DOM updates out (red)"
    >
      <svg
        width={SPARK_W}
        height={SPARK_H}
        viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
        role="img"
        aria-label="Rendering pipeline utilization"
      >
        <defs>
          {grad(`${PANEL_ID}-spk-rg`, "li-spk-cr")}
          {grad(`${PANEL_ID}-spk-wg`, "li-spk-cw")}
        </defs>
        <rect
          x={0}
          y={0}
          width={SPARK_W}
          height={SPARK_LINE}
          fill={`url(#${PANEL_ID}-spk-rg)`}
        />
        <rect
          x={0}
          y={SPARK_LINE}
          width={SPARK_W}
          height={SPARK_LINE}
          fill={`url(#${PANEL_ID}-spk-wg)`}
        />
        {inLine}
        {outLine}
      </svg>
    </span>
  );
}

/* ============================================================ Info (stats) tab ===== */

function stat(
  label: string,
  get: () => string,
  cls = "",
  title = "",
): HTMLElement {
  const val = (<span class={`li-stat-v ${cls}`} />) as HTMLElement;
  bindText(val, pulse(get));
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
    "Registered observability channels (7 built-in + any app-declared).",
} as const;

/* ============================================================ graph tab =========== */

function buildGraphPane(): HTMLElement {
  graphEl = (<div class="li-pane li-graph" />) as HTMLElement;
  return graphEl;
}

// A cell is "bound" when it drives a DOM element somewhere downstream — i.e. the hover highlight
// has something to outline. Cells read only into text nodes, or read by nothing, are unbound
// (a filled dot promises a highlight, so it must mean a real element target exists).
function gBound(n: InspectNode): boolean {
  return gTargetsFor(n.id).length > 0;
}
function gFormat(v: unknown): string {
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
// Type colour for a value (see the --li-num/str/bool/nul palette).
function gValueClass(v: unknown): string {
  if (typeof v === "number") return "li-gv-num";
  if (typeof v === "string") return "li-gv-str";
  if (typeof v === "boolean") return "li-gv-bool";
  if (v === null || v === undefined) return "li-gv-nul";
  return "";
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
// Open the in-place editor for a state cell: booleans toggle, others get an <input> that commits
// on Enter/blur and writes straight back to the live cell.
function gBeginEdit(cell: State<unknown>, val: HTMLElement, r: GraphRow): void {
  const prev = cell();
  if (typeof prev === "boolean") {
    cell(!prev);
    gShowVal(r, cell());
    return;
  }
  // The handler is wired once; bail if the value has since become non-primitive (can't edit it).
  if (prev !== null && typeof prev !== "number" && typeof prev !== "string") {
    return;
  }
  const input = document.createElement("input");
  input.className = "li-gedit";
  input.value = typeof prev === "string" ? prev : String(prev);
  val.replaceWith(input);
  gEditing = input;
  input.focus();
  input.select();
  const restore = (): void => {
    gEditing = null;
    if (input.parentNode) input.replaceWith(val);
  };
  const commit = (): void => {
    if (gEditing !== input) return;
    cell(gCoerce(input.value, prev));
    restore();
    gShowVal(r, cell());
  };
  input.onblur = commit;
  input.onkeydown = (e) => {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") restore();
  };
}
// Paint a row's value cell (text + type colour), preserving the edit affordance class.
function gShowVal(r: GraphRow, v: unknown): void {
  const text = gFormat(v);
  r.val.textContent = text;
  r.val.className = `li-gval${r.val.classList.contains("li-edit") ? " li-edit" : ""} ${gValueClass(v)}`;
  r.prevVal = text;
}

// Views aren't listed; instead, hovering a state/computed outlines every view downstream of it
// (walk subscribers through computeds to the effects that actually write DOM).
function gTargetsFor(id: number): Element[] {
  const out: Element[] = [];
  const seen = new Set<number>([id]);
  const start = graphById.get(id);
  const queue = start ? [...start.subs] : [];
  while (queue.length > 0) {
    const sid = queue.shift();
    if (sid === undefined || seen.has(sid)) continue;
    seen.add(sid);
    const node = graphById.get(sid);
    if (!node) continue;
    if (node.kind === "effect") {
      if (node.target instanceof Element) out.push(node.target);
    } else for (const s of node.subs) queue.push(s);
  }
  return out;
}
// Union of the downstream views of every cell in a fields() group (hover the group header).
function gGroupTargets(gid: number): Element[] {
  const out: Element[] = [];
  const seen = new Set<Element>();
  for (const n of graphById.values()) {
    if (n.group !== gid) continue;
    for (const el of gTargetsFor(n.id))
      if (!seen.has(el)) {
        seen.add(el);
        out.push(el);
      }
  }
  return out;
}
// Highlight via fixed overlay boxes (not `outline`, which follows the target's border-radius in
// modern browsers) so the marker is always a sharp rectangle. Transient: it tracks a hover, not
// scroll/resize.
function gPaint(els: Element[], on: boolean): void {
  for (const o of gOverlays) o.remove();
  gOverlays = [];
  if (!on) return;
  for (const el of els) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) continue;
    const o = document.createElement("div");
    o.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`;
    document.body.append(o);
    gOverlays.push(o);
  }
}
function gFlash(row: HTMLElement): void {
  row.classList.remove("li-flash");
  void row.offsetWidth; // reflow so the animation restarts even on rapid updates
  row.classList.add("li-flash");
}

// A group's display name: the fields() label prefix ("card 3" from "card 3.title"), else anonymous.
function gGroupLabel(gid: number, cells: InspectNode[]): string {
  const first = cells[0];
  const dot = first ? first.label.lastIndexOf(".") : -1;
  return first && dot > 0 ? first.label.slice(0, dot) : `fields #${gid}`;
}

function gEnsureGroup(gid: number, label: string): GraphGroup {
  const existing = graphGroups.get(gid);
  if (existing) {
    existing.labelEl.textContent = label;
    return existing;
  }
  const count = (<span class="li-gns-c" />) as HTMLElement;
  const labelEl = (<span>{label}</span>) as HTMLElement;
  const body = (<div class="li-gns-body" />) as HTMLElement;
  const chev = icon(ICON_CHEVRON, 11);
  chev.classList.add("li-chev");
  const wrap = (
    <div class={["li-gns", { collapsed: graphCollapsed.has(gid) }]}>
      <div class="li-gns-h">
        {chev}
        {labelEl}
        {count}
      </div>
      {body}
    </div>
  ) as HTMLElement;
  const header = wrap.querySelector(".li-gns-h") as HTMLElement;
  header.onclick = () => {
    const collapsed = wrap.classList.toggle("collapsed");
    if (collapsed) graphCollapsed.add(gid);
    else graphCollapsed.delete(gid);
  };
  header.onmouseenter = () => gPaint(gGroupTargets(gid), true);
  header.onmouseleave = () => gPaint(gGroupTargets(gid), false);
  graphEl?.append(wrap);
  const group: GraphGroup = { wrap, body, count, labelEl };
  graphGroups.set(gid, group);
  return group;
}

function gUpdateRow(n: InspectNode, parent: HTMLElement, child: boolean): void {
  let r = graphRows.get(n.id);
  if (!r) {
    const val = (<span class="li-gval" />) as HTMLElement;
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
    const labelText = child ? (n.key ?? n.label) : n.label;
    const row = (
      <div class="li-grow">
        {ic}
        <span class="li-glabel">{labelText}</span>
        {!child && n.namespace !== "default" ? (
          <span class="li-gns-tag">{n.namespace}</span>
        ) : null}
        {val}
      </div>
    ) as HTMLElement;
    row.onmouseenter = () => gPaint(gTargetsFor(n.id), true);
    row.onmouseleave = () => gPaint(gTargetsFor(n.id), false);
    parent.append(row);
    const created: GraphRow = { row, val, prevVal: " " };
    graphRows.set(n.id, created);
    r = created;
    if (gEditable(n) && n.source) {
      val.classList.add("li-edit");
      const cell = n.source;
      val.onclick = () => gBeginEdit(cell, val, created);
    }
  }
  // Skip the row currently being edited (its value cell is detached into an <input>).
  if (!r.val.isConnected) return;
  const v = gFormat(n.value);
  if (v !== r.prevVal) {
    if (r.prevVal !== " ") gFlash(r.row);
    gShowVal(r, n.value);
  }
}

function renderGraph(): void {
  if (!graphEl) return;
  const all = inspect().nodes;
  graphById = new Map(all.map((n) => [n.id, n]));

  // The tree holds state + computed cells only; views (effects) are reached by hover, not listed.
  // fields() cells fold back under one collapsible group; standalone cells render at the root.
  const groups = new Map<number, InspectNode[]>();
  const singles: InspectNode[] = [];
  for (const n of all) {
    if (n.internal || n.kind === "effect") continue;
    if (n.group !== undefined) {
      const arr = groups.get(n.group);
      if (arr) arr.push(n);
      else groups.set(n.group, [n]);
    } else singles.push(n);
  }

  const seenRows = new Set<number>();
  const seenGroups = new Set<number>();
  for (const [gid, cells] of groups) {
    // Skip ghost groups: a removed object's cells linger in inspect() until GC, but their bindings
    // are already disposed, so none has a subscriber. Showing them balloons the tree under churn.
    if (!cells.some((c) => c.subs.length > 0)) continue;
    seenGroups.add(gid);
    cells.sort((a, b) => (a.key ?? a.label).localeCompare(b.key ?? b.label));
    const g = gEnsureGroup(gid, gGroupLabel(gid, cells));
    g.count.textContent = `(${cells.length})`;
    for (const n of cells) {
      seenRows.add(n.id);
      gUpdateRow(n, g.body, true);
    }
  }
  for (const n of singles) {
    seenRows.add(n.id);
    gUpdateRow(n, graphEl, false);
  }

  for (const [id, r] of graphRows)
    if (!seenRows.has(id)) {
      r.row.remove();
      graphRows.delete(id);
    }
  for (const [gid, g] of graphGroups)
    if (!seenGroups.has(gid)) {
      g.wrap.remove();
      graphGroups.delete(gid);
    }
}

function buildStatsPane(): HTMLElement {
  const fpsValue = (<span class="li-perfh-fps" />) as HTMLElement;
  bindText(
    fpsValue,
    pulse(() => (fpsReady ? `${Math.round(fps)} fps` : "— fps")),
  );
  bindAttr(
    fpsValue,
    "class",
    pulse(() => `li-perfh-fps ${fpsKey}`),
  );

  const hlabel = (<div class="li-hlabel" title={TIP.health} />) as HTMLElement;
  bindText(
    hlabel,
    pulse(() => (fpsReady ? health(fps).label.toUpperCase() : "LOADING")),
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
  // Heap drifts slowly, so it's a polled() source (created in mountInspector) sampled every 5s.
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

/* ============================================================ metrics loop ========= */

// The heartbeat sample (see startMetrics): drain the meter into smoothed rates and return a
// sequence that only advances while the Info tab is visible, so the polled signal's value-dedup
// leaves the (display:none-hidden) Info bindings asleep until that tab is shown.
function poll(): number {
  const frame = metricsMeter?.read();
  const dr = frame?.["loom:read"]?.count ?? 0;
  const dw = frame?.["loom:write"]?.count ?? 0;
  const deff = frame?.["loom:effect"]?.count ?? 0;
  const dc = frame?.["loom:compute"]?.count ?? 0;
  const dcr = frame?.["loom:create"]?.count ?? 0;
  const ddi = frame?.["loom:dispose"]?.count ?? 0;
  const flushFrame = frame?.["loom:flush"];
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
  // Sparkline = rendering-pipeline utilization: writes entering vs effect runs produced.
  sparkIn.push(dw);
  sparkOut.push(deff);
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

  // The graph census walks every node, so recompute it only while the stats tab is actually
  // visible. The sequence advances every tick regardless, so the always-visible spark keeps moving
  // across tab switches; the hidden stats bindings stay asleep via their own paused scope.
  const visible = !panel?.classList.contains("li-min");
  if (ui?.() === "stats" && visible) {
    const c = inspectResources();
    nodeStates = c.states;
    nodeComputeds = c.computeds;
    nodeEffects = c.effects;
    nodeViews = c.views;
    nodeSources = c.sources;
    nodeScopes = c.scopes;
    nodeChannels = c.channels;
  } else if (ui?.() === "graph" && visible) {
    // The graph walk (inspect() builds every node) is the heavy part, so refresh it at ~3/s rather
    // than every 120ms tick — plenty for reading values, and it halves the cost under churn.
    const now = performance.now();
    if (now - lastGraphRender >= GRAPH_RENDER_MS) {
      lastGraphRender = now;
      renderGraph();
    }
  }
  return ++metricSeq;
}

function startMetrics(): void {
  // The reactive-pipeline rates come from a pull-based meter on the core's built-in channels,
  // created in the panel scope (see mountInspector) so minimizing detaches it. Web vitals
  // (CLS/LCP/INP) are lazy sources whose PerformanceObservers connect with their readouts.
  lagExpected = performance.now() + LAG_MS;
  lagTimer = setInterval(() => {
    const t = performance.now();
    lag = Math.max(0, t - lagExpected);
    if (lag > lagPeak) lagPeak = lag;
    lagExpected = t + LAG_MS;
  }, LAG_MS);

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
  const themeVal = (<span class="li-menu-val" />) as HTMLElement;
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
  const menu = (<div class="li-menu" hidden />) as HTMLElement;
  menu.id = `${PANEL_ID}-menu`;
  menu.append(themeItem);
  menuEl = menu;
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
  });

  const brand = (
    <span class="li-brand">
      {icon(ICON_POINTER, 15)}
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
  // the heartbeat in the panel scope (it drives the always-visible spark and pauses only on
  // minimize), the vitals + heap timer in the stats scope (they feed only the stats tab, so their
  // observers/timer suspend when it's hidden and reconnect — buffered — on return). The spark sits
  // in the outer scope so it stays live across tab switches.
  let statsPane!: HTMLElement;
  let sparkEl!: HTMLElement;
  inspectorScope = scope(() => {
    // Meter the core's reactive channels; as a scope resource it detaches on minimize, leaving the
    // core's emit sites fully dormant. Created before the heartbeat so poll() can drain it.
    metricsMeter = meter([
      channels.read,
      channels.write,
      channels.compute,
      channels.effect,
      channels.flush,
      channels.create,
      channels.dispose,
    ]);
    heartbeat = polled(poll, POLL_MS);
    statsScope = scope(() => {
      clsSource = source(connectCls, 0);
      lcpSource = source(connectLcp, 0);
      inpSource = source(connectInp, 0);
      longTasksSource = source(connectLongTasks, 0);
      if (heapMem()) {
        heapSource = polled(() => heapMem()?.usedJSHeapSize ?? 0, 5000);
      }
      statsPane = buildStatsPane();
    });
    sparkEl = buildSpark();
  }, PANEL_OPTS);
  if (startMin) inspectorScope.pause();

  // Panes: Info (stats) and Graph are wired; Writes is still a placeholder.
  const panes = new Map<TabId, HTMLElement>();
  const tabBtns = new Map<TabId, HTMLElement>();
  bodyEl = (<div class="li-body" />) as HTMLElement;
  for (const t of TABS) {
    const pane =
      t.id === "stats" ? (
        statsPane
      ) : t.id === "graph" ? (
        buildGraphPane()
      ) : (
        <div class="li-pane">
          <div class="li-empty">Not wired yet.</div>
        </div>
      );
    panes.set(t.id, pane);
    bodyEl.append(pane);
  }

  const tabscroll = (<div class="li-tabscroll" />) as HTMLElement;
  for (const t of TABS) {
    const btn = (
      <button type="button" class="li-tab">
        {t.label}
      </button>
    ) as HTMLButtonElement;
    tap(btn, (): void => ui?.(t.id));
    tabBtns.set(t.id, btn);
    tabscroll.append(btn);
  }
  const tabs = (
    <div class="li-tabs">
      {tabscroll}
      {sparkEl}
    </div>
  );

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
    if (!menu.hidden && !menu.contains(e.target as Node) && e.target !== gear)
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
    // Suspend the stats pane's bindings whenever its tab isn't the visible one.
    if (tab === "stats") statsScope?.resume();
    else statsScope?.pause();
    if (tab !== "graph") gPaint([], false); // drop any lingering hover highlight
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
    for (const f of scrollFades) f.refresh();
  });

  scrollFades.push(wireScrollFade(bodyEl, "y"), wireScrollFade(tabscroll, "x"));
  startMetrics();
}

/** Remove the panel and stop all observation/timers. Safe to call when not mounted. */
export function unmountInspector(): void {
  metricsMeter?.stop();
  metricsMeter = null;
  heartbeat?.stop();
  heartbeat = null;
  heapSource?.stop();
  heapSource = null;
  if (lagTimer != null) clearInterval(lagTimer);
  lagTimer = null;
  if (rafHandle != null) cancelAnimationFrame(rafHandle);
  rafHandle = null;
  for (const f of scrollFades) f.dispose();
  scrollFades.length = 0;
  // Stopping the bindings drops the vital sources' last subscribers, which auto-disconnects
  // their PerformanceObservers (no manual teardown needed).
  for (const stop of bindings) stop();
  bindings.length = 0;
  inspectorScope = statsScope = null;
  clsSource = lcpSource = inpSource = longTasksSource = null;
  if (closeMenuOnOutside)
    document.removeEventListener("pointerdown", closeMenuOnOutside);
  closeMenuOnOutside = null;
  menuEl?.remove();
  menuEl = null;
  panel?.remove();
  panel = null;
  bodyEl = null;
  ui = null;
  metricSeq = 0;

  // Reset live metrics so the next mount starts clean.
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
  nodeSources = nodeScopes = nodeChannels = 0;
  for (const o of gOverlays) o.remove();
  gOverlays = [];
  graphEl = null;
  graphRows.clear();
  graphGroups.clear();
  graphCollapsed.clear();
  graphById = new Map();
  sparkIn.length = 0;
  sparkOut.length = 0;
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
