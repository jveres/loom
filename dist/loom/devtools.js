import { _ as e, a as t, d as n, h as r, i, m as a, p as o } from "./loom-2OcbExJD.js";
import { i as s, n as c, r as l } from "./meter-BpZi4z8k.js";
import { n as ee, t as te } from "./observe-CGmXMWaV.js";
import { f as u, h as ne, m as re, n as ie, p as d } from "./dom-DCPn5g2j.js";
import { virtualList as f } from "./dom/virtual-list.js";
import { jsx as p, jsxs as m } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var h = { internal: !0 }, g = [];
function ae(e, n) {
	g.push(t(e, n ? {
		...h,
		...n
	} : h));
}
function oe() {
	for (let e of g) e();
	g.length = 0;
}
//#endregion
//#region src/devtools/inspector.css?inline
var se = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;flex:auto;align-items:flex-end;gap:1px;min-width:0;margin-top:6px;display:flex;overflow-x:auto}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", _ = "loom-inspector";
//#endregion
//#region src/devtools/format.ts
function v(e, t) {
	return e === void 0 ? "—" : e === null ? "null" : typeof e == "number" ? Number.isInteger(e) ? String(e) : e.toFixed(2) : typeof e == "string" ? e.length > t ? `"${e.slice(0, t)}…"` : `"${e}"` : typeof e == "boolean" ? String(e) : Array.isArray(e) ? `[${e.length}]` : typeof e == "object" ? "{…}" : String(e);
}
function ce(e) {
	return typeof e == "number" ? "li-gv-num" : typeof e == "string" ? "li-gv-str" : typeof e == "boolean" ? "li-gv-bool" : e == null ? "li-gv-nul" : "";
}
//#endregion
//#region src/devtools/icons.ts
function le(e, t) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`;
}
var ue = "<polyline points=\"4 14 10 14 10 20\"/><polyline points=\"20 10 14 10 14 4\"/><line x1=\"14\" x2=\"21\" y1=\"10\" y2=\"3\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", de = "<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" x2=\"14\" y1=\"3\" y2=\"10\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", fe = "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>", pe = "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", me = "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>", he = "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", ge = "<circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"currentColor\" stroke=\"none\"/>", _e = "<circle cx=\"12\" cy=\"12\" r=\"5\"/>", ve = "<path d=\"M5 19c.264.956.797 2 2.187 2c2.407 0 3.008-2 4.813-9s2.406-9 4.813-9c1.39 0 1.923 1.044 2.187 2M9 10h8\"/>", ye = "<path d=\"m6 9 6 6 6-6\"/>", be = "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"22\" x2=\"18\" y1=\"12\" y2=\"12\"/><line x1=\"6\" x2=\"2\" y1=\"12\" y2=\"12\"/><line x1=\"12\" x2=\"12\" y1=\"6\" y2=\"2\"/><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"18\"/>", xe = "<path d=\"M3 6h18\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", Se = "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/>", Ce = "<polygon points=\"6 3 20 12 6 21 6 3\"/>";
function we(e) {
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.firstElementChild;
	if (!n) throw Error("icon markup produced no element");
	return n;
}
function y(e, t) {
	return we(le(e, t));
}
function Te(e) {
	return we(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/mirror.ts
var Ee = 300, De = null, Oe = /* @__PURE__ */ new Map(), ke = /* @__PURE__ */ new Map(), Ae = 0, je = 0, b = !0, Me = !1, Ne = !1, Pe = 0;
function Fe() {
	De = l([
		c.create,
		c.dispose,
		c.write,
		c.compute
	]), b = !0;
}
function Ie() {
	De?.stop(), De = null, Oe = /* @__PURE__ */ new Map(), ke.clear(), Ae = 0, je = 0, b = !0, Me = !1, Ne = !1, Pe = 0;
}
function Le() {
	let e = De?.read();
	if (e) {
		let t = e["loom:create"]?.count ?? 0, n = e["loom:dispose"]?.count ?? 0;
		Ne ||= t !== 0 || n !== 0, Me ||= Ne || (e["loom:write"]?.count ?? 0) !== 0 || (e["loom:compute"]?.count ?? 0) !== 0;
		let r = performance.now();
		if ((b || Me) && (b || r - Pe >= Ee)) {
			let e = b;
			b = !1, Pe = r, Oe = new Map(te().nodes.map((e) => [e.id, e]));
			for (let e of Oe.values()) ke.set(e.id, e.label);
			Ae++, (e || Ne) && je++, Me = !1, Ne = !1;
		}
	}
	return {
		revision: Ae,
		setRevision: je,
		nodes: Oe
	};
}
function Re(e) {
	return Le(), ke.get(e) ?? `#${e}`;
}
//#endregion
//#region src/devtools/graph.tsx
var ze = 300, Be = 22, Ve = 16, x = null, He = -1, Ue = -1, S = [], C = [], We = [], Ge = null, Ke = -1, qe = 0, Je = !1, Ye = !1, w = /* @__PURE__ */ new Set(), Xe = -1;
function Ze() {
	return x = f({
		rowHeight: Be,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: ut
	}), x.el.classList.add("li-pane", "li-graph"), x.el;
}
function Qe(e) {
	return T(e.id).length > 0;
}
function $e(e, t) {
	if (typeof t == "number") {
		let n = Number(e);
		return Number.isNaN(n) ? t : n;
	}
	return e;
}
function et(e) {
	if (e.kind !== "state" || !e.source) return !1;
	let t = e.value;
	return t === null || typeof t == "number" || typeof t == "string" || typeof t == "boolean";
}
function tt(e, t, n, r = !1) {
	if (Ke === n) return;
	let i = e.querySelector(".li-gval");
	if (!i) return;
	let a = v(t, Ve);
	!r && !Je && e.dataset.prev !== void 0 && e.dataset.prev !== a && st(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${ce(t)}`, e.dataset.prev = a;
}
function nt(e, t, n, r) {
	let i = t();
	if (typeof i == "boolean") {
		t(!i), tt(r, t(), e, !0), rt(e, r);
		return;
	}
	if (i !== null && typeof i != "number" && typeof i != "string") return;
	let a = document.createElement("input");
	a.className = "li-gedit", a.value = typeof i == "string" ? i : String(i), Ge = a, Ke = e, n.replaceWith(a), a.focus(), a.select();
	let o = () => {
		Ge = null, Ke = -1, a.parentNode && a.replaceWith(n);
	}, s = () => {
		Ge === a && (t($e(a.value, i)), o(), tt(r, t(), e, !0), rt(e, r));
	};
	a.onblur = s, a.onkeydown = (e) => {
		e.key === "Enter" ? s() : e.key === "Escape" && o();
	};
}
function rt(e, t) {
	t.matches(":hover") && E(T(e), !0);
}
function T(e) {
	let t = Le().nodes, n = [], r = /* @__PURE__ */ new Set([e]), i = t.get(e), a = i ? [...i.subs] : [];
	for (; a.length > 0;) {
		let e = a.shift();
		if (e === void 0 || r.has(e)) continue;
		r.add(e);
		let i = t.get(e);
		if (i) if (i.kind === "effect") {
			let e = i.target;
			(e instanceof Element || e instanceof CharacterData) && n.push(e);
		} else for (let e of i.subs) a.push(e);
	}
	return n;
}
function it(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of Le().nodes.values()) if (r.group === e) for (let e of T(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function at(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function E(e, t) {
	for (let e of We) e.remove();
	if (We = [], t) for (let t of e) {
		let e = at(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), We.push(n);
	}
}
function ot(e) {
	E(T(e), !0);
}
function st(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function ct(e, t) {
	let n = e[0], r = n instanceof Element ? n : n?.parentElement ?? null;
	if (!r) return;
	E([], !1), r.scrollIntoView({
		block: "center",
		inline: "nearest",
		behavior: "smooth"
	});
	let i = !1, a = () => {
		i || (i = !0, window.removeEventListener("scrollend", a), t() && E(e, !0));
	};
	window.addEventListener("scrollend", a), window.setTimeout(a, 600);
}
function lt(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `fields #${e}`;
}
function ut(e, t) {
	if (e.kind === "header") return t ? ft(t, e) : dt(e);
	let n = t ? mt(t, e) : pt(e);
	return e.node.id === Xe && (st(n), Xe = -1), n;
}
function dt(e) {
	let t = /* @__PURE__ */ p("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ p("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = y(ye, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ p("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(y(be, 11));
	let a = /* @__PURE__ */ m("div", {
		class: "li-gns-h",
		children: [
			r,
			n,
			t,
			i
		]
	}), o = e.gid;
	return w.has(o) && a.classList.add("collapsed"), a.onclick = () => {
		w.has(o) ? w.delete(o) : w.add(o), x?.setItems(_t());
	}, i.onclick = (e) => {
		e.stopPropagation(), ct(it(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => E(it(o), !0), a.onmouseleave = () => E(it(o), !1), a;
}
function ft(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", w.has(t.gid)), e;
}
function pt(e) {
	let t = e.node, n = /* @__PURE__ */ p("span", { class: "li-gval" }), r = Qe(t), i = y(t.kind === "computed" ? ve : r ? ge : _e, 13);
	i.classList.add("li-gicon", r ? t.kind === "computed" ? "li-gi-computed" : "li-gi-state" : "li-gi-dim");
	let a = /* @__PURE__ */ m("div", {
		class: "li-grow",
		children: [
			i,
			/* @__PURE__ */ p("span", {
				class: "li-glabel",
				children: e.child ? t.key ?? t.label : t.label
			}),
			n
		]
	});
	if (e.child && a.classList.add("li-grow-child"), a.onmouseenter = () => E(T(t.id), !0), a.onmouseleave = () => E(T(t.id), !1), et(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => nt(t.id, e, n, a);
	}
	return tt(a, t.value, t.id), a;
}
function mt(e, t) {
	return tt(e, t.node.value, t.node.id), e;
}
function ht() {
	let e = C.length;
	for (let t of S) e += 1 + (w.has(t.gid) ? 0 : t.cells.length);
	return e;
}
function gt(e) {
	let t = e;
	for (let e of S) {
		if (t === 0) return {
			kind: "header",
			gid: e.gid,
			label: e.label,
			count: e.cells.length
		};
		if (--t, !w.has(e.gid)) {
			if (t < e.cells.length) return {
				kind: "cell",
				node: e.cells[t],
				child: !0
			};
			t -= e.cells.length;
		}
	}
	return t < C.length ? {
		kind: "cell",
		node: C[t],
		child: !1
	} : void 0;
}
function _t() {
	return {
		length: ht(),
		at: gt
	};
}
function vt() {
	if (!x) return;
	let e = Le();
	if (!Ye && e.revision === He) return;
	let t = e.setRevision !== Ue;
	if (He = e.revision, Ue = e.setRevision, t) {
		let t = /* @__PURE__ */ new Map(), n = [];
		for (let r of e.nodes.values()) if (!(r.internal || r.kind === "effect" || r.subs.length === 0)) if (r.group !== void 0) {
			let e = t.get(r.group);
			e ? e.push(r) : t.set(r.group, [r]);
		} else n.push(r);
		S = [];
		for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), S.push({
			gid: e,
			label: lt(e, n),
			cells: n
		});
		C = n;
	} else {
		for (let t of S) t.cells = t.cells.map((t) => e.nodes.get(t.id) ?? t);
		C = C.map((t) => e.nodes.get(t.id) ?? t);
	}
	Je = Ye, x.setItems(_t()), Je = !1, Ye = !1;
}
function yt() {
	E([], !1);
}
function bt() {
	let e = performance.now();
	e - qe >= ze && (qe = e, vt());
}
function xt() {
	if (x) {
		for (let e of x.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Ye = !0, x.refresh();
	}
}
function St(e) {
	let t = 0;
	for (let n of S) {
		let r = n.cells.findIndex((t) => t.id === e);
		if (r >= 0) return w.has(n.gid) && (w.delete(n.gid), x?.setItems(_t())), t + 1 + r;
		t += 1 + (w.has(n.gid) ? 0 : n.cells.length);
	}
	let n = C.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function Ct(e) {
	if (x === null) return;
	vt();
	let t = St(e);
	t < 0 || (Xe = e, x.scrollToIndex(t));
}
function wt() {
	for (let e of We) e.remove();
	We = [], Ge = null, Ke = -1, x?.destroy(), x = null, S = [], C = [], w.clear(), He = -1, Ue = -1;
}
//#endregion
//#region src/devtools/trace.tsx
var Tt = 22, Et = 200, Dt = 1e3, Ot = [
	"writes",
	"reads",
	"all"
];
function kt(e) {
	return Ot.includes(e);
}
var D = null, At = null, jt = null, O = "all", Mt = null, k = null, Nt = null, A = null, j = null, M = [], N = [], P = !1, F = !1, I = "", Pt = 0, Ft = -1, L = -1, It = null;
function Lt(e) {
	It = e;
}
function Rt(e) {
	j = e, Bt();
}
function zt(e) {
	F !== e && (F = e, e ? (Ht(), qt()) : Ut(), Bt());
}
function Bt() {
	j && (j.classList.toggle("inactive", !F), j.classList.toggle("off", P), j.title = F ? P ? "Paused" : "Live — capturing" : "Trace");
}
function Vt() {
	Wt(), D = f({
		rowHeight: Tt,
		key: (e) => e.seq,
		render: $t
	}), A = /* @__PURE__ */ p("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), A.append(y(Se, 12)), u(A, () => Xt(!P));
	let e = /* @__PURE__ */ p("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(y(xe, 12)), u(e, () => Gt());
	let t = /* @__PURE__ */ p("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: Ot.map((e) => /* @__PURE__ */ p("option", {
			value: e,
			children: e
		}))
	});
	t.value = O, t.addEventListener("change", () => {
		kt(t.value) && (O = t.value), Wt();
	});
	let n = /* @__PURE__ */ p("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		I = n.value.trim().toLowerCase(), N = I ? M.filter((e) => e.name.toLowerCase().includes(I)) : [], Zt();
	}), k = /* @__PURE__ */ p("div", { class: "li-tr-scroll" }), k.append(D.el), Nt = ne(k), k.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== L && (L = Number(t), ot(L));
	}), k.addEventListener("pointerleave", () => {
		L = -1, yt();
	}), u(k, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (L = -1, yt(), It?.(Number(t)));
	}), Mt = /* @__PURE__ */ m("div", {
		class: "li-pane li-trace",
		children: [/* @__PURE__ */ m("div", {
			class: "li-tr-bar",
			children: [
				A,
				t,
				n,
				e
			]
		}), k]
	}), Mt;
}
function Ht() {
	O !== "reads" && !At && (At = l([c.write], "samples")), O !== "writes" && !jt && (jt = l([c.read], "samples"));
}
function Ut() {
	At?.stop(), At = null, jt?.stop(), jt = null;
}
function Wt() {
	Ut(), F && Ht(), Ft = -1, Zt(), qt();
}
function Gt() {
	M = [], N = [], Ft = -1, Zt();
}
function Kt(e) {
	Dt = e, M.length > e && (M.length = e), N.length > e && (N.length = e), Zt();
}
function qt() {
	if (P || D === null) return;
	let e = [], t = At?.read()["loom:write"]?.samples;
	if (t) for (let n of t) e.push({
		s: n,
		kind: "write"
	});
	let n = jt?.read()["loom:read"]?.samples;
	if (n) for (let t of n) e.push({
		s: t,
		kind: "read"
	});
	if (e.length === 0) return;
	O === "all" && e.sort((e, t) => s(e.s).t - s(t.s).t);
	let r = (I ? N : M)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(Qt(t, n));
	if (i.reverse(), M = i.concat(M), I) {
		let e = i.filter((e) => e.name.toLowerCase().includes(I));
		e.length > 0 && (N = e.concat(N));
	}
	M.length > Dt && (M.length = Dt), N.length > Dt && (N.length = Dt), Ft = ((I ? N : M)[0]?.seq ?? -1) === r ? -1 : r, Zt();
}
function Jt() {
	qt(), Zt(), requestAnimationFrame(() => D?.refresh());
}
function Yt() {
	Ut(), D = null, Mt = null, k = null, Nt?.(), Nt = null, A = null, j = null, M = [], N = [], Ft = -1, P = !1, F = !1, I = "", O = "all", L = -1, It = null;
}
function Xt(e) {
	P = e, A?.replaceChildren(y(e ? Ce : Se, 12)), Bt(), Mt?.classList.toggle("li-tr-paused", e), e || qt();
}
function Zt() {
	let e = I ? N : M;
	D?.setItems(O === "all" ? e : e.filter((e) => e.kind === (O === "writes" ? "write" : "read")));
}
function Qt(e, t) {
	let n = s(e), r = n.id, i = Re(r), a = tn(n.t), o = n.by, c = o === void 0 ? "" : `by ${Re(o)}`;
	if (t === "read") return {
		seq: Pt++,
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
	let l = s(e), ee = v(l.prev, Et), te = v(l.next, Et);
	return {
		seq: Pt++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: ee,
		prevCls: ce(l.prev),
		nextText: te,
		nextCls: ce(l.next),
		srcText: c,
		full: `${i}: ${ee} → ${te} ${c || "(external)"}`
	};
}
function $t(e, t) {
	let n = t ?? en(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3], a = i.children[0], o = i.children[1], s = i.children[2], c = i.children[3];
	return e.kind === "read" ? (a.textContent = "", a.className = "li-tr-val", o.textContent = "", s.textContent = "", s.className = "li-tr-val") : (a.textContent = e.prevText, a.className = `li-tr-val ${e.prevCls}`, o.textContent = " → ", s.textContent = e.nextText, s.className = `li-tr-val ${e.nextCls}`), c.textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === Ft), n;
}
function en() {
	return /* @__PURE__ */ m("div", {
		class: "li-tr",
		children: [
			/* @__PURE__ */ p("span", { class: "li-tr-kind" }),
			/* @__PURE__ */ p("span", { class: "li-tr-time" }),
			/* @__PURE__ */ p("span", { class: "li-tr-name" }),
			/* @__PURE__ */ m("span", {
				class: "li-tr-change",
				children: [
					/* @__PURE__ */ p("span", { class: "li-tr-val" }),
					/* @__PURE__ */ p("span", { class: "li-tr-arrow" }),
					/* @__PURE__ */ p("span", { class: "li-tr-val" }),
					/* @__PURE__ */ p("span", { class: "li-tr-src" })
				]
			})
		]
	});
}
function tn(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
//#endregion
//#region src/devtools/stats.tsx
var nn = 138, rn = 34, an = 2 * Math.PI * rn, on = an * .75, sn = 120, cn = sn / 1e3, ln = 200, un = () => void 0, dn = () => !1, R = null, fn = null, pn = null, mn = null, hn = 0, gn = null, _n = null, vn = 0, yn = 0, bn = 0, xn = 0, Sn = 0, Cn = 0, wn = 0, Tn = 0, En = 0, z = 0, B = !1, Dn = 0, On = 0, kn = 0, An = 0, V = [], jn = 0, Mn = 0, Nn = 0, Pn = !1, Fn = null, In = null, Ln = null, Rn = null, zn = null, Bn = 100, Vn = "", Hn = "", Un = !1, Wn = "", Gn = 0, Kn = 0, qn = 0, Jn = 0, Yn = 0, Xn = 0, Zn = 0, Qn = 0;
function H(e, t, n) {
	ie(e, t, n, h);
}
function U(e) {
	return e?.() ?? 0;
}
function W(e) {
	return () => (R?.(), e());
}
var G = (e, t) => e * .6 + t / cn * .4;
function K(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function $n(e) {
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
function er(e) {
	let t = 1e3 / e;
	return t >= 55 ? "h-ok" : t >= 30 ? "h-warn" : "h-bad";
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
	return [/* @__PURE__ */ p("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: rn,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${an}`
	}), /* @__PURE__ */ p("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function lr() {
	let e = /* @__PURE__ */ p("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: rn,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	H(e, "stroke-dasharray", W(() => `${on * Bn / 100} ${an}`)), H(e, "class", W(() => `li-garc h-${Vn}`));
	let t = /* @__PURE__ */ p("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(d(W(() => String(Bn)), h)), H(t, "class", W(() => `li-gnum h-${Vn}`)), [e, t];
}
function ur() {
	return /* @__PURE__ */ m("svg", {
		width: 88,
		height: 88,
		viewBox: "0 0 88 88",
		role: "img",
		"aria-label": "Health",
		children: [
			/* @__PURE__ */ p("circle", {
				class: "li-gtrack",
				cx: 44,
				cy: 44,
				r: rn,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${on} ${an}`
			}),
			re(W(() => Un), lr, cr),
			/* @__PURE__ */ p("text", {
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
	for (let t = 0; t < nn; t++) e.push(/* @__PURE__ */ p("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	let t = Array(nn).fill(-1);
	return ae(() => {
		R?.();
		let n = e.length - V.length;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (!i) continue;
			let a = r >= n ? V[r - n] ?? 0 : 0;
			if (a === t[r]) continue;
			t[r] = a;
			let o = Math.max(0, Math.min(20, a / 50 * 20));
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? er(a) : "");
		}
	}), /* @__PURE__ */ p("div", {
		class: "li-histo",
		title: J.frames,
		children: /* @__PURE__ */ p("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${nn} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
}
function q(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ p("span", { class: `li-stat-v ${n}` });
	return i.append(d(W(t), h)), /* @__PURE__ */ m("div", {
		class: "li-stat",
		children: [/* @__PURE__ */ p("span", {
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
	states: "Live state cells in the reactive graph.",
	computeds: "Live computed values.",
	effects: "Live app effects (your effect() calls), excluding DOM-binding views.",
	views: "Live DOM bindings (text/attr/class/style/list) — the rendering output.",
	sources: "Live lazy sources (source/poll) — external producers wired into the graph.",
	scopes: "Live scopes grouping effects and resources.",
	channels: "Registered channels — gated ring-buffer event streams for any use (7 built-in reactive ones + any the app declares).",
	unread: "States/computeds nothing currently reads (no subscribers). Some are normal; a count that keeps climbing under steady state suggests leaked cells."
};
function fr() {
	let e = /* @__PURE__ */ p("span", { class: "li-perfh-fps" });
	e.append(d(W(() => B ? `${Math.round(z)} fps` : "— fps"), h)), H(e, "class", W(() => `li-perfh-fps ${Wn}`));
	let t = /* @__PURE__ */ p("div", {
		class: "li-hlabel",
		title: J.health
	});
	t.append(d(W(() => B ? Hn.toUpperCase() : "LOADING"), h)), H(t, "class", W(() => Un ? `li-hlabel h-${Vn}` : "li-hlabel"));
	let n = /* @__PURE__ */ m("div", {
		class: "li-hstats",
		children: [t, q("lag", () => `${jn.toFixed(0)} · pk ${Mn.toFixed(0)} ms`, "lo", J.lag)]
	});
	return n.append(pr("blocked", () => {
		if (!or) return "—";
		let e = U(Rn);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!or) return "";
		let e = U(Rn);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, J.blocked)), n.append(pr("CLS", () => U(Fn).toFixed(2), () => {
		let e = U(Fn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, J.cls)), n.append(pr("LCP", () => {
		let e = U(In);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => tr(U(In), 2500, 4e3), J.lcp)), n.append(pr("INP", () => {
		let e = U(Ln);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => tr(U(Ln), 200, 500), J.inp)), /* @__PURE__ */ m("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ m("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ p("span", {
					title: J.fps,
					children: "Performance"
				}), e]
			}),
			dr(),
			/* @__PURE__ */ m("div", {
				class: "li-hblock",
				children: [ur(), n]
			}),
			q("frame time", () => `${An.toFixed(1)} ms`, "", J.frameTime),
			mr() ? hr() : null,
			q("writes / s", () => K(yn), "hi", J.writes),
			q("reads / s", () => K(vn), "hi", J.reads),
			q("computeds / s", () => K(bn), "", J.computedsRate),
			q("effect runs / s", () => K(xn), "lo", J.effectRuns),
			q("flushes / s", () => K(Sn), "lo", J.flushes),
			q("effects / flush", () => String(Tn), "", J.effectsPerFlush),
			q("flush time", () => `${En.toFixed(1)} ms`, "", J.flushTime),
			q("creates / s", () => K(Cn), "lo", J.creates),
			q("disposes / s", () => K(wn), "lo", J.disposes),
			q("states", () => String(Gn), "", J.states),
			q("computeds", () => String(Kn), "", J.computeds),
			pr("unread", () => String(Qn), () => Qn > 0 ? "h-warn" : "", J.unread),
			q("effects", () => String(qn), "", J.effects),
			q("views", () => String(Jn), "", J.views),
			q("sources", () => String(Yn), "", J.sources),
			q("scopes", () => String(Xn), "", J.scopes),
			q("channels", () => String(Zn), "", J.channels)
		]
	});
}
function pr(e, t, n, r = "") {
	let i = q(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && H(a, "class", W(() => `li-stat-v ${n()}`)), i;
}
function mr() {
	return performance.memory;
}
function hr() {
	return q("heap", () => {
		let e = zn?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", J.heap);
}
function gr() {
	let e = gn?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, c = _n?.read()?.["loom:flush"];
	vn = G(vn, t), yn = G(yn, n), xn = G(xn, r), bn = G(bn, i), Cn = G(Cn, a), wn = G(wn, o), Sn = G(Sn, c?.count ?? 0);
	let l = s(c?.samples.at(-1));
	if (l !== void 0 && (Tn = l.batchSize, En = l.durationMs), !B) Un = !1, Wn = "";
	else {
		let e = $n(z);
		Bn = e.score, Vn = e.key, Hn = e.label, Un = !0, Wn = z >= 55 ? "h-ok" : z >= 30 ? "h-warn" : "h-bad";
	}
	return ++hn;
}
function _r() {
	let e = !dn();
	if (un() === "stats" && e) {
		let e = ee();
		Gn = e.states, Kn = e.computeds, qn = e.effects - e.targetedEffects, Jn = e.targetedEffects, Yn = e.sources, Xn = e.scopes, Zn = e.channels, Qn = e.unread;
	} else un() === "graph" && e ? bt() : un() === "trace" && e && qt();
}
function vr() {
	document.hidden && (Pn = !0);
}
function yr() {
	Nn = performance.now() + ln, fn = setInterval(() => {
		let e = performance.now(), t = Nn;
		if (Nn = e + ln, document.hidden) {
			Pn = !0;
			return;
		}
		if (Pn) {
			Pn = !1;
			return;
		}
		jn = Math.max(0, e - t), jn > Mn && (Mn = jn);
	}, ln), document.addEventListener("visibilitychange", vr), kn = 0;
	let e = (t) => {
		if (pn = requestAnimationFrame(e), kn) {
			let e = Math.min(t - kn, 1e3);
			if (An = e, V.push(e), V.length > nn && V.shift(), Dn += e, On++, Dn >= 500) {
				let e = On * 1e3 / Dn;
				z = B ? z * .5 + e * .5 : e, B = !0, Dn = 0, On = 0;
			}
		}
		kn = t;
	};
	pn = requestAnimationFrame(e);
}
function br(t) {
	un = t.activeTab, dn = t.isMinimized, gn = l([
		c.read,
		c.write,
		c.compute,
		c.effect,
		c.create,
		c.dispose
	]), _n = l([c.flush], "samples"), R = n(gr, sn, h), ae(() => {
		R?.(), e(_r);
	}, {
		defer: !0,
		maxStale: sn
	});
	let r;
	return mn = o(() => {
		Fn = a(rr, 0, h), In = a(ir, 0, h), Ln = a(ar, 0, h), Rn = a(sr, 0, h), mr() && (zn = n(() => mr()?.usedJSHeapSize ?? 0, 5e3, h)), r = fr();
	}, h), yr(), r;
}
function xr() {
	mn?.pause();
}
function Sr() {
	mn?.resume();
}
function Cr() {
	gn?.stop(), gn = null, _n?.stop(), _n = null, R?.stop(), R = null, fn != null && clearInterval(fn), fn = null, document.removeEventListener("visibilitychange", vr), pn != null && cancelAnimationFrame(pn), pn = null, mn?.stop(), mn = null, zn = Fn = In = Ln = Rn = null, hn = 0, vn = yn = bn = xn = Sn = 0, Cn = wn = 0, Tn = En = 0, z = 0, B = !1, Dn = On = kn = An = 0, V.length = 0, jn = Mn = 0, Pn = !1, Un = !1, Bn = 100, Vn = Hn = Wn = "", Gn = Kn = qn = Jn = 0, Yn = Xn = Zn = Qn = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var wr = {
	system: me,
	light: fe,
	dark: pe
}, Tr = [
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
], Y = null, Er = null, X = null, Dr = null, Or = [], Z = null, Q = null, kr = /* @__PURE__ */ new Map(), Ar = null;
function jr(e) {
	try {
		return localStorage.getItem(e);
	} catch {
		return null;
	}
}
function Mr(e, t) {
	try {
		localStorage.setItem(e, t);
	} catch {}
}
var Nr = `${_}-theme`, Pr = `${_}-min`, Fr = `${_}-pos`, Ir = `${_}-size`, Lr = `${_}-logsize`, Rr = [
	1e3,
	5e3,
	25e3
];
function zr() {
	let e = jr(Nr);
	return e === "light" || e === "dark" || e === "system" ? e : "system";
}
function Br() {
	let e = Number(jr(Lr));
	return Rr.includes(e) ? e : 1e3;
}
function Vr(e, t) {
	let n = jr(e);
	if (!n) return null;
	try {
		let e = JSON.parse(n), r = {};
		for (let n of t) {
			if (typeof e?.[n] != "number") return null;
			r[n] = e[n];
		}
		return r;
	} catch {}
	return null;
}
var Hr = Vr(Fr, ["left", "top"]), Ur = Vr(Ir, ["width", "height"]);
function $(e) {
	let t = window.devicePixelRatio || 1;
	return Math.round(e * t) / t;
}
function Wr(e, t, n, r) {
	let i = e.offsetWidth, a = Math.min(80, i);
	return {
		left: $(Math.min(window.innerWidth - a, Math.max(a - i, n))),
		top: $(Math.min(window.innerHeight - t, Math.max(0, r)))
	};
}
function Gr(e, t, n) {
	let r = Math.max(0, window.innerWidth - e.offsetWidth), i = Math.max(0, window.innerHeight - e.offsetHeight);
	return {
		left: $(Math.max(0, Math.min(t, r))),
		top: $(Math.max(0, Math.min(n, i)))
	};
}
function Kr(e, t, n) {
	return e.addEventListener("pointermove", t), e.addEventListener("pointerup", n), e.addEventListener("pointercancel", n), () => {
		e.removeEventListener("pointermove", t), e.removeEventListener("pointerup", n), e.removeEventListener("pointercancel", n);
	};
}
function qr(e, t, n, r, i) {
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto", e.setPointerCapture?.(n.pointerId);
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s = () => {};
	s = Kr(e, (e) => r(e, a), () => {
		e.releasePointerCapture?.(n.pointerId), document.body.style.userSelect = o, i(), s();
	});
}
function Jr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		if (n.target?.closest("button")) return;
		n.preventDefault();
		let r = n.clientX, i = n.clientY;
		e.style.cursor = "grabbing", qr(e, t, n, (n, a) => {
			let { left: o, top: s } = Wr(t, e.offsetHeight || 40, a.left + n.clientX - r, a.top + n.clientY - i);
			t.style.left = `${o}px`, t.style.top = `${s}px`, Hr = {
				left: o,
				top: s
			};
		}, () => {
			e.style.cursor = "", Hr && Mr(Fr, JSON.stringify(Hr));
		});
	});
}
function Yr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		n.preventDefault(), n.stopPropagation();
		let r = n.clientX, i = n.clientY;
		qr(e, t, n, (e, n) => {
			let a = $(Math.max(240, Math.min(window.innerWidth - n.left - 8, n.width + e.clientX - r))), o = $(Math.max(160, Math.min(window.innerHeight - n.top - 8, n.height + e.clientY - i)));
			t.style.width = `${a}px`, t.style.height = `${o}px`, Ur = {
				width: a,
				height: o
			};
		}, () => {
			Ur && Mr(Ir, JSON.stringify(Ur));
		});
	});
}
function Xr(e) {
	return we(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function Zr(e = document.body) {
	if (Y || typeof document > "u") return;
	if (i({ inspect: !0 }), Fe(), !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${_}-css`, e.textContent = se, document.head.append(e);
	}
	Q = r("stats", h);
	let t = zr(), n = /* @__PURE__ */ p("span", { class: "li-menu-val" }), a = () => {
		Y?.setAttribute("data-theme", t), Er?.setAttribute("data-theme", t), n.innerHTML = le(wr[t], 13), s.title = `Theme: ${t} (click to cycle)`;
	}, s = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ p("span", { children: "Theme" }), n]
	});
	u(s, () => {
		let e = [
			"system",
			"light",
			"dark"
		];
		t = e[(e.indexOf(t) + 1) % e.length] ?? "system", Mr(Nr, t), a();
	});
	let c = /* @__PURE__ */ p("div", {
		class: "li-menu",
		hidden: !0
	});
	c.id = `${_}-menu`, c.append(s), Er = c;
	let l = Br(), ee = /* @__PURE__ */ p("span", { class: "li-menu-val" }), te = () => {
		ee.textContent = `${l / 1e3}k`, Kt(l);
	}, re = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ p("span", { children: "Log size" }), ee]
	});
	u(re, () => {
		l = Rr[(Rr.indexOf(l) + 1) % Rr.length] ?? 1e3, Mr(Lr, String(l)), te();
	}), c.append(re), te();
	let ie = () => {
		c.hidden = !0;
	}, d = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ p("span", { children: "Hide" }), /* @__PURE__ */ p("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	u(d, () => {
		ie(), Qr();
	}), c.append(d);
	let f = /* @__PURE__ */ p("button", {
		type: "button",
		title: "Settings"
	});
	f.append(Xr(he)), u(f, (e) => {
		if (e.stopPropagation(), !c.hidden) {
			ie();
			return;
		}
		c.hidden = !1;
		let t = f.getBoundingClientRect(), n = c.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), c.style.left = `${Math.max(8, r)}px`, c.style.top = `${Math.max(8, i)}px`;
	});
	let g = /* @__PURE__ */ p("button", { type: "button" }), oe = (e) => {
		g.title = e ? "Expand" : "Collapse", g.replaceChildren(Xr(e ? de : ue));
	}, v = jr(Pr) === "1";
	oe(v), u(g, () => {
		let e = !!Y?.classList.toggle("li-min");
		oe(e), Mr(Pr, e ? "1" : "0"), e ? Z?.pause() : Z?.resume(), zt(!e && Q?.() === "trace");
	});
	let ce = /* @__PURE__ */ m("div", {
		class: "li-bar",
		children: [
			/* @__PURE__ */ m("span", {
				class: "li-brand",
				children: [Te(15), /* @__PURE__ */ p("b", { children: "Loom" })]
			}),
			/* @__PURE__ */ p("span", { class: "li-sp" }),
			f,
			g
		]
	}), fe;
	Z = o(() => {
		fe = br({
			activeTab: () => Q?.(),
			isMinimized: () => Y?.classList.contains("li-min") ?? !1
		});
	}, h), v && Z.pause();
	let pe = /* @__PURE__ */ new Map(), me = /* @__PURE__ */ new Map();
	X = /* @__PURE__ */ p("div", { class: "li-body" });
	for (let e of Tr) {
		let t = e.id === "stats" ? fe : e.id === "graph" ? Ze() : Vt();
		pe.set(e.id, t), X.append(t);
	}
	Lt((e) => {
		Q?.("graph"), Ct(e);
	});
	let ge = /* @__PURE__ */ p("div", { class: "li-tabscroll" });
	for (let e of Tr) {
		let t = /* @__PURE__ */ p("button", {
			type: "button",
			class: "li-tab",
			children: e.label
		});
		if (e.id === "trace") {
			let e = /* @__PURE__ */ p("span", {
				class: "li-tr-live",
				title: "Live — capturing"
			});
			t.append(e), Rt(e);
		}
		u(t, () => Q?.(e.id)), me.set(e.id, t), ge.append(t);
	}
	let _e = /* @__PURE__ */ p("div", {
		class: "li-tabs",
		children: ge
	}), ve = /* @__PURE__ */ p("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ p("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ p("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	if (Y = /* @__PURE__ */ m("div", { children: [
		ce,
		_e,
		X,
		ve
	] }), Y.id = _, v && Y.classList.add("li-min"), a(), Jr(ce, Y), Yr(ve, Y), Dr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!c.hidden && (t === null || !c.contains(t)) && e.target !== f && ie();
	}, document.addEventListener("pointerdown", Dr), e.append(Y), document.body.append(c), Ur && (Y.style.width = `${Math.max(240, Math.min(Ur.width, window.innerWidth - 16))}px`, Y.style.height = `${Math.max(160, Math.min(Ur.height, window.innerHeight - 16))}px`), Hr) {
		let { left: e, top: t } = Gr(Y, Hr.left, Hr.top);
		Y.style.left = `${e}px`, Y.style.top = `${t}px`, Y.style.right = "auto", Y.style.bottom = "auto";
	}
	ae(() => {
		let e = Q?.();
		Ar && Ar !== e && X && kr.set(Ar, X.scrollTop), e === "stats" ? Sr() : xr(), e !== "graph" && yt();
		for (let t of Tr) {
			let n = t.id === e, r = pe.get(t.id), i = me.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && X) {
			let t = kr.get(e) ?? 0, n = Math.max(0, X.scrollHeight - X.clientHeight);
			X.scrollTop = Math.min(t, n), e === "graph" ? xt() : e === "trace" && Jt();
		}
		zt(e === "trace" && Y?.classList.contains("li-min") !== !0), Ar = e ?? null;
	}), Or.push(ne(X), ne(ge, { axis: "x" }));
}
function Qr() {
	Ie(), Cr();
	for (let e of Or) e();
	Or.length = 0, oe(), Z?.stop(), Z = null, Dr && document.removeEventListener("pointerdown", Dr), Dr = null, Er?.remove(), Er = null, Y?.remove(), Y = null, X = null, Q = null, kr.clear(), Ar = null, wt(), Yt();
}
function $r() {
	return Y !== null;
}
function ei(e = document.body) {
	Y ? Qr() : Zr(e);
}
//#endregion
export { $r as inspectorMounted, Zr as mountInspector, ei as toggleInspector, Qr as unmountInspector };
