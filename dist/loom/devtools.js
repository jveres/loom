import { S as e, b as t, i as n, m as r, v as i, y as a } from "./loom-Doq0e1ZU.js";
import { i as o, n as s, r as c } from "./meter-6h-O7R_x.js";
import { n as l, t as u } from "./observe-ePwGsY8l.js";
import { c as d, f as ee, g as f, h as te, n as ne, p as re, t as ie } from "./dom-D9bXYKGB.js";
import { a as p } from "./ownership-base-DfUs28hK.js";
import { virtualList as ae } from "./dom/virtual-list.js";
import "./defer.js";
import { scrollFade as oe } from "./dom/scroll-fade.js";
import { jsx as m, jsxs as h } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var g = { internal: !0 }, se = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;flex:auto;align-items:flex-end;gap:1px;min-width:0;margin-top:6px;display:flex;overflow-x:auto}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", _ = "loom-inspector";
//#endregion
//#region src/devtools/format.ts
function ce(e, t) {
	return e === void 0 ? "—" : e === null ? "null" : typeof e == "number" ? Number.isInteger(e) ? String(e) : e.toFixed(2) : typeof e == "string" ? e.length > t ? `"${e.slice(0, t)}…"` : `"${e}"` : typeof e == "boolean" ? String(e) : Array.isArray(e) ? `[${e.length}]` : typeof e == "object" ? "{…}" : String(e);
}
function le(e) {
	return typeof e == "number" ? "li-gv-num" : typeof e == "string" ? "li-gv-str" : typeof e == "boolean" ? "li-gv-bool" : e == null ? "li-gv-nul" : "";
}
//#endregion
//#region src/devtools/icons.ts
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
function v(e, t) {
	return Te(ue(e, t));
}
function Ee(e) {
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var De = 300, Oe = 22, ke = 16, y = null, b = /* @__PURE__ */ new Map(), Ae = 0, x = [], S = [], je = [], Me = null, Ne = -1, Pe = 0, Fe = !1, Ie = !1, C = /* @__PURE__ */ new Set(), Le = -1;
function Re() {
	return y = ae({
		rowHeight: Oe,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: Ze
	}), y.el.classList.add("li-pane", "li-graph"), y.el;
}
function ze(e) {
	return w(e.id).length > 0;
}
function Be(e, t) {
	if (typeof t == "number") {
		let n = Number(e);
		return Number.isNaN(n) ? t : n;
	}
	return e;
}
function Ve(e) {
	if (e.kind !== "state" || !e.source) return !1;
	let t = e.value;
	return t === null || typeof t == "number" || typeof t == "string" || typeof t == "boolean";
}
function He(e, t, n, r = !1) {
	if (Ne === n) return;
	let i = e.querySelector(".li-gval");
	if (!i) return;
	let a = ce(t, ke);
	!r && !Fe && e.dataset.prev !== void 0 && e.dataset.prev !== a && Je(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${le(t)}`, e.dataset.prev = a;
}
function Ue(e, t, n, r) {
	let i = t();
	if (typeof i == "boolean") {
		t(!i), He(r, t(), e, !0), We(e, r);
		return;
	}
	if (i !== null && typeof i != "number" && typeof i != "string") return;
	let a = document.createElement("input");
	a.className = "li-gedit", a.value = typeof i == "string" ? i : String(i), Me = a, Ne = e, n.replaceWith(a), a.focus(), a.select();
	let o = () => {
		Me = null, Ne = -1, a.parentNode && a.replaceWith(n);
	}, s = () => {
		Me === a && (t(Be(a.value, i)), o(), He(r, t(), e, !0), We(e, r));
	};
	a.onblur = s, a.onkeydown = (e) => {
		e.key === "Enter" ? s() : e.key === "Escape" && o();
	};
}
function We(e, t) {
	t.matches(":hover") && T(w(e), !0);
}
function w(e) {
	let t = [], n = /* @__PURE__ */ new Set([e]), r = b.get(e), i = r ? [...r.subs] : [];
	for (; i.length > 0;) {
		let e = i.shift();
		if (e === void 0 || n.has(e)) continue;
		n.add(e);
		let r = b.get(e);
		if (r) if (r.kind === "effect") {
			let e = r.target;
			(e instanceof Element || e instanceof CharacterData) && t.push(e);
		} else for (let e of r.subs) i.push(e);
	}
	return t;
}
function Ge(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of b.values()) if (r.group === e) for (let e of w(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function Ke(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function T(e, t) {
	for (let e of je) e.remove();
	if (je = [], t) for (let t of e) {
		let e = Ke(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), je.push(n);
	}
}
function qe(e) {
	let t = performance.now();
	t - Ae >= De && (b = new Map(u({ active: !0 }).nodes.map((e) => [e.id, e])), Ae = t), T(w(e), !0);
}
function Je(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function Ye(e, t) {
	let n = e[0], r = n instanceof Element ? n : n?.parentElement ?? null;
	if (!r) return;
	T([], !1), r.scrollIntoView({
		block: "center",
		inline: "nearest",
		behavior: "smooth"
	});
	let i = !1, a = () => {
		i || (i = !0, window.removeEventListener("scrollend", a), t() && T(e, !0));
	};
	window.addEventListener("scrollend", a), window.setTimeout(a, 600);
}
function Xe(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `props #${e}`;
}
function Ze(e, t) {
	if (e.kind === "header") return t ? $e(t, e) : Qe(e);
	let n = t ? tt(t, e) : et(e);
	return e.node.id === Le && (Je(n), Le = -1), n;
}
function Qe(e) {
	let t = /* @__PURE__ */ m("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ m("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = v(be, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ m("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(v(xe, 11));
	let a = /* @__PURE__ */ h("div", {
		class: "li-gns-h",
		children: [
			r,
			n,
			t,
			i
		]
	}), o = e.gid;
	return C.has(o) && a.classList.add("collapsed"), a.onclick = () => {
		C.has(o) ? C.delete(o) : C.add(o), y?.setItems(it());
	}, i.onclick = (e) => {
		e.stopPropagation(), Ye(Ge(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => T(Ge(o), !0), a.onmouseleave = () => T(Ge(o), !1), a;
}
function $e(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", C.has(t.gid)), e;
}
function et(e) {
	let t = e.node, n = /* @__PURE__ */ m("span", { class: "li-gval" }), r = ze(t), i = v(t.kind === "computed" ? ye : r ? _e : ve, 13);
	i.classList.add("li-gicon", r ? t.kind === "computed" ? "li-gi-computed" : "li-gi-state" : "li-gi-dim");
	let a = /* @__PURE__ */ h("div", {
		class: "li-grow",
		children: [
			i,
			/* @__PURE__ */ m("span", {
				class: "li-glabel",
				children: e.child ? t.key ?? t.label : t.label
			}),
			n
		]
	});
	if (e.child && a.classList.add("li-grow-child"), a.onmouseenter = () => T(w(t.id), !0), a.onmouseleave = () => T(w(t.id), !1), Ve(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => Ue(t.id, e, n, a);
	}
	return He(a, t.value, t.id), a;
}
function tt(e, t) {
	return He(e, t.node.value, t.node.id), e;
}
function nt() {
	let e = S.length;
	for (let t of x) e += 1 + (C.has(t.gid) ? 0 : t.signals.length);
	return e;
}
function rt(e) {
	let t = e;
	for (let e of x) {
		if (t === 0) return {
			kind: "header",
			gid: e.gid,
			label: e.label,
			count: e.signals.length
		};
		if (--t, !C.has(e.gid)) {
			if (t < e.signals.length) return {
				kind: "signal",
				node: e.signals[t],
				child: !0
			};
			t -= e.signals.length;
		}
	}
	return t < S.length ? {
		kind: "signal",
		node: S[t],
		child: !1
	} : void 0;
}
function it() {
	return {
		length: nt(),
		at: rt
	};
}
function at() {
	if (!y) return;
	let e = u({ active: !0 }).nodes;
	b = new Map(e.map((e) => [e.id, e])), Ae = performance.now();
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) if (!(r.internal || r.kind === "effect")) if (r.group !== void 0) {
		let e = t.get(r.group);
		e ? e.push(r) : t.set(r.group, [r]);
	} else n.push(r);
	x = [];
	for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), x.push({
		gid: e,
		label: Xe(e, n),
		signals: n
	});
	S = n, Fe = Ie, y.setItems(it()), Fe = !1, Ie = !1;
}
function ot() {
	T([], !1);
}
function st() {
	let e = performance.now();
	e - Pe >= De && (Pe = e, at());
}
function ct() {
	if (y) {
		for (let e of y.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Ie = !0, y.refresh();
	}
}
function lt(e) {
	let t = 0;
	for (let n of x) {
		let r = n.signals.findIndex((t) => t.id === e);
		if (r >= 0) return C.has(n.gid) && (C.delete(n.gid), y?.setItems(it())), t + 1 + r;
		t += 1 + (C.has(n.gid) ? 0 : n.signals.length);
	}
	let n = S.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function ut(e) {
	if (y === null) return;
	at();
	let t = lt(e);
	t < 0 || (Le = e, y.scrollToIndex(t));
}
function dt() {
	for (let e of je) e.remove();
	je = [], Me = null, Ne = -1, y?.destroy(), y = null, x = [], S = [], C.clear(), b = /* @__PURE__ */ new Map(), Ae = 0;
}
//#endregion
//#region src/devtools/trace.tsx
var ft = 22, pt = 200, mt = 1e3, ht = [
	"writes",
	"reads",
	"all"
];
function gt(e) {
	return ht.includes(e);
}
var E = null, _t = null, vt = null, D = "all", yt = null, O = null, bt = null, k = null, xt = null, A = [], j = [], M = !1, N = !1, P = "", St = 0, Ct = -1, F = -1, wt = null;
function Tt(e) {
	wt = e;
}
function Et(e) {
	xt = e, Ot();
}
function Dt(e) {
	N !== e && (N = e, e ? (At(), Ft()) : jt(), Ot());
}
function Ot() {
	xt && (xt.classList.toggle("inactive", !N), xt.classList.toggle("off", M), xt.title = N ? M ? "Paused" : "Live — capturing" : "Trace");
}
function kt() {
	Mt(), E = ae({
		rowHeight: ft,
		key: (e) => e.seq,
		render: Ut
	}), k = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), k.append(v(Ce, 12)), d(k, () => Rt(!M));
	let e = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(v(Se, 12)), d(e, () => Nt());
	let t = /* @__PURE__ */ m("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: ht.map((e) => /* @__PURE__ */ m("option", {
			value: e,
			children: e
		}))
	});
	t.value = D, t.addEventListener("change", () => {
		gt(t.value) && (D = t.value), Mt();
	});
	let n = /* @__PURE__ */ m("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		P = n.value.trim().toLowerCase(), j = P ? A.filter((e) => e.name.toLowerCase().includes(P)) : [], I();
	}), O = /* @__PURE__ */ m("div", { class: "li-tr-scroll" }), O.append(E.el), bt = oe(O, { transition: 120 }), O.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== F && (F = Number(t), qe(F));
	}), O.addEventListener("pointerleave", () => {
		F = -1, ot();
	}), d(O, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (F = -1, ot(), wt?.(Number(t)));
	}), yt = /* @__PURE__ */ h("div", {
		class: "li-pane li-trace",
		children: [/* @__PURE__ */ h("div", {
			class: "li-tr-bar",
			children: [
				k,
				t,
				n,
				e
			]
		}), O]
	}), yt;
}
function At() {
	D !== "reads" && !_t && (_t = c([s.write], "samples")), D !== "writes" && !vt && (vt = c([s.read], "samples"));
}
function jt() {
	_t?.stop(), _t = null, vt?.stop(), vt = null;
}
function Mt() {
	jt(), N && At(), Ct = -1, I(), Ft();
}
function Nt() {
	A = [], j = [], Ct = -1, I();
}
function Pt(e) {
	mt = e, A.length > e && (A.length = e), j.length > e && (j.length = e), I();
}
function Ft() {
	if (M || E === null) return;
	let e = [], t = _t?.read()["loom:write"]?.samples;
	if (t) for (let n of t) e.push({
		s: n,
		kind: "write"
	});
	let n = vt?.read()["loom:read"]?.samples;
	if (n) for (let t of n) e.push({
		s: t,
		kind: "read"
	});
	if (e.length === 0) return;
	D === "all" && e.sort((e, t) => o(e.s).t - o(t.s).t), Vt = !1;
	let r = (P ? j : A)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(zt(t, n));
	if (i.reverse(), A = i.concat(A), P) {
		let e = i.filter((e) => e.name.toLowerCase().includes(P));
		e.length > 0 && (j = e.concat(j));
	}
	A.length > mt && (A.length = mt), j.length > mt && (j.length = mt), Ct = ((P ? j : A)[0]?.seq ?? -1) === r ? -1 : r, I();
}
function It() {
	Ft(), I(), requestAnimationFrame(() => E?.refresh());
}
function Lt() {
	jt(), E = null, yt = null, O = null, bt?.(), bt = null, k = null, xt = null, A = [], j = [], Bt.clear(), Vt = !1, Ct = -1, M = !1, N = !1, P = "", D = "all", F = -1, wt = null;
}
function Rt(e) {
	M = e, k?.replaceChildren(v(e ? we : Ce, 12)), Ot(), yt?.classList.toggle("li-tr-paused", e), e || Ft();
}
function I() {
	let e = P ? j : A;
	E?.setItems(D === "all" ? e : e.filter((e) => e.kind === (D === "writes" ? "write" : "read")));
}
function zt(e, t) {
	let n = o(e), r = n.id, i = Ht(r), a = Gt(n.t), s = n.by, c = s === void 0 ? "" : `by ${Ht(s)}`;
	if (t === "read") return {
		seq: St++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: "",
		prevCls: "",
		nextText: "",
		nextCls: "",
		srcText: c,
		full: `${i} — read ${c || "(external)"}`
	};
	let l = o(e), u = ce(l.prev, pt), d = ce(l.next, pt);
	return {
		seq: St++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: u,
		prevCls: le(l.prev),
		nextText: d,
		nextCls: le(l.next),
		srcText: c,
		full: `${i}: ${u} → ${d} ${c || "(external)"}`
	};
}
var Bt = /* @__PURE__ */ new Map(), Vt = !1;
function Ht(e) {
	let t = Bt.get(e);
	if (t !== void 0) return t;
	if (!Vt) {
		Vt = !0;
		for (let e of u().nodes) Bt.set(e.id, e.label);
		let t = Bt.get(e);
		if (t !== void 0) return t;
	}
	return `#${e}`;
}
function Ut(e, t) {
	let n = t ?? Wt(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3], a = i.children[0], o = i.children[1], s = i.children[2], c = i.children[3];
	return e.kind === "read" ? (a.textContent = "", a.className = "li-tr-val", o.textContent = "", s.textContent = "", s.className = "li-tr-val") : (a.textContent = e.prevText, a.className = `li-tr-val ${e.prevCls}`, o.textContent = " → ", s.textContent = e.nextText, s.className = `li-tr-val ${e.nextCls}`), c.textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === Ct), n;
}
function Wt() {
	return /* @__PURE__ */ h("div", {
		class: "li-tr",
		children: [
			/* @__PURE__ */ m("span", { class: "li-tr-kind" }),
			/* @__PURE__ */ m("span", { class: "li-tr-time" }),
			/* @__PURE__ */ m("span", { class: "li-tr-name" }),
			/* @__PURE__ */ h("span", {
				class: "li-tr-change",
				children: [
					/* @__PURE__ */ m("span", { class: "li-tr-val" }),
					/* @__PURE__ */ m("span", { class: "li-tr-arrow" }),
					/* @__PURE__ */ m("span", { class: "li-tr-val" }),
					/* @__PURE__ */ m("span", { class: "li-tr-src" })
				]
			})
		]
	});
}
function Gt(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
//#endregion
//#region src/devtools/stats.tsx
var Kt = 138, qt = 34, Jt = 2 * Math.PI * qt, Yt = Jt * .75, Xt = 120, Zt = Xt / 1e3, Qt = 200, $t = () => void 0, en = () => !1, L = null, tn = null, nn = null, rn = null, an = 0, on = null, sn = null, cn = 0, ln = 0, un = 0, dn = 0, fn = 0, pn = 0, mn = 0, hn = 0, gn = 0, R = 0, z = !1, _n = 0, vn = 0, yn = 0, bn = 0, B = [], xn = 0, Sn = 0, Cn = 0, wn = !1, Tn = null, En = null, Dn = null, On = null, kn = null, An = 100, jn = "", Mn = "", Nn = !1, Pn = "", Fn = 0, In = 0, Ln = 0, Rn = 0, zn = 0, Bn = 0, Vn = 0, Hn = 0;
function V(e) {
	return e?.() ?? 0;
}
function Un(e) {
	return () => (L?.(), e());
}
function H(e, t, n) {
	ie(e, t, Un(n), g);
}
function Wn(e) {
	return ee(Un(e), g);
}
var U = (e, t) => e * .6 + t / Zt * .4;
function W(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function Gn(e) {
	let t = Math.round(100 * Math.max(0, Math.min(1, e / 55)));
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
function Kn(e) {
	let t = 1e3 / e;
	return t >= 55 ? "h-ok" : t >= 30 ? "h-warn" : "h-bad";
}
function qn(e, t, n) {
	return e ? e <= t ? "h-ok" : e <= n ? "h-warn" : "h-bad" : "";
}
function Jn(e) {
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
var Yn = Jn((e) => {
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
}), Xn = Jn((e) => {
	let t = new PerformanceObserver((t) => {
		for (let n of t.getEntries()) n.entryType === "largest-contentful-paint" && e(n.startTime);
	});
	return t.observe({
		type: "largest-contentful-paint",
		buffered: !0
	}), t;
}), Zn = Jn((e) => {
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
}), Qn = typeof PerformanceObserver == "function" && PerformanceObserver.supportedEntryTypes?.includes("longtask") === !0, $n = Jn((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let e of n.getEntries()) t += e.duration;
		e(t);
	});
	return n.observe({
		type: "longtask",
		buffered: !0
	}), n;
});
function er() {
	return [/* @__PURE__ */ m("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: qt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${Jt}`
	}), /* @__PURE__ */ m("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function tr() {
	let e = /* @__PURE__ */ m("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: qt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	H(e, "stroke-dasharray", () => `${Yt * An / 100} ${Jt}`), H(e, "class", () => `li-garc h-${jn}`);
	let t = /* @__PURE__ */ m("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(Wn(() => String(An))), H(t, "class", () => `li-gnum h-${jn}`), [e, t];
}
function nr() {
	return /* @__PURE__ */ h("svg", {
		width: 88,
		height: 88,
		viewBox: "0 0 88 88",
		role: "img",
		"aria-label": "Health",
		children: [
			/* @__PURE__ */ m("circle", {
				class: "li-gtrack",
				cx: 44,
				cy: 44,
				r: qt,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${Yt} ${Jt}`
			}),
			re(Un(() => Nn), tr, er),
			/* @__PURE__ */ m("text", {
				class: "li-glbl",
				x: 44,
				y: 61,
				"text-anchor": "middle",
				children: "HEALTH"
			})
		]
	});
}
function rr() {
	let e = [];
	for (let t = 0; t < Kt; t++) e.push(/* @__PURE__ */ m("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	let t = Array(Kt).fill(-1), n = () => {
		L?.();
		let n = e.length - B.length;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (!i) continue;
			let a = r >= n ? B[r - n] ?? 0 : 0;
			if (a === t[r]) continue;
			t[r] = a;
			let o = Math.max(0, Math.min(20, a / 50 * 20));
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? Kn(a) : "");
		}
	}, r = /* @__PURE__ */ m("div", {
		class: "li-histo",
		title: K.frames,
		children: /* @__PURE__ */ m("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Kt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
	return ne(r, n, g), r;
}
function G(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ m("span", { class: `li-stat-v ${n}` });
	return i.append(ee(Un(t), g)), /* @__PURE__ */ h("div", {
		class: "li-stat",
		children: [/* @__PURE__ */ m("span", {
			class: "li-stat-k",
			title: r,
			children: e
		}), i]
	});
}
var K = {
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
function ir() {
	let e = /* @__PURE__ */ m("span", { class: "li-perfh-fps" });
	e.append(Wn(() => z ? `${Math.round(R)} fps` : "— fps")), H(e, "class", () => `li-perfh-fps ${Pn}`);
	let t = /* @__PURE__ */ m("div", {
		class: "li-hlabel",
		title: K.health
	});
	t.append(Wn(() => z ? Mn.toUpperCase() : "LOADING")), H(t, "class", () => Nn ? `li-hlabel h-${jn}` : "li-hlabel");
	let n = /* @__PURE__ */ h("div", {
		class: "li-hstats",
		children: [t, G("lag", () => `${xn.toFixed(0)} · pk ${Sn.toFixed(0)} ms`, "lo", K.lag)]
	});
	return n.append(ar("blocked", () => {
		if (!Qn) return "—";
		let e = V(On);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!Qn) return "";
		let e = V(On);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, K.blocked)), n.append(ar("CLS", () => V(Tn).toFixed(2), () => {
		let e = V(Tn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, K.cls)), n.append(ar("LCP", () => {
		let e = V(En);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => qn(V(En), 2500, 4e3), K.lcp)), n.append(ar("INP", () => {
		let e = V(Dn);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => qn(V(Dn), 200, 500), K.inp)), /* @__PURE__ */ h("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ h("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ m("span", {
					title: K.fps,
					children: "Performance"
				}), e]
			}),
			rr(),
			/* @__PURE__ */ h("div", {
				class: "li-hblock",
				children: [nr(), n]
			}),
			G("frame time", () => `${bn.toFixed(1)} ms`, "", K.frameTime),
			or() ? sr() : null,
			G("writes / s", () => W(ln), "hi", K.writes),
			G("reads / s", () => W(cn), "hi", K.reads),
			G("computeds / s", () => W(un), "", K.computedsRate),
			G("effect runs / s", () => W(dn), "lo", K.effectRuns),
			G("flushes / s", () => W(fn), "lo", K.flushes),
			G("effects / flush", () => String(hn), "", K.effectsPerFlush),
			G("flush time", () => `${gn.toFixed(1)} ms`, "", K.flushTime),
			G("creates / s", () => W(pn), "lo", K.creates),
			G("disposes / s", () => W(mn), "lo", K.disposes),
			G("states", () => String(Fn), "", K.states),
			G("computeds", () => String(In), "", K.computeds),
			ar("unread", () => String(Hn), () => Hn > 0 ? "h-warn" : "", K.unread),
			G("effects", () => String(Ln), "", K.effects),
			G("views", () => String(Rn), "", K.views),
			G("sources", () => String(zn), "", K.sources),
			G("scopes", () => String(Bn), "", K.scopes),
			G("channels", () => String(Vn), "", K.channels)
		]
	});
}
function ar(e, t, n, r = "") {
	let i = G(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && H(a, "class", () => `li-stat-v ${n()}`), i;
}
function or() {
	return performance.memory;
}
function sr() {
	return G("heap", () => {
		let e = kn?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", K.heap);
}
function cr() {
	let e = on?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, s = e?.["loom:dispose"]?.count ?? 0, c = sn?.read()?.["loom:flush"];
	cn = U(cn, t), ln = U(ln, n), dn = U(dn, r), un = U(un, i), pn = U(pn, a), mn = U(mn, s), fn = U(fn, c?.count ?? 0);
	let l = o(c?.samples.at(-1));
	if (l !== void 0 && (hn = l.batchSize, gn = l.durationMs), !z) Nn = !1, Pn = "";
	else {
		let e = Gn(R);
		An = e.score, jn = e.key, Mn = e.label, Nn = !0, Pn = R >= 55 ? "h-ok" : R >= 30 ? "h-warn" : "h-bad";
	}
	return ++an;
}
function lr() {
	let e = !en();
	if ($t() === "stats" && e) {
		let e = l();
		Fn = e.states, In = e.computeds, Ln = e.effects - e.targetedEffects, Rn = e.targetedEffects, zn = e.sources, Bn = e.scopes, Vn = e.channels, Hn = e.unread;
	} else $t() === "graph" && e ? st() : $t() === "trace" && e && Ft();
}
function ur() {
	document.hidden && (wn = !0);
}
function dr() {
	Cn = performance.now() + Qt, tn = setInterval(() => {
		let e = performance.now(), t = Cn;
		if (Cn = e + Qt, document.hidden) {
			wn = !0;
			return;
		}
		if (wn) {
			wn = !1;
			return;
		}
		xn = Math.max(0, e - t), xn > Sn && (Sn = xn);
	}, Qt), document.addEventListener("visibilitychange", ur), yn = 0;
	let e = (t) => {
		if (nn = requestAnimationFrame(e), yn) {
			let e = Math.min(t - yn, 1e3);
			if (bn = e, B.push(e), B.length > Kt && B.shift(), _n += e, vn++, _n >= 500) {
				let e = vn * 1e3 / _n;
				R = z ? R * .5 + e * .5 : e, z = !0, _n = 0, vn = 0;
			}
		}
		yn = t;
	};
	nn = requestAnimationFrame(e);
}
function fr(t) {
	$t = t.activeTab, en = t.isMinimized, on = c([
		s.read,
		s.write,
		s.compute,
		s.effect,
		s.create,
		s.dispose
	]), sn = c([s.flush], "samples"), L = r(cr, Xt, g);
	let n;
	return rn = i(() => {
		Tn = a(Yn, 0, g), En = a(Xn, 0, g), Dn = a(Zn, 0, g), On = a($n, 0, g), or() && (kn = r(() => or()?.usedJSHeapSize ?? 0, 5e3, g)), n = ir();
	}, g), ne(n, () => {
		L?.(), e(lr);
	}, {
		...g,
		defer: !0,
		maxStale: Xt
	}), dr(), n;
}
function pr() {
	rn?.pause();
}
function mr() {
	rn?.resume();
}
function hr() {
	on?.stop(), on = null, sn?.stop(), sn = null, L?.stop(), L = null, tn != null && clearInterval(tn), tn = null, typeof document < "u" && document.removeEventListener("visibilitychange", ur), nn != null && cancelAnimationFrame(nn), nn = null, rn?.stop(), rn = null, kn = Tn = En = Dn = On = null, an = 0, cn = ln = un = dn = fn = 0, pn = mn = 0, hn = gn = 0, R = 0, z = !1, _n = vn = yn = bn = 0, B.length = 0, xn = Sn = 0, wn = !1, Nn = !1, An = 100, jn = Mn = Pn = "", Fn = In = Ln = Rn = 0, zn = Bn = Vn = Hn = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var gr = {
	system: he,
	light: pe,
	dark: me
}, _r = [
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
], q = null, vr = null, J = null, yr = null, br = [], Y = null, xr = null, Sr = null, X = null, Z = null, Cr = /* @__PURE__ */ new Map(), wr = null, Tr = [
	1e3,
	5e3,
	25e3
], Er = null;
function Q() {
	if (!Er) {
		let e;
		xr = i(() => {
			e = {
				theme: f(`${_}-theme`, "system", {
					internal: !0,
					serialize: (e) => e,
					parse: (e) => e,
					validate: (e) => e === "light" || e === "dark" || e === "system"
				}),
				min: f(`${_}-min`, !1, {
					internal: !0,
					serialize: (e) => e ? "1" : "0",
					parse: (e) => e === "1"
				}),
				logSize: f(`${_}-logsize`, 1e3, {
					internal: !0,
					serialize: String,
					parse: Number,
					validate: (e) => Tr.includes(e)
				}),
				pos: f(`${_}-pos`, null, {
					internal: !0,
					validate: (e) => e !== null && typeof e.left == "number" && typeof e.top == "number"
				}),
				size: f(`${_}-size`, null, {
					internal: !0,
					validate: (e) => e !== null && typeof e.width == "number" && typeof e.height == "number"
				})
			};
		}, g), Er = e;
	}
	return Er;
}
function $(e) {
	let t = window.devicePixelRatio || 1;
	return Math.round(e * t) / t;
}
function Dr(e, t, n, r) {
	let i = e.offsetWidth, a = Math.min(80, i);
	return {
		left: $(Math.min(window.innerWidth - a, Math.max(a - i, n))),
		top: $(Math.min(window.innerHeight - t, Math.max(0, r)))
	};
}
function Or(e, t, n) {
	let r = Math.max(0, window.innerWidth - e.offsetWidth), i = Math.max(0, window.innerHeight - e.offsetHeight);
	return {
		left: $(Math.max(0, Math.min(t, r))),
		top: $(Math.max(0, Math.min(n, i)))
	};
}
function kr(e, t, n, r, i) {
	X?.();
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto";
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s = () => {};
	s = te(e, n, {
		move: (e) => r(e, a),
		end: () => {
			X === s && (X = null), document.body.style.userSelect = o, i();
		}
	}), X = s;
}
function Ar(e, t) {
	e.addEventListener("pointerdown", (n) => {
		if (n.target?.closest("button")) return;
		n.preventDefault();
		let r = n.clientX, i = n.clientY, a = null;
		e.style.cursor = "grabbing", kr(e, t, n, (n, o) => {
			let { left: s, top: c } = Dr(t, e.offsetHeight || 40, o.left + n.clientX - r, o.top + n.clientY - i);
			t.style.left = `${s}px`, t.style.top = `${c}px`, a = {
				left: s,
				top: c
			};
		}, () => {
			e.style.cursor = "", a && Q().pos(a);
		});
	});
}
function jr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		n.preventDefault(), n.stopPropagation();
		let r = n.clientX, i = n.clientY, a = null;
		kr(e, t, n, (e, n) => {
			let o = $(Math.max(240, Math.min(window.innerWidth - n.left - 8, n.width + e.clientX - r))), s = $(Math.max(160, Math.min(window.innerHeight - n.top - 8, n.height + e.clientY - i)));
			t.style.width = `${o}px`, t.style.height = `${s}px`, a = {
				width: o,
				height: s
			};
		}, () => {
			a && Q().size(a);
		});
	});
}
function Mr(e) {
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function Nr(e) {
	if (q || typeof document > "u") return;
	let r = e ?? document.body;
	if (Sr = n({ inspect: !0 }).inspect ?? !1, !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${_}-css`, e.textContent = se, document.head.append(e);
	}
	Z = t("stats", g);
	let a = Q().theme(), o = /* @__PURE__ */ m("span", { class: "li-menu-val" }), s = () => {
		q?.setAttribute("data-theme", a), vr?.setAttribute("data-theme", a), o.innerHTML = ue(gr[a], 13), c.title = `Theme: ${a} (click to cycle)`;
	}, c = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ m("span", { children: "Theme" }), o]
	});
	d(c, () => {
		let e = [
			"system",
			"light",
			"dark"
		];
		a = e[(e.indexOf(a) + 1) % e.length] ?? "system", Q().theme(a), s();
	});
	let l = /* @__PURE__ */ m("div", {
		class: "li-menu",
		hidden: !0
	});
	l.id = `${_}-menu`, l.append(c), vr = l;
	let u = Q().logSize(), ee = /* @__PURE__ */ m("span", { class: "li-menu-val" }), f = () => {
		ee.textContent = `${u / 1e3}k`, Pt(u);
	}, te = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ m("span", { children: "Log size" }), ee]
	});
	d(te, () => {
		u = Tr[(Tr.indexOf(u) + 1) % Tr.length] ?? 1e3, Q().logSize(u), f();
	}), l.append(te), f();
	let re = () => {
		l.hidden = !0;
	}, ie = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ m("span", { children: "Hide" }), /* @__PURE__ */ m("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	d(ie, () => {
		re(), Pr();
	}), l.append(ie);
	let p = /* @__PURE__ */ m("button", {
		type: "button",
		title: "Settings"
	});
	p.append(Mr(ge)), d(p, (e) => {
		if (e.stopPropagation(), !l.hidden) {
			re();
			return;
		}
		l.hidden = !1;
		let t = p.getBoundingClientRect(), n = l.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), l.style.left = `${Math.max(8, r)}px`, l.style.top = `${Math.max(8, i)}px`;
	});
	let ae = /* @__PURE__ */ m("button", { type: "button" }), ce = (e) => {
		ae.title = e ? "Expand" : "Collapse", ae.replaceChildren(Mr(e ? fe : de));
	}, le = Q().min();
	ce(le), d(ae, () => {
		let e = !!q?.classList.toggle("li-min");
		ce(e), Q().min(e), e ? Y?.pause() : Y?.resume(), Dt(!e && Z?.() === "trace");
	});
	let pe = /* @__PURE__ */ h("div", {
		class: "li-bar",
		children: [
			/* @__PURE__ */ h("span", {
				class: "li-brand",
				children: [Ee(15), /* @__PURE__ */ m("b", { children: "Loom" })]
			}),
			/* @__PURE__ */ m("span", { class: "li-sp" }),
			p,
			ae
		]
	}), me;
	Y = i(() => {
		me = fr({
			activeTab: () => Z?.(),
			isMinimized: () => q?.classList.contains("li-min") ?? !1
		});
	}, g), le && Y.pause();
	let he = /* @__PURE__ */ new Map(), _e = /* @__PURE__ */ new Map();
	J = /* @__PURE__ */ m("div", { class: "li-body" });
	for (let e of _r) {
		let t = e.id === "stats" ? me : e.id === "graph" ? Re() : kt();
		he.set(e.id, t), J.append(t);
	}
	Tt((e) => {
		Z?.("graph"), ut(e);
	});
	let ve = /* @__PURE__ */ m("div", { class: "li-tabscroll" });
	for (let e of _r) {
		let t = /* @__PURE__ */ m("button", {
			type: "button",
			class: "li-tab",
			children: e.label
		});
		if (e.id === "trace") {
			let e = /* @__PURE__ */ m("span", {
				class: "li-tr-live",
				title: "Live — capturing"
			});
			t.append(e), Et(e);
		}
		d(t, () => Z?.(e.id)), _e.set(e.id, t), ve.append(t);
	}
	let ye = /* @__PURE__ */ m("div", {
		class: "li-tabs",
		children: ve
	}), be = /* @__PURE__ */ m("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ m("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ m("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	q = /* @__PURE__ */ h("div", { children: [
		pe,
		ye,
		J,
		be
	] }), q.id = _, le && q.classList.add("li-min"), s(), Ar(pe, q), jr(be, q), yr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!l.hidden && (t === null || !l.contains(t)) && e.target !== p && re();
	}, document.addEventListener("pointerdown", yr), r.append(q), document.body.append(l);
	let xe = Q().size(), Se = Q().pos();
	if (xe && (q.style.width = `${Math.max(240, Math.min(xe.width, window.innerWidth - 16))}px`, q.style.height = `${Math.max(160, Math.min(xe.height, window.innerHeight - 16))}px`), Se) {
		let { left: e, top: t } = Or(q, Se.left, Se.top);
		q.style.left = `${e}px`, q.style.top = `${t}px`, q.style.right = "auto", q.style.bottom = "auto";
	}
	ne(q, () => {
		let e = Z?.();
		wr && wr !== e && J && Cr.set(wr, J.scrollTop), e === "stats" ? mr() : pr(), e !== "graph" && ot();
		for (let t of _r) {
			let n = t.id === e, r = he.get(t.id), i = _e.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && J) {
			let t = Cr.get(e) ?? 0, n = Math.max(0, J.scrollHeight - J.clientHeight);
			J.scrollTop = Math.min(t, n), e === "graph" ? ct() : e === "trace" && It();
		}
		Dt(e === "trace" && q?.classList.contains("li-min") !== !0), wr = e ?? null;
	}), br.push(oe(J, { transition: 120 }), oe(ve, {
		axis: "x",
		transition: 120
	}));
}
function Pr() {
	if (!(typeof document > "u")) {
		X?.(), X = null, hr();
		for (let e of br) e();
		br.length = 0, Y?.stop(), Y = null, xr?.stop(), xr = null, Er = null, yr && document.removeEventListener("pointerdown", yr), yr = null, vr && p(vr), vr = null, q && p(q), q = null, J = null, Z = null, Cr.clear(), wr = null, dt(), Lt(), Sr !== null && n({ inspect: Sr }), Sr = null;
	}
}
function Fr() {
	return q !== null;
}
function Ir(e) {
	q ? Pr() : Nr(e);
}
//#endregion
export { Fr as inspectorMounted, Nr as mountInspector, Ir as toggleInspector, Pr as unmountInspector };
