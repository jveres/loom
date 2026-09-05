import { S as e, T as t, b as n, g as r, i, x as a } from "./loom-Rpf9L-jU.js";
import { a as o, i as s, n as c, o as l, r as u } from "./observe-uCgSOpnb.js";
import { C as ee, T as d, _ as te, d as f, g as ne, n as re, r as ie } from "./dom-BYMGtdHg.js";
import { s as p } from "./ownership-base-D5Jdu92o.js";
import { virtualList as m } from "./dom/virtual-list.js";
import "./defer.js";
import { scrollFade as ae } from "./dom/scroll-fade.js";
import { jsx as h, jsxs as g } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var _ = { internal: !0 }, oe = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;flex:auto;align-items:flex-end;gap:1px;min-width:0;margin-top:6px;display:flex;overflow-x:auto}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", v = "loom-inspector";
//#endregion
//#region src/devtools/format.ts
function se(e, t) {
	return e === void 0 ? "—" : e === null ? "null" : typeof e == "number" ? Number.isInteger(e) ? String(e) : e.toFixed(2) : typeof e == "string" ? e.length > t ? `"${e.slice(0, t)}…"` : `"${e}"` : typeof e == "boolean" ? String(e) : Array.isArray(e) ? `[${e.length}]` : typeof e == "object" ? "{…}" : String(e);
}
function y(e) {
	return typeof e == "number" ? "li-gv-num" : typeof e == "string" ? "li-gv-str" : typeof e == "boolean" ? "li-gv-bool" : e == null ? "li-gv-nul" : "";
}
//#endregion
//#region src/devtools/icons.ts
function ce(e, t) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`;
}
var le = "<polyline points=\"4 14 10 14 10 20\"/><polyline points=\"20 10 14 10 14 4\"/><line x1=\"14\" x2=\"21\" y1=\"10\" y2=\"3\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", ue = "<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" x2=\"14\" y1=\"3\" y2=\"10\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", de = "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>", fe = "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", pe = "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>", me = "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", he = "<circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"currentColor\" stroke=\"none\"/>", ge = "<circle cx=\"12\" cy=\"12\" r=\"5\"/>", _e = "<path d=\"M5 19c.264.956.797 2 2.187 2c2.407 0 3.008-2 4.813-9s2.406-9 4.813-9c1.39 0 1.923 1.044 2.187 2M9 10h8\"/>", ve = "<path d=\"m6 9 6 6 6-6\"/>", ye = "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"22\" x2=\"18\" y1=\"12\" y2=\"12\"/><line x1=\"6\" x2=\"2\" y1=\"12\" y2=\"12\"/><line x1=\"12\" x2=\"12\" y1=\"6\" y2=\"2\"/><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"18\"/>", be = "<path d=\"M3 6h18\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", xe = "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/>", Se = "<polygon points=\"6 3 20 12 6 21 6 3\"/>";
function Ce(e) {
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.firstElementChild;
	if (!n) throw Error("icon markup produced no element");
	return n;
}
function b(e, t) {
	return Ce(ce(e, t));
}
function we(e) {
	return Ce(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var Te = 300, Ee = 22, De = 16, x = null, Oe = /* @__PURE__ */ new Map(), ke = 0, Ae = [], S = [], je = [], Me = null, Ne = -1, Pe = 0, Fe = !1, Ie = !1, C = /* @__PURE__ */ new Set(), Le = -1;
function Re() {
	return x = m({
		rowHeight: Ee,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: Ze
	}), x.el.classList.add("li-pane", "li-graph"), x.el;
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
	let a = se(t, De);
	!r && !Fe && e.dataset.prev !== void 0 && e.dataset.prev !== a && Je(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${y(t)}`, e.dataset.prev = a;
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
	let t = [], n = /* @__PURE__ */ new Set([e]), r = Oe.get(e), i = r ? [...r.subs] : [];
	for (; i.length > 0;) {
		let e = i.shift();
		if (e === void 0 || n.has(e)) continue;
		n.add(e);
		let r = Oe.get(e);
		if (r) {
			if (r.kind === "effect") {
				let e = r.target;
				(e instanceof Element || e instanceof CharacterData) && t.push(e);
			} else for (let e of r.subs) i.push(e);
		}
	}
	return t;
}
function Ge(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of Oe.values()) if (r.group === e) for (let e of w(r.id)) n.has(e) || (n.add(e), t.push(e));
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
	t - ke >= Te && (Oe = new Map(o({ active: !0 }).nodes.map((e) => [e.id, e])), ke = t), T(w(e), !0);
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
	let t = /* @__PURE__ */ h("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ h("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = b(ve, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ h("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(b(ye, 11));
	let a = /* @__PURE__ */ g("div", {
		class: "li-gns-h",
		children: [
			r,
			n,
			t,
			i
		]
	}), o = e.gid;
	return C.has(o) && a.classList.add("collapsed"), a.onclick = () => {
		C.has(o) ? C.delete(o) : C.add(o), x?.setItems(it());
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
	let t = e.node, n = /* @__PURE__ */ h("span", { class: "li-gval" }), r = ze(t), i = b(t.kind === "computed" ? _e : r ? he : ge, 13);
	i.classList.add("li-gicon", r ? t.kind === "computed" ? "li-gi-computed" : "li-gi-state" : "li-gi-dim");
	let a = e.child ? t.key ?? t.label : t.label, o = /* @__PURE__ */ g("div", {
		class: "li-grow",
		children: [
			i,
			/* @__PURE__ */ h("span", {
				class: "li-glabel",
				children: a
			}),
			n
		]
	});
	if (e.child && o.classList.add("li-grow-child"), o.onmouseenter = () => T(w(t.id), !0), o.onmouseleave = () => T(w(t.id), !1), Ve(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => Ue(t.id, e, n, o);
	}
	return He(o, t.value, t.id), o;
}
function tt(e, t) {
	return He(e, t.node.value, t.node.id), e;
}
function nt() {
	let e = S.length;
	for (let t of Ae) e += 1 + (C.has(t.gid) ? 0 : t.signals.length);
	return e;
}
function rt(e) {
	let t = e;
	for (let e of Ae) {
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
	if (!x) return;
	let e = o({ active: !0 }).nodes;
	Oe = new Map(e.map((e) => [e.id, e])), ke = performance.now();
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) if (!(r.internal || r.kind === "effect")) {
		if (r.group !== void 0) {
			let e = t.get(r.group);
			e ? e.push(r) : t.set(r.group, [r]);
		} else n.push(r);
	}
	Ae = [];
	for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), Ae.push({
		gid: e,
		label: Xe(e, n),
		signals: n
	});
	S = n, Fe = Ie, x.setItems(it()), Fe = !1, Ie = !1;
}
function ot() {
	T([], !1);
}
function st() {
	let e = performance.now();
	e - Pe >= Te && (Pe = e, at());
}
function ct() {
	if (x) {
		for (let e of x.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Ie = !0, x.refresh();
	}
}
function lt(e) {
	let t = 0;
	for (let n of Ae) {
		let r = n.signals.findIndex((t) => t.id === e);
		if (r >= 0) return C.has(n.gid) && (C.delete(n.gid), x?.setItems(it())), t + 1 + r;
		t += 1 + (C.has(n.gid) ? 0 : n.signals.length);
	}
	let n = S.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function ut(e) {
	if (x === null) return;
	at();
	let t = lt(e);
	t < 0 || (Le = e, x.scrollToIndex(t));
}
function dt() {
	for (let e of je) e.remove();
	je = [], Me = null, Ne = -1, x?.destroy(), x = null, Ae = [], S = [], C.clear(), Oe = /* @__PURE__ */ new Map(), ke = 0;
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
var E = null, _t = null, vt = null, D = "all", yt = null, O = null, bt = null, k = null, A = null, j = [], M = [], N = !1, P = !1, F = "", xt = 0, St = -1, I = -1, Ct = null;
function wt(e) {
	Ct = e;
}
function Tt(e) {
	A = e, Dt();
}
function Et(e) {
	P !== e && (P = e, e ? (kt(), Pt()) : At(), Dt());
}
function Dt() {
	A && (A.classList.toggle("inactive", !P), A.classList.toggle("off", N), A.title = P ? N ? "Paused" : "Live — capturing" : "Trace");
}
function Ot() {
	jt(), E = m({
		rowHeight: ft,
		key: (e) => e.seq,
		render: Ht
	}), k = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), k.append(b(xe, 12)), f(k, () => Lt(!N));
	let e = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(b(be, 12)), f(e, () => Mt());
	let t = /* @__PURE__ */ h("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: ht.map((e) => /* @__PURE__ */ h("option", {
			value: e,
			children: e
		}))
	});
	t.value = D, t.addEventListener("change", () => {
		gt(t.value) && (D = t.value), jt();
	});
	let n = /* @__PURE__ */ h("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		F = n.value.trim().toLowerCase(), M = F ? j.filter((e) => e.name.toLowerCase().includes(F)) : [], L();
	}), O = /* @__PURE__ */ h("div", { class: "li-tr-scroll" }), O.append(E.el), bt = ae(O, { transition: 120 }), O.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== I && (I = Number(t), qe(I));
	}), O.addEventListener("pointerleave", () => {
		I = -1, ot();
	}), f(O, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (I = -1, ot(), Ct?.(Number(t)));
	}), yt = /* @__PURE__ */ g("div", {
		class: "li-pane li-trace",
		children: [/* @__PURE__ */ g("div", {
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
function kt() {
	D !== "reads" && !_t && (_t = u([c.write], "samples")), D !== "writes" && !vt && (vt = u([c.read], "samples"));
}
function At() {
	_t?.stop(), _t = null, vt?.stop(), vt = null;
}
function jt() {
	At(), P && kt(), St = -1, L(), Pt();
}
function Mt() {
	j = [], M = [], St = -1, L();
}
function Nt(e) {
	mt = e, j.length > e && (j.length = e), M.length > e && (M.length = e), L();
}
function Pt() {
	if (N || E === null) return;
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
	D === "all" && e.sort((e, t) => s(e.s).t - s(t.s).t), Bt = !1;
	let r = (F ? M : j)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(Rt(t, n));
	if (i.reverse(), j = i.concat(j), F) {
		let e = i.filter((e) => e.name.toLowerCase().includes(F));
		e.length > 0 && (M = e.concat(M));
	}
	j.length > mt && (j.length = mt), M.length > mt && (M.length = mt), St = ((F ? M : j)[0]?.seq ?? -1) === r ? -1 : r, L();
}
function Ft() {
	Pt(), L(), requestAnimationFrame(() => E?.refresh());
}
function It() {
	At(), E = null, yt = null, O = null, bt?.(), bt = null, k = null, A = null, j = [], M = [], zt.clear(), Bt = !1, St = -1, N = !1, P = !1, F = "", D = "all", I = -1, Ct = null;
}
function Lt(e) {
	N = e, k?.replaceChildren(b(e ? Se : xe, 12)), Dt(), yt?.classList.toggle("li-tr-paused", e), e || Pt();
}
function L() {
	let e = F ? M : j;
	E?.setItems(D === "all" ? e : e.filter((e) => e.kind === (D === "writes" ? "write" : "read")));
}
function Rt(e, t) {
	let n = s(e), r = n.id, i = Vt(r), a = Wt(n.t), o = n.by, c = o === void 0 ? "" : `by ${Vt(o)}`;
	if (t === "read") return {
		seq: xt++,
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
	let l = s(e), u = se(l.prev, pt), ee = se(l.next, pt);
	return {
		seq: xt++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: u,
		prevCls: y(l.prev),
		nextText: ee,
		nextCls: y(l.next),
		srcText: c,
		full: `${i}: ${u} → ${ee} ${c || "(external)"}`
	};
}
var zt = /* @__PURE__ */ new Map(), Bt = !1;
function Vt(e) {
	let t = zt.get(e);
	if (t !== void 0) return t;
	if (!Bt) {
		Bt = !0;
		for (let e of o().nodes) zt.set(e.id, e.label);
		let t = zt.get(e);
		if (t !== void 0) return t;
	}
	return `#${e}`;
}
function Ht(e, t) {
	let n = t ?? Ut(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3], a = i.children[0], o = i.children[1], s = i.children[2], c = i.children[3];
	return e.kind === "read" ? (a.textContent = "", a.className = "li-tr-val", o.textContent = "", s.textContent = "", s.className = "li-tr-val") : (a.textContent = e.prevText, a.className = `li-tr-val ${e.prevCls}`, o.textContent = " → ", s.textContent = e.nextText, s.className = `li-tr-val ${e.nextCls}`), c.textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === St), n;
}
function Ut() {
	return /* @__PURE__ */ g("div", {
		class: "li-tr",
		children: [
			/* @__PURE__ */ h("span", { class: "li-tr-kind" }),
			/* @__PURE__ */ h("span", { class: "li-tr-time" }),
			/* @__PURE__ */ h("span", { class: "li-tr-name" }),
			/* @__PURE__ */ g("span", {
				class: "li-tr-change",
				children: [
					/* @__PURE__ */ h("span", { class: "li-tr-val" }),
					/* @__PURE__ */ h("span", { class: "li-tr-arrow" }),
					/* @__PURE__ */ h("span", { class: "li-tr-val" }),
					/* @__PURE__ */ h("span", { class: "li-tr-src" })
				]
			})
		]
	});
}
function Wt(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
//#endregion
//#region src/devtools/stats.tsx
var Gt = 138, Kt = 34, qt = 2 * Math.PI * Kt, Jt = qt * .75, Yt = 120, Xt = Yt / 1e3, Zt = 200, Qt = () => void 0, $t = () => !1, R = null, en = null, tn = null, nn = null, rn = 0, an = null, on = null, sn = 0, cn = 0, ln = 0, un = 0, dn = 0, fn = 0, pn = 0, mn = 0, hn = 0, z = 0, B = !1, gn = 0, _n = 0, vn = 0, yn = 0, V = [], bn = 0, xn = 0, Sn = 0, Cn = !1, wn = null, Tn = null, En = null, Dn = null, On = null, kn = 100, An = "", jn = "", Mn = !1, Nn = "", Pn = 0, Fn = 0, In = 0, Ln = 0, Rn = 0, zn = 0, Bn = 0, Vn = 0;
function H(e) {
	return e?.() ?? 0;
}
function Hn(e) {
	return () => (R?.(), e());
}
function U(e, t, n) {
	re(e, t, Hn(n), _);
}
function Un(e) {
	return ne(Hn(e), _);
}
var W = (e, t) => e * .6 + t / Xt * .4;
function G(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function Wn(e) {
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
function Gn(e) {
	let t = 1e3 / e;
	return t >= 55 ? "h-ok" : t >= 30 ? "h-warn" : "h-bad";
}
function Kn(e, t, n) {
	return e ? e <= t ? "h-ok" : e <= n ? "h-warn" : "h-bad" : "";
}
function qn(e) {
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
var Jn = qn((e) => {
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
}), Yn = qn((e) => {
	let t = new PerformanceObserver((t) => {
		for (let n of t.getEntries()) n.entryType === "largest-contentful-paint" && e(n.startTime);
	});
	return t.observe({
		type: "largest-contentful-paint",
		buffered: !0
	}), t;
}), Xn = qn((e) => {
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
}), Zn = typeof PerformanceObserver == "function" && PerformanceObserver.supportedEntryTypes?.includes("longtask") === !0, Qn = qn((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let e of n.getEntries()) t += e.duration;
		e(t);
	});
	return n.observe({
		type: "longtask",
		buffered: !0
	}), n;
});
function $n() {
	return [/* @__PURE__ */ h("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: Kt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${qt}`
	}), /* @__PURE__ */ h("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function er() {
	let e = /* @__PURE__ */ h("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: Kt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	U(e, "stroke-dasharray", () => `${Jt * kn / 100} ${qt}`), U(e, "class", () => `li-garc h-${An}`);
	let t = /* @__PURE__ */ h("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(Un(() => String(kn))), U(t, "class", () => `li-gnum h-${An}`), [e, t];
}
function tr() {
	return /* @__PURE__ */ g("svg", {
		width: 88,
		height: 88,
		viewBox: "0 0 88 88",
		role: "img",
		"aria-label": "Health",
		children: [
			/* @__PURE__ */ h("circle", {
				class: "li-gtrack",
				cx: 44,
				cy: 44,
				r: Kt,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${Jt} ${qt}`
			}),
			te(Hn(() => Mn), er, $n),
			/* @__PURE__ */ h("text", {
				class: "li-glbl",
				x: 44,
				y: 61,
				"text-anchor": "middle",
				children: "HEALTH"
			})
		]
	});
}
function nr() {
	let e = [];
	for (let t = 0; t < Gt; t++) e.push(/* @__PURE__ */ h("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	let t = Array(Gt).fill(-1), n = () => {
		R?.();
		let n = e.length - V.length;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (!i) continue;
			let a = r >= n ? V[r - n] ?? 0 : 0;
			if (a === t[r]) continue;
			t[r] = a;
			let o = Math.max(0, Math.min(20, a / 50 * 20));
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? Gn(a) : "");
		}
	}, r = /* @__PURE__ */ h("div", {
		class: "li-histo",
		title: q.frames,
		children: /* @__PURE__ */ h("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Gt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
	return ie(r, n, _), r;
}
function K(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ h("span", { class: `li-stat-v ${n}` });
	return i.append(ne(Hn(t), _)), /* @__PURE__ */ g("div", {
		class: "li-stat",
		children: [/* @__PURE__ */ h("span", {
			class: "li-stat-k",
			title: r,
			children: e
		}), i]
	});
}
var q = {
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
function rr() {
	let e = /* @__PURE__ */ h("span", { class: "li-perfh-fps" });
	e.append(Un(() => B ? `${Math.round(z)} fps` : "— fps")), U(e, "class", () => `li-perfh-fps ${Nn}`);
	let t = /* @__PURE__ */ h("div", {
		class: "li-hlabel",
		title: q.health
	});
	t.append(Un(() => B ? jn.toUpperCase() : "LOADING")), U(t, "class", () => Mn ? `li-hlabel h-${An}` : "li-hlabel");
	let n = /* @__PURE__ */ g("div", {
		class: "li-hstats",
		children: [t, K("lag", () => `${bn.toFixed(0)} · pk ${xn.toFixed(0)} ms`, "lo", q.lag)]
	});
	return n.append(ir("blocked", () => {
		if (!Zn) return "—";
		let e = H(Dn);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!Zn) return "";
		let e = H(Dn);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, q.blocked)), n.append(ir("CLS", () => H(wn).toFixed(2), () => {
		let e = H(wn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, q.cls)), n.append(ir("LCP", () => {
		let e = H(Tn);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => Kn(H(Tn), 2500, 4e3), q.lcp)), n.append(ir("INP", () => {
		let e = H(En);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => Kn(H(En), 200, 500), q.inp)), /* @__PURE__ */ g("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ g("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ h("span", {
					title: q.fps,
					children: "Performance"
				}), e]
			}),
			nr(),
			/* @__PURE__ */ g("div", {
				class: "li-hblock",
				children: [tr(), n]
			}),
			K("frame time", () => `${yn.toFixed(1)} ms`, "", q.frameTime),
			ar() ? or() : null,
			K("writes / s", () => G(cn), "hi", q.writes),
			K("reads / s", () => G(sn), "hi", q.reads),
			K("computeds / s", () => G(ln), "", q.computedsRate),
			K("effect runs / s", () => G(un), "lo", q.effectRuns),
			K("flushes / s", () => G(dn), "lo", q.flushes),
			K("effects / flush", () => String(mn), "", q.effectsPerFlush),
			K("flush time", () => `${hn.toFixed(1)} ms`, "", q.flushTime),
			K("creates / s", () => G(fn), "lo", q.creates),
			K("disposes / s", () => G(pn), "lo", q.disposes),
			K("states", () => String(Pn), "", q.states),
			K("computeds", () => String(Fn), "", q.computeds),
			ir("unread", () => String(Vn), () => Vn > 0 ? "h-warn" : "", q.unread),
			K("effects", () => String(In), "", q.effects),
			K("views", () => String(Ln), "", q.views),
			K("sources", () => String(Rn), "", q.sources),
			K("scopes", () => String(zn), "", q.scopes),
			K("channels", () => String(Bn), "", q.channels)
		]
	});
}
function ir(e, t, n, r = "") {
	let i = K(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && U(a, "class", () => `li-stat-v ${n()}`), i;
}
function ar() {
	return performance.memory;
}
function or() {
	return K("heap", () => {
		let e = On?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", q.heap);
}
function sr() {
	let e = an?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, c = on?.read()?.["loom:flush"];
	sn = W(sn, t), cn = W(cn, n), un = W(un, r), ln = W(ln, i), fn = W(fn, a), pn = W(pn, o), dn = W(dn, c?.count ?? 0);
	let l = s(c?.samples.at(-1));
	if (l !== void 0 && (mn = l.batchSize, hn = l.durationMs), !B) Mn = !1, Nn = "";
	else {
		let e = Wn(z);
		kn = e.score, An = e.key, jn = e.label, Mn = !0, Nn = z >= 55 ? "h-ok" : z >= 30 ? "h-warn" : "h-bad";
	}
	return ++rn;
}
function cr() {
	let e = !$t();
	if (Qt() === "stats" && e) {
		let e = l();
		Pn = e.states, Fn = e.computeds, In = e.effects - e.targetedEffects, Ln = e.targetedEffects, Rn = e.sources, zn = e.scopes, Bn = e.channels, Vn = e.unread;
	} else Qt() === "graph" && e ? st() : Qt() === "trace" && e && Pt();
}
function lr() {
	document.hidden && (Cn = !0);
}
function ur() {
	Sn = performance.now() + Zt, en = setInterval(() => {
		let e = performance.now(), t = Sn;
		if (Sn = e + Zt, document.hidden) {
			Cn = !0;
			return;
		}
		if (Cn) {
			Cn = !1;
			return;
		}
		bn = Math.max(0, e - t), bn > xn && (xn = bn);
	}, Zt), document.addEventListener("visibilitychange", lr), vn = 0;
	let e = (t) => {
		if (tn = requestAnimationFrame(e), vn) {
			let e = Math.min(t - vn, 1e3);
			if (yn = e, V.push(e), V.length > Gt && V.shift(), gn += e, _n++, gn >= 500) {
				let e = _n * 1e3 / gn;
				z = B ? z * .5 + e * .5 : e, B = !0, gn = 0, _n = 0;
			}
		}
		vn = t;
	};
	tn = requestAnimationFrame(e);
}
function dr(e) {
	Qt = e.activeTab, $t = e.isMinimized, an = u([
		c.read,
		c.write,
		c.compute,
		c.effect,
		c.create,
		c.dispose
	]), on = u([c.flush], "samples"), R = r(sr, Yt, _);
	let i;
	return nn = n(() => {
		wn = a(Jn, 0, _), Tn = a(Yn, 0, _), En = a(Xn, 0, _), Dn = a(Qn, 0, _), ar() && (On = r(() => ar()?.usedJSHeapSize ?? 0, 5e3, _)), i = rr();
	}, _), ie(i, () => {
		R?.(), t(cr);
	}, {
		..._,
		defer: !0,
		maxStale: Yt
	}), ur(), i;
}
function fr() {
	nn?.pause();
}
function pr() {
	nn?.resume();
}
function mr() {
	an?.stop(), an = null, on?.stop(), on = null, R?.stop(), R = null, en != null && clearInterval(en), en = null, typeof document < "u" && document.removeEventListener("visibilitychange", lr), tn != null && cancelAnimationFrame(tn), tn = null, nn?.stop(), nn = null, On = wn = Tn = En = Dn = null, rn = 0, sn = cn = ln = un = dn = 0, fn = pn = 0, mn = hn = 0, z = 0, B = !1, gn = _n = vn = yn = 0, V.length = 0, bn = xn = 0, Cn = !1, Mn = !1, kn = 100, An = jn = Nn = "", Pn = Fn = In = Ln = 0, Rn = zn = Bn = Vn = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var hr = {
	system: pe,
	light: de,
	dark: fe
}, gr = [
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
], J = null, _r = null, Y = null, vr = null, yr = [], X = null, br = null, xr = null, Sr = null, Z = null, Cr = /* @__PURE__ */ new Map(), wr = null, Tr = [
	1e3,
	5e3,
	25e3
], Er = null;
function Q() {
	if (!Er) {
		let e;
		br = n(() => {
			e = {
				theme: d(`${v}-theme`, "system", {
					internal: !0,
					serialize: (e) => e,
					parse: (e) => e,
					validate: (e) => e === "light" || e === "dark" || e === "system"
				}),
				min: d(`${v}-min`, !1, {
					internal: !0,
					serialize: (e) => e ? "1" : "0",
					parse: (e) => e === "1"
				}),
				logSize: d(`${v}-logsize`, 1e3, {
					internal: !0,
					serialize: String,
					parse: Number,
					validate: (e) => Tr.includes(e)
				}),
				pos: d(`${v}-pos`, null, {
					internal: !0,
					validate: (e) => e !== null && typeof e.left == "number" && typeof e.top == "number"
				}),
				size: d(`${v}-size`, null, {
					internal: !0,
					validate: (e) => e !== null && typeof e.width == "number" && typeof e.height == "number"
				})
			};
		}, _), Er = e;
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
	Sr?.();
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto";
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s = () => {};
	s = ee(e, n, {
		move: (e) => r(e, a),
		end: () => {
			Sr === s && (Sr = null), document.body.style.userSelect = o, i();
		}
	}), Sr = s;
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
	return Ce(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function Nr(t) {
	if (J || typeof document > "u") return;
	let r = t ?? document.body;
	if (xr = i({ inspect: !0 }).inspect ?? !1, !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${v}-css`, e.textContent = oe, document.head.append(e);
	}
	Z = e("stats", _);
	let a = Q().theme(), o = /* @__PURE__ */ h("span", { class: "li-menu-val" }), s = () => {
		J?.setAttribute("data-theme", a), _r?.setAttribute("data-theme", a), o.innerHTML = ce(hr[a], 13), c.title = `Theme: ${a} (click to cycle)`;
	}, c = /* @__PURE__ */ g("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ h("span", { children: "Theme" }), o]
	});
	f(c, () => {
		let e = [
			"system",
			"light",
			"dark"
		];
		a = e[(e.indexOf(a) + 1) % e.length] ?? "system", Q().theme(a), s();
	});
	let l = /* @__PURE__ */ h("div", {
		class: "li-menu",
		hidden: !0
	});
	l.id = `${v}-menu`, l.append(c), _r = l;
	let u = Q().logSize(), ee = /* @__PURE__ */ h("span", { class: "li-menu-val" }), d = () => {
		ee.textContent = `${u / 1e3}k`, Nt(u);
	}, te = /* @__PURE__ */ g("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ h("span", { children: "Log size" }), ee]
	});
	f(te, () => {
		u = Tr[(Tr.indexOf(u) + 1) % Tr.length] ?? 1e3, Q().logSize(u), d();
	}), l.append(te), d();
	let ne = () => {
		l.hidden = !0;
	}, re = /* @__PURE__ */ g("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ h("span", { children: "Hide" }), /* @__PURE__ */ h("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	f(re, () => {
		ne(), Pr();
	}), l.append(re);
	let p = /* @__PURE__ */ h("button", {
		type: "button",
		title: "Settings"
	});
	p.append(Mr(me)), f(p, (e) => {
		if (e.stopPropagation(), !l.hidden) {
			ne();
			return;
		}
		l.hidden = !1;
		let t = p.getBoundingClientRect(), n = l.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), l.style.left = `${Math.max(8, r)}px`, l.style.top = `${Math.max(8, i)}px`;
	});
	let m = /* @__PURE__ */ h("button", { type: "button" }), se = (e) => {
		m.title = e ? "Expand" : "Collapse", m.replaceChildren(Mr(e ? ue : le));
	}, y = Q().min();
	se(y), f(m, () => {
		let e = !!J?.classList.toggle("li-min");
		se(e), Q().min(e), e ? X?.pause() : X?.resume(), Et(!e && Z?.() === "trace");
	});
	let de = /* @__PURE__ */ g("span", {
		class: "li-brand",
		children: [we(15), /* @__PURE__ */ h("b", { children: "Loom" })]
	}), fe = /* @__PURE__ */ g("div", {
		class: "li-bar",
		children: [
			de,
			/* @__PURE__ */ h("span", { class: "li-sp" }),
			p,
			m
		]
	}), pe;
	X = n(() => {
		pe = dr({
			activeTab: () => Z?.(),
			isMinimized: () => J?.classList.contains("li-min") ?? !1
		});
	}, _), y && X.pause();
	let he = /* @__PURE__ */ new Map(), ge = /* @__PURE__ */ new Map();
	Y = /* @__PURE__ */ h("div", { class: "li-body" });
	for (let e of gr) {
		let t = e.id === "stats" ? pe : e.id === "graph" ? Re() : Ot();
		he.set(e.id, t), Y.append(t);
	}
	wt((e) => {
		Z?.("graph"), ut(e);
	});
	let _e = /* @__PURE__ */ h("div", { class: "li-tabscroll" });
	for (let e of gr) {
		let t = /* @__PURE__ */ h("button", {
			type: "button",
			class: "li-tab",
			children: e.label
		});
		if (e.id === "trace") {
			let e = /* @__PURE__ */ h("span", {
				class: "li-tr-live",
				title: "Live — capturing"
			});
			t.append(e), Tt(e);
		}
		f(t, () => Z?.(e.id)), ge.set(e.id, t), _e.append(t);
	}
	let ve = /* @__PURE__ */ h("div", {
		class: "li-tabs",
		children: _e
	}), ye = /* @__PURE__ */ h("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ h("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ h("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	J = /* @__PURE__ */ g("div", { children: [
		fe,
		ve,
		Y,
		ye
	] }), J.id = v, y && J.classList.add("li-min"), s(), Ar(fe, J), jr(ye, J), vr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!l.hidden && (t === null || !l.contains(t)) && e.target !== p && ne();
	}, document.addEventListener("pointerdown", vr), r.append(J), document.body.append(l);
	let be = Q().size(), xe = Q().pos();
	if (be && (J.style.width = `${Math.max(240, Math.min(be.width, window.innerWidth - 16))}px`, J.style.height = `${Math.max(160, Math.min(be.height, window.innerHeight - 16))}px`), xe) {
		let { left: e, top: t } = Or(J, xe.left, xe.top);
		J.style.left = `${e}px`, J.style.top = `${t}px`, J.style.right = "auto", J.style.bottom = "auto";
	}
	ie(J, () => {
		let e = Z?.();
		wr && wr !== e && Y && Cr.set(wr, Y.scrollTop), e === "stats" ? pr() : fr(), e !== "graph" && ot();
		for (let t of gr) {
			let n = t.id === e, r = he.get(t.id), i = ge.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && Y) {
			let t = Cr.get(e) ?? 0, n = Math.max(0, Y.scrollHeight - Y.clientHeight);
			Y.scrollTop = Math.min(t, n), e === "graph" ? ct() : e === "trace" && Ft();
		}
		Et(e === "trace" && J?.classList.contains("li-min") !== !0), wr = e ?? null;
	}), yr.push(ae(Y, { transition: 120 }), ae(_e, {
		axis: "x",
		transition: 120
	}));
}
function Pr() {
	if (!(typeof document > "u")) {
		Sr?.(), Sr = null, mr();
		for (let e of yr) e();
		yr.length = 0, X?.stop(), X = null, br?.stop(), br = null, Er = null, vr && document.removeEventListener("pointerdown", vr), vr = null, _r && p(_r), _r = null, J && p(J), J = null, Y = null, Z = null, Cr.clear(), wr = null, dt(), It(), xr !== null && i({ inspect: xr }), xr = null;
	}
}
function Fr() {
	return J !== null;
}
function Ir(e) {
	J ? Pr() : Nr(e);
}
//#endregion
export { Fr as inspectorMounted, Nr as mountInspector, Ir as toggleInspector, Pr as unmountInspector };
