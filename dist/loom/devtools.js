import "./defer.js";
import { c as e } from "./ownership-base-SRCUIJtL.js";
import { C as t, D as n, _ as r, c as i, i as a, w as o, x as s } from "./loom-Bchrc-TP.js";
import { f as c, n as l, p as u, t as ee, v as te, y as ne } from "./dom-GgmJq4dj.js";
import { i as re, n as d } from "./events-C3Am8PgS.js";
import { t as ie } from "./motion-BjmrBjQI.js";
import { bindStorage as f, codecs as p, storageSlot as m } from "./storage.js";
import { a as h, i as g, n as _, o as ae, r as v } from "./observe-Dm8fpfu4.js";
import { virtualList as oe } from "./virtual-list.js";
import { jsx as y, jsxs as b } from "./jsx-runtime.js";
// src/devtools/bindings.ts
var x = { internal: !0 }, se = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;flex:auto;align-items:flex-end;gap:1px;min-width:0;margin-top:6px;display:flex;overflow-x:auto}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", S = "loom-inspector";
// src/devtools/format.ts
function ce(e, t) {
	return e === void 0 ? "—" : e === null ? "null" : typeof e == "number" ? Number.isInteger(e) ? String(e) : e.toFixed(2) : typeof e == "string" ? e.length > t ? `"${e.slice(0, t)}…"` : `"${e}"` : typeof e == "boolean" ? String(e) : Array.isArray(e) ? `[${e.length}]` : typeof e == "object" ? "{…}" : String(e);
}
function le(e) {
	return typeof e == "number" ? "li-gv-num" : typeof e == "string" ? "li-gv-str" : typeof e == "boolean" ? "li-gv-bool" : e == null ? "li-gv-nul" : "";
}
// src/devtools/icons.ts
function ue(e, t) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`;
}
var de = "<polyline points=\"4 14 10 14 10 20\"/><polyline points=\"20 10 14 10 14 4\"/><line x1=\"14\" x2=\"21\" y1=\"10\" y2=\"3\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", fe = "<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" x2=\"14\" y1=\"3\" y2=\"10\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", pe = "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>", me = "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", he = "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>", ge = "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", _e = "<circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"currentColor\" stroke=\"none\"/>", ve = "<circle cx=\"12\" cy=\"12\" r=\"5\"/>", ye = "<path d=\"M5 19c.264.956.797 2 2.187 2c2.407 0 3.008-2 4.813-9s2.406-9 4.813-9c1.39 0 1.923 1.044 2.187 2M9 10h8\"/>", be = "<path d=\"m6 9 6 6 6-6\"/>", xe = "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"22\" x2=\"18\" y1=\"12\" y2=\"12\"/><line x1=\"6\" x2=\"2\" y1=\"12\" y2=\"12\"/><line x1=\"12\" x2=\"12\" y1=\"6\" y2=\"2\"/><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"18\"/>", Se = "<path d=\"M3 6h18\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", Ce = "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/>", we = "<polygon points=\"6 3 20 12 6 21 6 3\"/>";
function Te(e) {
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.firstElementChild;
	if (!n) throw Error("icon markup produced no element");
	return n;
}
function Ee(e, t) {
	return Te(ue(e, t));
}
function De(e) {
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
// src/devtools/graph.tsx
var Oe = 300, ke = 22, Ae = 16, C = null, je = /* @__PURE__ */ new Map(), Me = 0, Ne = [], w = [], Pe = [], Fe = null, Ie = -1, Le = 0, Re = !1, ze = !1, T = /* @__PURE__ */ new Set(), Be = -1;
function Ve() {
	return C = oe({
		rowHeight: ke,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: et
	}), C.el.classList.add("li-pane", "li-graph"), C.el;
}
function He(e) {
	return E(e.id).length > 0;
}
function Ue(e, t) {
	if (typeof t == "number") {
		let n = Number(e);
		return Number.isNaN(n) ? t : n;
	}
	return e;
}
function We(e) {
	if (e.kind !== "state" || !e.source) return !1;
	let t = e.value;
	return t === null || typeof t == "number" || typeof t == "string" || typeof t == "boolean";
}
function Ge(e, t, n, r = !1) {
	if (Ie === n) return;
	let i = e.querySelector(".li-gval");
	if (!i) return;
	let a = ce(t, Ae);
	!r && !Re && e.dataset.prev !== void 0 && e.dataset.prev !== a && Ze(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${le(t)}`, e.dataset.prev = a;
}
function Ke(e, t, n, r) {
	let i = t();
	if (typeof i == "boolean") {
		t(!i), Ge(r, t(), e, !0), qe(e, r);
		return;
	}
	if (i !== null && typeof i != "number" && typeof i != "string") return;
	let a = document.createElement("input");
	a.className = "li-gedit", a.value = typeof i == "string" ? i : String(i), Fe = a, Ie = e, n.replaceWith(a), a.focus(), a.select();
	let o = () => {
		Fe = null, Ie = -1, a.parentNode && a.replaceWith(n);
	}, s = () => {
		Fe === a && (t(Ue(a.value, i)), o(), Ge(r, t(), e, !0), qe(e, r));
	};
	a.onblur = s, a.onkeydown = (e) => {
		e.key === "Enter" ? s() : e.key === "Escape" && o();
	};
}
function qe(e, t) {
	t.matches(":hover") && D(E(e), !0);
}
function E(e) {
	let t = [], n = /* @__PURE__ */ new Set([e]), r = je.get(e), i = r ? [...r.subs] : [];
	for (; i.length > 0;) {
		let e = i.shift();
		if (e === void 0 || n.has(e)) continue;
		n.add(e);
		let r = je.get(e);
		if (r) {
			if (r.kind === "effect") {
				let e = r.target;
				(e instanceof Element || e instanceof CharacterData) && t.push(e);
			} else for (let e of r.subs) i.push(e);
		}
	}
	return t;
}
function Je(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of je.values()) if (r.group === e) for (let e of E(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function Ye(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function D(e, t) {
	for (let e of Pe) e.remove();
	if (Pe = [], t) for (let t of e) {
		let e = Ye(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), Pe.push(n);
	}
}
function Xe(e) {
	let t = performance.now();
	t - Me >= Oe && (je = new Map(h({ active: !0 }).nodes.map((e) => [e.id, e])), Me = t), D(E(e), !0);
}
function Ze(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function Qe(e, t) {
	let n = e[0], r = n instanceof Element ? n : n?.parentElement ?? null;
	if (!r) return;
	D([], !1), r.scrollIntoView({
		block: "center",
		inline: "nearest",
		behavior: "smooth"
	});
	let i = !1, a = () => {
		i || (i = !0, window.removeEventListener("scrollend", a), t() && D(e, !0));
	};
	window.addEventListener("scrollend", a), window.setTimeout(a, 600);
}
function $e(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `props #${e}`;
}
function et(e, t) {
	if (e.kind === "header") return t ? nt(t, e) : tt(e);
	let n = t ? it(t, e) : rt(e);
	return e.node.id === Be && (Ze(n), Be = -1), n;
}
function tt(e) {
	let t = /* @__PURE__ */ y("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ y("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = Ee(be, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ y("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(Ee(xe, 11));
	let a = /* @__PURE__ */ b("div", {
		class: "li-gns-h",
		children: [
			r,
			n,
			t,
			i
		]
	}), o = e.gid;
	return T.has(o) && a.classList.add("collapsed"), a.onclick = () => {
		T.has(o) ? T.delete(o) : T.add(o), C?.setItems(st());
	}, i.onclick = (e) => {
		e.stopPropagation(), Qe(Je(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => D(Je(o), !0), a.onmouseleave = () => D(Je(o), !1), a;
}
function nt(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", T.has(t.gid)), e;
}
function rt(e) {
	let t = e.node, n = /* @__PURE__ */ y("span", { class: "li-gval" }), r = He(t), i = Ee(t.kind === "computed" ? ye : r ? _e : ve, 13);
	i.classList.add("li-gicon", r ? t.kind === "computed" ? "li-gi-computed" : "li-gi-state" : "li-gi-dim");
	let a = e.child ? t.key ?? t.label : t.label, o = /* @__PURE__ */ b("div", {
		class: "li-grow",
		children: [
			i,
			/* @__PURE__ */ y("span", {
				class: "li-glabel",
				children: a
			}),
			n
		]
	});
	if (e.child && o.classList.add("li-grow-child"), o.onmouseenter = () => D(E(t.id), !0), o.onmouseleave = () => D(E(t.id), !1), We(t)) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => Ke(t.id, e, n, o);
	}
	return Ge(o, t.value, t.id), o;
}
function it(e, t) {
	return Ge(e, t.node.value, t.node.id), e;
}
function at() {
	let e = w.length;
	for (let t of Ne) e += 1 + (T.has(t.gid) ? 0 : t.signals.length);
	return e;
}
function ot(e) {
	let t = e;
	for (let e of Ne) {
		if (t === 0) return {
			kind: "header",
			gid: e.gid,
			label: e.label,
			count: e.signals.length
		};
		if (--t, !T.has(e.gid)) {
			if (t < e.signals.length) return {
				kind: "signal",
				node: e.signals[t],
				child: !0
			};
			t -= e.signals.length;
		}
	}
	return t < w.length ? {
		kind: "signal",
		node: w[t],
		child: !1
	} : void 0;
}
function st() {
	return {
		length: at(),
		at: ot
	};
}
function ct() {
	if (!C) return;
	let e = h({ active: !0 }).nodes;
	je = new Map(e.map((e) => [e.id, e])), Me = performance.now();
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) if (!(r.internal || r.kind === "effect")) {
		if (r.group !== void 0) {
			let e = t.get(r.group);
			e ? e.push(r) : t.set(r.group, [r]);
		} else n.push(r);
	}
	Ne = [];
	for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), Ne.push({
		gid: e,
		label: $e(e, n),
		signals: n
	});
	w = n, Re = ze, C.setItems(st()), Re = !1, ze = !1;
}
function lt() {
	D([], !1);
}
function ut() {
	let e = performance.now();
	e - Le >= Oe && (Le = e, ct());
}
function dt() {
	if (C) {
		for (let e of C.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		ze = !0, C.refresh();
	}
}
function ft(e) {
	let t = 0;
	for (let n of Ne) {
		let r = n.signals.findIndex((t) => t.id === e);
		if (r >= 0) return T.has(n.gid) && (T.delete(n.gid), C?.setItems(st())), t + 1 + r;
		t += 1 + (T.has(n.gid) ? 0 : n.signals.length);
	}
	let n = w.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function pt(e) {
	if (C === null) return;
	ct();
	let t = ft(e);
	t < 0 || (Be = e, C.scrollToIndex(t));
}
function mt() {
	for (let e of Pe) e.remove();
	Pe = [], Fe = null, Ie = -1, C?.stop(), C = null, Ne = [], w = [], T.clear(), je = /* @__PURE__ */ new Map(), Me = 0, Le = 0, Be = -1, Re = !1, ze = !1;
}
// src/devtools/trace.tsx
var ht = 22, gt = 200, _t = 1e3, vt = [
	"writes",
	"reads",
	"all"
];
function yt(e) {
	return vt.includes(e);
}
var bt = null, xt = null, St = null, O = "all", Ct = null, k = null, wt = null, A = null, j = null, M = [], N = [], P = !1, Tt = !1, F = "", Et = 0, Dt = -1, I = -1, Ot = null;
function kt(e) {
	Ot = e;
}
function At(e) {
	j = e, Mt();
}
function jt(e) {
	Tt !== e && (Tt = e, e ? (Pt(), zt()) : Ft(), Mt());
}
function Mt() {
	j && (j.classList.toggle("inactive", !Tt), j.classList.toggle("off", P), j.title = Tt ? P ? "Paused" : "Live — capturing" : "Trace");
}
function Nt() {
	bt = oe({
		rowHeight: ht,
		key: (e) => e.seq,
		render: Jt
	}), A = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), A.append(Ee(Ce, 12)), d(A, () => Ht(!P));
	let e = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(Ee(Se, 12)), d(e, () => Lt());
	let t = /* @__PURE__ */ y("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: vt.map((e) => /* @__PURE__ */ y("option", {
			value: e,
			children: e
		}))
	});
	t.value = O, t.addEventListener("change", () => {
		yt(t.value) && (O = t.value), It();
	});
	let n = /* @__PURE__ */ y("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		F = n.value.trim().toLowerCase(), N = F ? M.filter((e) => e.name.toLowerCase().includes(F)) : [], Ut();
	}), k = /* @__PURE__ */ y("div", { class: "li-tr-scroll" }), k.append(bt.el), wt = ie(k, { transition: 120 }), k.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== I && (I = Number(t), Xe(I));
	}), k.addEventListener("pointerleave", () => {
		I = -1, lt();
	}), d(k, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (I = -1, lt(), Ot?.(Number(t)));
	}), Ct = /* @__PURE__ */ b("div", {
		class: "li-pane li-trace",
		children: [/* @__PURE__ */ b("div", {
			class: "li-tr-bar",
			children: [
				A,
				t,
				n,
				e
			]
		}), k]
	}), Ct;
}
function Pt() {
	O !== "reads" && !xt && (xt = v([_.write], "samples")), O !== "writes" && !St && (St = v([_.read], "samples"));
}
function Ft() {
	xt?.stop(), xt = null, St?.stop(), St = null;
}
function It() {
	Ft(), Tt && Pt(), Dt = -1, Ut(), zt();
}
function Lt() {
	M = [], N = [], Dt = -1, Ut();
}
function Rt(e) {
	_t = e, M.length > e && (M.length = e), N.length > e && (N.length = e), Ut();
}
function zt() {
	if (P || bt === null) return;
	let e = [], t = xt?.read()["loom:write"]?.samples;
	if (t) for (let n of t) e.push({
		s: n,
		kind: "write"
	});
	let n = St?.read()["loom:read"]?.samples;
	if (n) for (let t of n) e.push({
		s: t,
		kind: "read"
	});
	if (e.length === 0) return;
	O === "all" && e.sort((e, t) => g(e.s).t - g(t.s).t), Kt = !1;
	let r = (F ? N : M)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(Wt(t, n));
	if (i.reverse(), M = i.concat(M), F) {
		let e = i.filter((e) => e.name.toLowerCase().includes(F));
		e.length > 0 && (N = e.concat(N));
	}
	M.length > _t && (M.length = _t), N.length > _t && (N.length = _t), Dt = ((F ? N : M)[0]?.seq ?? -1) === r ? -1 : r, Ut();
}
function Bt() {
	zt(), Ut(), requestAnimationFrame(() => bt?.refresh());
}
function Vt() {
	Ft(), bt = null, Ct = null, k = null, wt?.(), wt = null, A = null, j = null, M = [], N = [], Gt.clear(), Kt = !1, Dt = -1, P = !1, Tt = !1, F = "", O = "all", I = -1, Ot = null;
}
function Ht(e) {
	P = e, A?.replaceChildren(Ee(e ? we : Ce, 12)), Mt(), Ct?.classList.toggle("li-tr-paused", e), e || zt();
}
function Ut() {
	let e = F ? N : M;
	bt?.setItems(O === "all" ? e : e.filter((e) => e.kind === (O === "writes" ? "write" : "read")));
}
function Wt(e, t) {
	let n = g(e), r = n.id, i = qt(r), a = Xt(n.t), o = n.by, s = o === void 0 ? "" : `by ${qt(o)}`;
	if (t === "read") return {
		seq: Et++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: "",
		prevCls: "",
		nextText: "",
		nextCls: "",
		srcText: s,
		full: `${i} — read ${s || "(external)"}`
	};
	let c = g(e), l = ce(c.prev, gt), u = ce(c.next, gt);
	return {
		seq: Et++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: l,
		prevCls: le(c.prev),
		nextText: u,
		nextCls: le(c.next),
		srcText: s,
		full: `${i}: ${l} → ${u} ${s || "(external)"}`
	};
}
var Gt = /* @__PURE__ */ new Map(), Kt = !1;
function qt(e) {
	let t = Gt.get(e);
	if (t !== void 0) return t;
	if (!Kt) {
		Kt = !0;
		for (let e of h().nodes) Gt.set(e.id, e.label);
		let t = Gt.get(e);
		if (t !== void 0) return t;
	}
	return `#${e}`;
}
function Jt(e, t) {
	if (t !== null) return t.classList.toggle("li-tr-mark", e.seq === Dt), t;
	let n = Yt(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3];
	if (e.kind === "write") {
		let t = i.children[0], n = i.children[1], r = i.children[2];
		t.textContent = e.prevText, t.className = `li-tr-val ${e.prevCls}`, n.textContent = " → ", r.textContent = e.nextText, r.className = `li-tr-val ${e.nextCls}`;
	}
	return i.children[3].textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === Dt), n;
}
function Yt() {
	return /* @__PURE__ */ b("div", {
		class: "li-tr",
		children: [
			/* @__PURE__ */ y("span", { class: "li-tr-kind" }),
			/* @__PURE__ */ y("span", { class: "li-tr-time" }),
			/* @__PURE__ */ y("span", { class: "li-tr-name" }),
			/* @__PURE__ */ b("span", {
				class: "li-tr-change",
				children: [
					/* @__PURE__ */ y("span", { class: "li-tr-val" }),
					/* @__PURE__ */ y("span", { class: "li-tr-arrow" }),
					/* @__PURE__ */ y("span", { class: "li-tr-val" }),
					/* @__PURE__ */ y("span", { class: "li-tr-src" })
				]
			})
		]
	});
}
function Xt(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
// src/devtools/stats.tsx
var Zt = 138, Qt = 34, $t = 2 * Math.PI * Qt, en = $t * .75, tn = 120, nn = 55, rn = 30, an = tn / 1e3, on = 200, sn = () => void 0, L = null, cn = null, ln = null, R = null, z = !1, un = !1, dn = null, fn = 0, pn = null, mn = null, hn = 0, gn = 0, _n = 0, vn = 0, yn = 0, bn = 0, xn = 0, Sn = 0, Cn = 0, B = 0, V = !1, wn = 0, Tn = 0, En = 0, Dn = 0, H = [], On = 0, kn = 0, An = 0, jn = !1, Mn = null, Nn = null, Pn = null, Fn = null, In = null, Ln = 100, Rn = "", zn = "", Bn = !1, Vn = "", Hn = 0, Un = 0, Wn = 0, Gn = 0, Kn = 0, qn = 0, Jn = 0, Yn = 0;
function U(e) {
	return e?.() ?? 0;
}
function Xn(e) {
	return () => (L?.(), e());
}
function W(e, t, n) {
	l(e, t, Xn(n), x);
}
function Zn(e) {
	return c(Xn(e), x);
}
var G = (e, t) => e * .6 + t / an * .4;
function K(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function Qn(e) {
	let t = Math.round(100 * Math.max(0, Math.min(1, e / nn)));
	return t >= 70 ? {
		key: "ok",
		label: "healthy",
		score: t
	} : t >= 40 ? {
		key: "warn",
		label: "strained",
		score: t
	} : {
		key: "bad",
		label: "overloaded",
		score: t
	};
}
function $n(e) {
	return er(1e3 / e);
}
function er(e) {
	return e >= nn ? "h-ok" : e >= rn ? "h-warn" : "h-bad";
}
function tr(e, t, n) {
	return e ? e <= t ? "h-ok" : e <= n ? "h-warn" : "h-bad" : "";
}
function nr(e) {
	return (t) => {
		if (typeof PerformanceObserver != "function") return () => {};
		try {
			let n = e(t);
			return () => n.disconnect();
		} catch {
			return () => {};
		}
	};
}
var rr = nr((e) => {
	let t = 0, n = 0, r = 0, i = 0, a = new PerformanceObserver((a) => {
		for (let o of a.getEntries()) {
			let a = o;
			if (a.hadRecentInput || typeof a.value != "number") continue;
			let s = o.startTime;
			t > 0 && (s - r > 1e3 || s - n > 5e3) && (t = 0), t === 0 && (n = s), t += a.value, r = s, t > i && (i = t, e(i));
		}
	});
	return a.observe({
		type: "layout-shift",
		buffered: !0
	}), a;
}), ir = nr((e) => {
	let t = new PerformanceObserver((t) => {
		for (let n of t.getEntries()) n.entryType === "largest-contentful-paint" && e(n.startTime);
	});
	return t.observe({
		type: "largest-contentful-paint",
		buffered: !0
	}), t;
}), ar = nr((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let r of n.getEntries()) (r.entryType === "first-input" || r.interactionId) && r.duration > t && (t = r.duration, e(t));
	});
	return n.observe({
		type: "event",
		buffered: !0,
		durationThreshold: 40
	}), n.observe({
		type: "first-input",
		buffered: !0
	}), n;
}), or = typeof PerformanceObserver == "function" && PerformanceObserver.supportedEntryTypes?.includes("longtask") === !0, sr = nr((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let e of n.getEntries()) t += e.duration;
		e(t);
	});
	return n.observe({
		type: "longtask",
		buffered: !0
	}), n;
});
function cr() {
	return [/* @__PURE__ */ y("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: Qt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${$t}`
	}), /* @__PURE__ */ y("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function lr() {
	let e = /* @__PURE__ */ y("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: Qt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	W(e, "stroke-dasharray", () => `${en * Ln / 100} ${$t}`), W(e, "class", () => `li-garc h-${Rn}`);
	let t = /* @__PURE__ */ y("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(Zn(() => String(Ln))), W(t, "class", () => `li-gnum h-${Rn}`), [e, t];
}
function ur() {
	return /* @__PURE__ */ b("svg", {
		width: 88,
		height: 88,
		viewBox: "0 0 88 88",
		role: "img",
		"aria-label": "Health",
		children: [
			/* @__PURE__ */ y("circle", {
				class: "li-gtrack",
				cx: 44,
				cy: 44,
				r: Qt,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${en} ${$t}`
			}),
			u(Xn(() => Bn), lr, cr),
			/* @__PURE__ */ y("text", {
				class: "li-glbl",
				x: 44,
				y: 61,
				"text-anchor": "middle",
				children: "HEALTH"
			})
		]
	});
}
function dr() {
	let e = [];
	for (let t = 0; t < Zt; t++) e.push(/* @__PURE__ */ y("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	let t = Array(Zt).fill(-1), n = () => {
		L?.();
		let n = e.length - H.length;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (!i) continue;
			let a = r >= n ? H[r - n] ?? 0 : 0;
			if (a === t[r]) continue;
			t[r] = a;
			let o = Math.max(0, Math.min(20, a / 50 * 20));
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? $n(a) : "");
		}
	}, r = /* @__PURE__ */ y("div", {
		class: "li-histo",
		title: J.frames,
		children: /* @__PURE__ */ y("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Zt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
	return ee(r, n, x), r;
}
function q(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ y("span", { class: `li-stat-v ${n}` });
	return i.append(Zn(t)), /* @__PURE__ */ b("div", {
		class: "li-stat",
		children: [/* @__PURE__ */ y("span", {
			class: "li-stat-k",
			title: r,
			children: e
		}), i]
	});
}
var J = {
	fps: "Frames per second, averaged over ~0.5s windows.",
	health: "Overall health (0–100) derived from FPS against a 55fps target.",
	frames: "Recent per-frame render times; taller/red bars are slower frames.",
	lag: "Main-thread lag: how late a fixed 200ms timer fires (now · peak). High = jank.",
	heap: "JS heap used (Chrome only), re-sampled every 5s via poll().",
	cls: "Cumulative Layout Shift — unitless score (not pixels), worst session window (Core Web Vital).",
	lcp: "Largest Contentful Paint — time to the largest paint (Core Web Vital).",
	inp: "Interaction to Next Paint — worst interaction latency (Core Web Vital).",
	blocked: "Total main-thread blocking from long tasks >50ms (lazy source). Not supported in Safari.",
	frameTime: "Render time of the most recent frame. ~16.7ms ≈ 60fps.",
	writes: "State writes per second (state:set events).",
	reads: "Tracked reads per second (reads inside effects/computeds).",
	computedsRate: "Computed values recomputed to a new result per second.",
	effectRuns: "Effect runs per second — DOM bindings + app effects (the rendering output of the pipeline).",
	flushes: "Reactive flush cycles per second.",
	effectsPerFlush: "Effects run in the most recent flush (its batch size).",
	flushTime: "Wall-clock duration of the most recent flush.",
	creates: "Reactive nodes (state/computed/effect) created per second — graph allocation rate.",
	disposes: "Reactive nodes disposed per second — graph teardown rate.",
	states: "Live state signals in the reactive graph.",
	computeds: "Live computed values.",
	effects: "Live app effects (your effect() calls), excluding DOM-binding views.",
	views: "Live DOM bindings (text/attr/class/style/list) — the rendering output.",
	sources: "Live lazy sources (source/poll) — external producers wired into the graph.",
	scopes: "Live scopes grouping effects and resources.",
	channels: "Registered channels — gated ring-buffer event streams for any use (7 built-in reactive ones + any the app declares).",
	unread: "States/computeds nothing currently reads (no subscribers). Some are normal; a count that keeps climbing under steady state suggests leaked signals."
};
function fr() {
	let e = /* @__PURE__ */ y("span", { class: "li-perfh-fps" });
	e.append(Zn(() => V ? `${Math.round(B)} fps` : "— fps")), W(e, "class", () => `li-perfh-fps ${Vn}`);
	let t = /* @__PURE__ */ y("div", {
		class: "li-hlabel",
		title: J.health
	});
	t.append(Zn(() => V ? zn.toUpperCase() : "LOADING")), W(t, "class", () => Bn ? `li-hlabel h-${Rn}` : "li-hlabel");
	let n = /* @__PURE__ */ b("div", {
		class: "li-hstats",
		children: [t, q("lag", () => `${On.toFixed(0)} · pk ${kn.toFixed(0)} ms`, "lo", J.lag)]
	});
	return n.append(pr("blocked", () => {
		if (!or) return "—";
		let e = U(Fn);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!or) return "";
		let e = U(Fn);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, J.blocked)), n.append(pr("CLS", () => U(Mn).toFixed(2), () => {
		let e = U(Mn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, J.cls)), n.append(pr("LCP", () => {
		let e = U(Nn);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => tr(U(Nn), 2500, 4e3), J.lcp)), n.append(pr("INP", () => {
		let e = U(Pn);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => tr(U(Pn), 200, 500), J.inp)), /* @__PURE__ */ b("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ b("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ y("span", {
					title: J.fps,
					children: "Performance"
				}), e]
			}),
			dr(),
			/* @__PURE__ */ b("div", {
				class: "li-hblock",
				children: [ur(), n]
			}),
			q("frame time", () => `${Dn.toFixed(1)} ms`, "", J.frameTime),
			mr() ? hr() : null,
			q("writes / s", () => K(gn), "hi", J.writes),
			q("reads / s", () => K(hn), "hi", J.reads),
			q("computeds / s", () => K(_n), "", J.computedsRate),
			q("effect runs / s", () => K(vn), "lo", J.effectRuns),
			q("flushes / s", () => K(yn), "lo", J.flushes),
			q("effects / flush", () => String(Sn), "", J.effectsPerFlush),
			q("flush time", () => `${Cn.toFixed(1)} ms`, "", J.flushTime),
			q("creates / s", () => K(bn), "lo", J.creates),
			q("disposes / s", () => K(xn), "lo", J.disposes),
			q("states", () => String(Hn), "", J.states),
			q("computeds", () => String(Un), "", J.computeds),
			pr("unread", () => String(Yn), () => Yn > 0 ? "h-warn" : "", J.unread),
			q("effects", () => String(Wn), "", J.effects),
			q("views", () => String(Gn), "", J.views),
			q("sources", () => String(Kn), "", J.sources),
			q("scopes", () => String(qn), "", J.scopes),
			q("channels", () => String(Jn), "", J.channels)
		]
	});
}
function pr(e, t, n, r = "") {
	let i = q(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && W(a, "class", () => `li-stat-v ${n()}`), i;
}
function mr() {
	return performance.memory;
}
function hr() {
	return q("heap", () => {
		let e = In?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", J.heap);
}
function gr() {
	let e = pn?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, s = mn?.read()?.["loom:flush"];
	hn = G(hn, t), gn = G(gn, n), vn = G(vn, r), _n = G(_n, i), bn = G(bn, a), xn = G(xn, o), yn = G(yn, s?.count ?? 0);
	let c = g(s?.samples.at(-1));
	if (c !== void 0 && (Sn = c.batchSize, Cn = c.durationMs), !V) Bn = !1, Vn = "";
	else {
		let e = Qn(B);
		Ln = e.score, Rn = e.key, zn = e.label, Bn = !0, Vn = er(B);
	}
	return ++fn;
}
function _r() {
	let e = !un;
	if (sn() === "stats" && e) {
		let e = ae();
		Hn = e.states, Un = e.computeds, Wn = e.effects - e.targetedEffects, Gn = e.targetedEffects, Kn = e.sources, qn = e.scopes, Jn = e.channels, Yn = e.unread;
	} else sn() === "graph" && e ? ut() : sn() === "trace" && e && zt();
}
function vr() {
	document.hidden && (jn = !0);
}
function yr() {
	An = performance.now() + on, cn = setInterval(() => {
		let e = performance.now(), t = An;
		An = e + on, document.hidden ? jn = !0 : jn ? jn = !1 : (On = Math.max(0, e - t), On > kn && (kn = On));
	}, on), document.addEventListener("visibilitychange", vr), En = 0;
	let e = (t) => {
		if (ln = requestAnimationFrame(e), En) {
			let e = Math.min(t - En, 1e3);
			if (Dn = e, H.push(e), H.length > Zt && H.shift(), wn += e, Tn++, wn >= 500) {
				let e = Tn * 1e3 / wn;
				B = V ? B * .5 + e * .5 : e, V = !0, wn = 0, Tn = 0;
			}
		}
		En = t;
	};
	ln = requestAnimationFrame(e);
}
function br(e) {
	sn = e.activeTab, pn = v([
		_.read,
		_.write,
		_.compute,
		_.effect,
		_.create,
		_.dispose
	]), mn = v([_.flush], "samples"), L = r(gr, tn, x);
	let a;
	return dn = s(() => {
		Mn = t(rr, 0, x), Nn = t(ir, 0, x), Pn = t(ar, 0, x), Fn = t(sr, 0, x), mr() && (In = r(() => mr()?.usedJSHeapSize ?? 0, 5e3, x)), a = fr();
	}, x), i(() => {
		L?.(), n(_r);
	}, {
		...x,
		defer: !0,
		maxStale: tn
	}), R = a, z = !1, yr(), a;
}
function xr() {
	dn?.pause(), R && !z && (z = !0, te(R));
}
function Sr() {
	dn?.resume(), R && z && (z = !1, ne(R));
}
function Cr(e) {
	R && un !== e && (un = e, e ? te(R) : ne(R));
}
function wr() {
	pn?.stop(), pn = null, mn?.stop(), mn = null, L?.stop(), L = null, cn != null && clearInterval(cn), cn = null, typeof document < "u" && document.removeEventListener("visibilitychange", vr), ln != null && cancelAnimationFrame(ln), ln = null, dn?.stop(), dn = null, R = null, z = !1, un = !1, In = Mn = Nn = Pn = Fn = null, fn = 0, hn = gn = _n = vn = yn = 0, bn = xn = 0, Sn = Cn = 0, B = 0, V = !1, wn = Tn = En = Dn = 0, H.length = 0, On = kn = 0, jn = !1, Bn = !1, Ln = 100, Rn = zn = Vn = "", Hn = Un = Wn = Gn = 0, Kn = qn = Jn = Yn = 0;
}
// src/devtools/panel.tsx
var Tr = [
	"system",
	"light",
	"dark"
], Er = 240, Dr = 160, Or = 8, kr = {
	system: he,
	light: pe,
	dark: me
}, Ar = [
	{
		id: "stats",
		label: "Info"
	},
	{
		id: "graph",
		label: "Graph"
	},
	{
		id: "trace",
		label: "Trace"
	}
], Y = null, jr = null, X = null, Mr = null, Nr = [], Pr = null, Fr = null, Ir = null, Lr = null, Z = null, Rr = /* @__PURE__ */ new Map(), zr = null, Br = [
	1e3,
	5e3,
	25e3
], Vr = null;
function Q() {
	if (Vr) return Vr;
	Fr = new AbortController();
	let e = { signal: Fr.signal }, t = {
		theme: o("system", x),
		min: o(!1, x),
		logSize: o(1e3, x),
		pos: o(null, x),
		size: o(null, x)
	};
	return f(t.theme, m(`${S}-theme`, p.string(Tr)), e), f(t.min, m(`${S}-min`, p.boolean), e), f(t.logSize, m(`${S}-logsize`, {
		...p.number(),
		validate: (e) => Br.includes(e)
	}), e), f(t.pos, m(`${S}-pos`, p.json((e) => typeof e == "object" && !!e && "left" in e && "top" in e && typeof e.left == "number" && Number.isFinite(e.left) && typeof e.top == "number" && Number.isFinite(e.top))), e), f(t.size, m(`${S}-size`, p.json((e) => typeof e == "object" && !!e && "width" in e && "height" in e && typeof e.width == "number" && e.width > 0 && typeof e.height == "number" && e.height > 0)), e), Vr = t, t;
}
function $(e) {
	let t = window.devicePixelRatio || 1;
	return Math.round(e * t) / t;
}
function Hr(e, t, n, r) {
	let i = e.offsetWidth, a = Math.min(80, i);
	return {
		left: $(Math.min(window.innerWidth - a, Math.max(a - i, n))),
		top: $(Math.min(window.innerHeight - t, Math.max(0, r)))
	};
}
function Ur(e, t, n) {
	let r = Math.max(0, window.innerWidth - e.offsetWidth), i = Math.max(0, window.innerHeight - e.offsetHeight);
	return {
		left: $(Math.max(0, Math.min(t, r))),
		top: $(Math.max(0, Math.min(n, i)))
	};
}
function Wr(e, t, n, r, i) {
	Lr?.();
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto";
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s;
	s = re(e, n, {
		move: (e) => r(e, a),
		end: () => {
			Lr === s && (Lr = null), document.body.style.userSelect = o, i();
		}
	}), Lr = s;
}
function Gr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		if (n.target?.closest("button")) return;
		n.preventDefault();
		let r = n.clientX, i = n.clientY, a = null;
		e.style.cursor = "grabbing", Wr(e, t, n, (n, o) => {
			let { left: s, top: c } = Hr(t, e.offsetHeight || 40, o.left + n.clientX - r, o.top + n.clientY - i);
			t.style.left = `${s}px`, t.style.top = `${c}px`, a = {
				left: s,
				top: c
			};
		}, () => {
			e.style.cursor = "", a && Q().pos(a);
		});
	});
}
function Kr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		n.preventDefault(), n.stopPropagation();
		let r = n.clientX, i = n.clientY, a = null;
		Wr(e, t, n, (e, n) => {
			let o = $(Math.max(Er, Math.min(window.innerWidth - n.left - Or, n.width + e.clientX - r))), s = $(Math.max(Dr, Math.min(window.innerHeight - n.top - Or, n.height + e.clientY - i)));
			t.style.width = `${o}px`, t.style.height = `${s}px`, a = {
				width: o,
				height: s
			};
		}, () => {
			a && Q().size(a);
		});
	});
}
function qr(e) {
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function Jr(e) {
	if (Y || typeof document > "u") return;
	let t = e ?? document.body;
	if (Ir = a({ inspect: !0 }).inspect ?? !1, !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${S}-css`, e.textContent = se, document.head.append(e);
	}
	Z = o("stats", x);
	let n = Q().theme(), r = /* @__PURE__ */ y("span", { class: "li-menu-val" }), i = () => {
		Y?.setAttribute("data-theme", n), jr?.setAttribute("data-theme", n), r.innerHTML = ue(kr[n], 13), c.title = `Theme: ${n} (click to cycle)`;
	}, c = /* @__PURE__ */ b("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ y("span", { children: "Theme" }), r]
	});
	d(c, () => {
		n = Tr[(Tr.indexOf(n) + 1) % Tr.length] ?? "system", Q().theme(n), i();
	});
	let l = /* @__PURE__ */ y("div", {
		class: "li-menu",
		hidden: !0
	});
	l.id = `${S}-menu`, l.append(c), jr = l;
	let u = Q().logSize(), te = /* @__PURE__ */ y("span", { class: "li-menu-val" }), ne = () => {
		te.textContent = `${u / 1e3}k`, Rt(u);
	}, re = /* @__PURE__ */ b("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ y("span", { children: "Log size" }), te]
	});
	d(re, () => {
		u = Br[(Br.indexOf(u) + 1) % Br.length] ?? 1e3, Q().logSize(u), ne();
	}), l.append(re), ne();
	let f = () => {
		l.hidden = !0;
	}, p = /* @__PURE__ */ b("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ y("span", { children: "Hide" }), /* @__PURE__ */ y("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	d(p, () => {
		f(), Yr();
	}), l.append(p);
	let m = /* @__PURE__ */ y("button", {
		type: "button",
		title: "Settings"
	});
	m.append(qr(ge)), d(m, (e) => {
		if (e.stopPropagation(), !l.hidden) {
			f();
			return;
		}
		l.hidden = !1;
		let t = m.getBoundingClientRect(), n = l.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), l.style.left = `${Math.max(8, r)}px`, l.style.top = `${Math.max(8, i)}px`;
	});
	let h = /* @__PURE__ */ y("button", { type: "button" }), g = (e) => {
		h.title = e ? "Expand" : "Collapse", h.replaceChildren(qr(e ? fe : de));
	}, _ = Q().min();
	g(_), d(h, () => {
		let e = !!Y?.classList.toggle("li-min");
		g(e), Q().min(e), e ? Pr?.pause() : Pr?.resume(), Cr(e), jt(!e && Z?.() === "trace");
	});
	let ae = /* @__PURE__ */ b("span", {
		class: "li-brand",
		children: [De(15), /* @__PURE__ */ y("b", { children: "Loom" })]
	}), v = /* @__PURE__ */ b("div", {
		class: "li-bar",
		children: [
			ae,
			/* @__PURE__ */ y("span", { class: "li-sp" }),
			m,
			h
		]
	}), oe;
	Pr = s(() => {
		oe = br({ activeTab: () => Z?.() });
	}, x), _ && (Pr.pause(), Cr(!0));
	let ce = /* @__PURE__ */ new Map(), le = /* @__PURE__ */ new Map();
	X = /* @__PURE__ */ y("div", { class: "li-body" });
	for (let e of Ar) {
		let t = e.id === "stats" ? oe : e.id === "graph" ? Ve() : Nt();
		ce.set(e.id, t), X.append(t);
	}
	kt((e) => {
		Z?.("graph"), pt(e);
	});
	let pe = /* @__PURE__ */ y("div", { class: "li-tabscroll" });
	for (let e of Ar) {
		let t = /* @__PURE__ */ y("button", {
			type: "button",
			class: "li-tab",
			children: e.label
		});
		if (e.id === "trace") {
			let e = /* @__PURE__ */ y("span", {
				class: "li-tr-live",
				title: "Live — capturing"
			});
			t.append(e), At(e);
		}
		d(t, () => Z?.(e.id)), le.set(e.id, t), pe.append(t);
	}
	let me = /* @__PURE__ */ y("div", {
		class: "li-tabs",
		children: pe
	}), he = /* @__PURE__ */ y("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ y("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ y("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	Y = /* @__PURE__ */ b("div", { children: [
		v,
		me,
		X,
		he
	] }), Y.id = S, _ && Y.classList.add("li-min"), i(), Gr(v, Y), Kr(he, Y), Mr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		l.hidden || t !== null && l.contains(t) || e.target === m || f();
	}, document.addEventListener("pointerdown", Mr), t.append(Y), document.body.append(l);
	let _e = Q().size(), ve = Q().pos();
	if (_e && (Y.style.width = `${Math.max(Er, Math.min(_e.width, window.innerWidth - 16))}px`, Y.style.height = `${Math.max(Dr, Math.min(_e.height, window.innerHeight - 16))}px`), ve) {
		let { left: e, top: t } = Ur(Y, ve.left, ve.top);
		Y.style.left = `${e}px`, Y.style.top = `${t}px`, Y.style.right = "auto", Y.style.bottom = "auto";
	}
	ee(Y, () => {
		let e = Z?.();
		zr && zr !== e && X && Rr.set(zr, X.scrollTop), e === "stats" ? Sr() : xr(), e !== "graph" && lt();
		for (let t of Ar) {
			let n = t.id === e, r = ce.get(t.id), i = le.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (jt(e === "trace" && Y?.classList.contains("li-min") !== !0), e && X) {
			let t = Rr.get(e) ?? 0, n = Math.max(0, X.scrollHeight - X.clientHeight);
			X.scrollTop = Math.min(t, n), e === "graph" ? dt() : e === "trace" && Bt();
		}
		zr = e ?? null;
	}), Nr.push(ie(X, { transition: 120 }), ie(pe, {
		axis: "x",
		transition: 120
	}));
}
function Yr() {
	if (typeof document < "u") {
		Lr?.(), Lr = null, wr();
		for (let e of Nr) e();
		Nr.length = 0, Pr?.stop(), Pr = null, Fr?.abort(), Fr = null, Vr = null, Mr && document.removeEventListener("pointerdown", Mr), Mr = null, jr && e(jr), jr = null, Y && e(Y), Y = null, X = null, Z = null, Rr.clear(), zr = null, mt(), Vt(), Ir !== null && a({ inspect: Ir }), Ir = null;
	}
}
function Xr() {
	return Y !== null;
}
function Zr(e) {
	Y ? Yr() : Jr(e);
}
export { Xr as inspectorMounted, Jr as mountInspector, Zr as toggleInspector, Yr as unmountInspector };
