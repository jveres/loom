import { a as e, c as t, f as n, g as r, h as i, i as a, l as o, m as s, o as c, p as l, u, v as ee } from "./loom-Bd5ggE4d.js";
import { bindAttr as te, tap as d, text as f, when as ne } from "./dom.js";
import { virtualList as p } from "./dom/virtual-list.js";
import { jsx as m, jsxs as h } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var g = { internal: !0 }, _ = [];
function re(t, n) {
	_.push(e(t, n ? {
		...g,
		...n
	} : g));
}
function ie() {
	for (let e of _) e();
	_.length = 0;
}
//#endregion
//#region src/devtools/inspector.css?inline
var ae = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-fade-y{--li-fade-a:0px;--li-fade-b:0px;-webkit-mask-image:linear-gradient(to bottom, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat;-webkit-mask-image:linear-gradient(to bottom, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);mask-image:linear-gradient(to bottom, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;--li-fade-a:0px;--li-fade-b:0px;min-width:0;-webkit-mask-image:linear-gradient(to right, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat;-webkit-mask-image:linear-gradient(to right, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);mask-image:linear-gradient(to right, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);flex:auto;align-items:flex-end;gap:1px;margin-top:6px;display:flex;overflow-x:auto;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector .li-spark{opacity:.82;flex:none;align-self:center;align-items:center;gap:5px;padding-top:2px;display:flex}#loom-inspector .li-spark svg{background:var(--li-hover);border-radius:4px;margin:0}#loom-inspector .li-spk-grid{stroke:var(--li-border-soft)}#loom-inspector .li-spk-up{stop-color:var(--li-num);stroke:var(--li-num)}#loom-inspector .li-spk-down{stop-color:var(--li-bool);stroke:var(--li-bool)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", v = "loom-inspector";
//#endregion
//#region src/devtools/format.ts
function y(e, t) {
	return e === void 0 ? "—" : e === null ? "null" : typeof e == "number" ? Number.isInteger(e) ? String(e) : e.toFixed(2) : typeof e == "string" ? e.length > t ? `"${e.slice(0, t)}…"` : `"${e}"` : typeof e == "boolean" ? String(e) : Array.isArray(e) ? `[${e.length}]` : typeof e == "object" ? "{…}" : String(e);
}
function oe(e) {
	return typeof e == "number" ? "li-gv-num" : typeof e == "string" ? "li-gv-str" : typeof e == "boolean" ? "li-gv-bool" : e == null ? "li-gv-nul" : "";
}
//#endregion
//#region src/devtools/icons.ts
function se(e, t) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`;
}
var ce = "<polyline points=\"4 14 10 14 10 20\"/><polyline points=\"20 10 14 10 14 4\"/><line x1=\"14\" x2=\"21\" y1=\"10\" y2=\"3\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", le = "<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" x2=\"14\" y1=\"3\" y2=\"10\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", ue = "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>", de = "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", fe = "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>", pe = "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", me = "<circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"currentColor\" stroke=\"none\"/>", he = "<circle cx=\"12\" cy=\"12\" r=\"5\"/>", ge = "<path d=\"M5 19c.264.956.797 2 2.187 2c2.407 0 3.008-2 4.813-9s2.406-9 4.813-9c1.39 0 1.923 1.044 2.187 2M9 10h8\"/>", _e = "<path d=\"m6 9 6 6 6-6\"/>", ve = "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"22\" x2=\"18\" y1=\"12\" y2=\"12\"/><line x1=\"6\" x2=\"2\" y1=\"12\" y2=\"12\"/><line x1=\"12\" x2=\"12\" y1=\"6\" y2=\"2\"/><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"18\"/>", ye = "<path d=\"M3 6h18\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", be = "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/>", xe = "<polygon points=\"6 3 20 12 6 21 6 3\"/>";
function Se(e) {
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.firstElementChild;
	if (!n) throw Error("icon markup produced no element");
	return n;
}
function Ce(e, t) {
	return Se(se(e, t));
}
function we(e) {
	return Se(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var Te = 300, Ee = 22, De = 16, b = null, x = /* @__PURE__ */ new Map(), Oe = 0, S = [], C = [], ke = [], Ae = null, je = -1, Me = 0, Ne = !1, Pe = !1, w = /* @__PURE__ */ new Set(), Fe = -1;
function Ie() {
	return b = p({
		rowHeight: Ee,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: Ye
	}), b.el.classList.add("li-pane", "li-graph"), b.el;
}
function Le(e) {
	return T(e.id).length > 0;
}
function Re(e, t) {
	if (typeof t == "number") {
		let n = Number(e);
		return Number.isNaN(n) ? t : n;
	}
	return e;
}
function ze(e) {
	if (e.kind !== "state" || !e.source) return !1;
	let t = e.value;
	return t === null || typeof t == "number" || typeof t == "string" || typeof t == "boolean";
}
function Be(e, t, n, r = !1) {
	if (je === n) return;
	let i = e.querySelector(".li-gval");
	if (!i) return;
	let a = y(t, De);
	!r && !Ne && e.dataset.prev !== void 0 && e.dataset.prev !== a && Ke(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${oe(t)}`, e.dataset.prev = a;
}
function Ve(e, t, n, r) {
	let i = t();
	if (typeof i == "boolean") {
		t(!i), Be(r, t(), e, !0), He(e, r);
		return;
	}
	if (i !== null && typeof i != "number" && typeof i != "string") return;
	let a = document.createElement("input");
	a.className = "li-gedit", a.value = typeof i == "string" ? i : String(i), Ae = a, je = e, n.replaceWith(a), a.focus(), a.select();
	let o = () => {
		Ae = null, je = -1, a.parentNode && a.replaceWith(n);
	}, s = () => {
		Ae === a && (t(Re(a.value, i)), o(), Be(r, t(), e, !0), He(e, r));
	};
	a.onblur = s, a.onkeydown = (e) => {
		e.key === "Enter" ? s() : e.key === "Escape" && o();
	};
}
function He(e, t) {
	t.matches(":hover") && E(T(e), !0);
}
function T(e) {
	let t = [], n = /* @__PURE__ */ new Set([e]), r = x.get(e), i = r ? [...r.subs] : [];
	for (; i.length > 0;) {
		let e = i.shift();
		if (e === void 0 || n.has(e)) continue;
		n.add(e);
		let r = x.get(e);
		if (r) if (r.kind === "effect") {
			let e = r.target;
			(e instanceof Element || e instanceof CharacterData) && t.push(e);
		} else for (let e of r.subs) i.push(e);
	}
	return t;
}
function Ue(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of x.values()) if (r.group === e) for (let e of T(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function We(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function E(e, t) {
	for (let e of ke) e.remove();
	if (ke = [], t) for (let t of e) {
		let e = We(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), ke.push(n);
	}
}
function Ge(e) {
	let n = performance.now();
	n - Oe >= Te && (x = new Map(t({ active: !0 }).nodes.map((e) => [e.id, e])), Oe = n), E(T(e), !0);
}
function Ke(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function qe(e, t) {
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
function Je(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `fields #${e}`;
}
function Ye(e, t) {
	if (e.kind === "header") return t ? Ze(t, e) : Xe(e);
	let n = t ? $e(t, e) : Qe(e);
	return e.node.id === Fe && (Ke(n), Fe = -1), n;
}
function Xe(e) {
	let t = /* @__PURE__ */ m("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ m("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = Ce(_e, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ m("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(Ce(ve, 11));
	let a = /* @__PURE__ */ h("div", {
		class: "li-gns-h",
		children: [
			r,
			n,
			t,
			i
		]
	}), o = e.gid;
	return w.has(o) && a.classList.add("collapsed"), a.onclick = () => {
		w.has(o) ? w.delete(o) : w.add(o), b?.setItems(nt());
	}, i.onclick = (e) => {
		e.stopPropagation(), qe(Ue(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => E(Ue(o), !0), a.onmouseleave = () => E(Ue(o), !1), a;
}
function Ze(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", w.has(t.gid)), e;
}
function Qe(e) {
	let t = e.node, n = /* @__PURE__ */ m("span", { class: "li-gval" }), r = Le(t), i = Ce(t.kind === "computed" ? ge : r ? me : he, 13);
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
	if (e.child && a.classList.add("li-grow-child"), a.onmouseenter = () => E(T(t.id), !0), a.onmouseleave = () => E(T(t.id), !1), ze(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => Ve(t.id, e, n, a);
	}
	return Be(a, t.value, t.id), a;
}
function $e(e, t) {
	return Be(e, t.node.value, t.node.id), e;
}
function et() {
	let e = C.length;
	for (let t of S) e += 1 + (w.has(t.gid) ? 0 : t.cells.length);
	return e;
}
function tt(e) {
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
function nt() {
	return {
		length: et(),
		at: tt
	};
}
function rt() {
	if (!b) return;
	let e = t({ active: !0 }).nodes;
	x = new Map(e.map((e) => [e.id, e])), Oe = performance.now();
	let n = /* @__PURE__ */ new Map(), r = [];
	for (let t of e) if (!(t.internal || t.kind === "effect")) if (t.group !== void 0) {
		let e = n.get(t.group);
		e ? e.push(t) : n.set(t.group, [t]);
	} else r.push(t);
	S = [];
	for (let [e, t] of n) t.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), S.push({
		gid: e,
		label: Je(e, t),
		cells: t
	});
	C = r, Ne = Pe, b.setItems(nt()), Ne = !1, Pe = !1;
}
function it() {
	E([], !1);
}
function at() {
	let e = performance.now();
	e - Me >= Te && (Me = e, rt());
}
function ot() {
	if (b) {
		for (let e of b.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Pe = !0, b.refresh();
	}
}
function st(e) {
	let t = 0;
	for (let n of S) {
		let r = n.cells.findIndex((t) => t.id === e);
		if (r >= 0) return w.has(n.gid) && (w.delete(n.gid), b?.setItems(nt())), t + 1 + r;
		t += 1 + (w.has(n.gid) ? 0 : n.cells.length);
	}
	let n = C.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function ct(e) {
	if (b === null) return;
	rt();
	let t = st(e);
	t < 0 || (Fe = e, b.scrollToIndex(t));
}
function lt() {
	for (let e of ke) e.remove();
	ke = [], Ae = null, je = -1, b?.destroy(), b = null, S = [], C = [], w.clear(), x = /* @__PURE__ */ new Map(), Oe = 0;
}
//#endregion
//#region src/devtools/scroll-fade.ts
function ut(e, t) {
	let n = 0, r = () => {
		n = 0;
		let r = t === "x" ? e.clientWidth : e.clientHeight, i = t === "x" ? e.scrollWidth : e.scrollHeight, a = t === "x" ? e.scrollLeft : e.scrollTop, o = Math.max(0, i - r) - a;
		e.style.setProperty("--li-fade-a", `${a < 6 ? 0 : Math.min(a, 16)}px`), e.style.setProperty("--li-fade-b", `${o < 6 ? 0 : Math.min(o, 16)}px`);
	}, i = () => {
		n ||= requestAnimationFrame(r);
	};
	e.addEventListener("scroll", i, { passive: !0 });
	let a = typeof ResizeObserver == "function" ? new ResizeObserver(i) : null;
	return a?.observe(e), i(), {
		refresh: i,
		dispose: () => {
			e.removeEventListener("scroll", i), a?.disconnect(), n && cancelAnimationFrame(n);
		}
	};
}
//#endregion
//#region src/devtools/trace.tsx
var dt = 22, ft = 200, pt = 1e3, mt = [
	"writes",
	"reads",
	"all"
];
function ht(e) {
	return mt.includes(e);
}
var D = null, gt = null, _t = null, O = "all", vt = null, k = null, yt = null, A = null, j = null, M = [], N = [], P = !1, F = !1, I = "", bt = 0, xt = -1, L = -1, St = null;
function Ct(e) {
	St = e;
}
function wt(e) {
	j = e, Et();
}
function Tt(e) {
	F !== e && (F = e, e ? (Ot(), Nt()) : kt(), Et());
}
function Et() {
	j && (j.classList.toggle("inactive", !F), j.classList.toggle("off", P), j.title = F ? P ? "Paused" : "Live — capturing" : "Trace");
}
function Dt() {
	At(), D = p({
		rowHeight: dt,
		key: (e) => e.seq,
		render: Vt
	}), A = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), A.append(Ce(be, 12)), d(A, () => It(!P));
	let e = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(Ce(ye, 12)), d(e, () => jt());
	let t = /* @__PURE__ */ m("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: mt.map((e) => /* @__PURE__ */ m("option", {
			value: e,
			children: e
		}))
	});
	t.value = O, t.addEventListener("change", () => {
		ht(t.value) && (O = t.value), At();
	});
	let n = /* @__PURE__ */ m("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		I = n.value.trim().toLowerCase(), N = I ? M.filter((e) => e.name.toLowerCase().includes(I)) : [], R();
	}), k = /* @__PURE__ */ m("div", { class: "li-tr-scroll li-fade-y" }), k.append(D.el), yt = ut(k, "y"), k.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== L && (L = Number(t), Ge(L));
	}), k.addEventListener("pointerleave", () => {
		L = -1, it();
	}), d(k, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (L = -1, it(), St?.(Number(t)));
	}), vt = /* @__PURE__ */ h("div", {
		class: "li-pane li-trace",
		children: [/* @__PURE__ */ h("div", {
			class: "li-tr-bar",
			children: [
				A,
				t,
				n,
				e
			]
		}), k]
	}), vt;
}
function Ot() {
	O !== "reads" && !gt && (gt = u([c.write], "samples")), O !== "writes" && !_t && (_t = u([c.read], "samples"));
}
function kt() {
	gt?.stop(), gt = null, _t?.stop(), _t = null;
}
function At() {
	kt(), F && Ot(), xt = -1, R(), Nt();
}
function jt() {
	M = [], N = [], xt = -1, R();
}
function Mt(e) {
	pt = e, M.length > e && (M.length = e), N.length > e && (N.length = e), R();
}
function Nt() {
	if (P || D === null) return;
	let e = [], t = gt?.read()["loom:write"]?.samples;
	if (t) for (let n of t) e.push({
		s: n,
		kind: "write"
	});
	let n = _t?.read()["loom:read"]?.samples;
	if (n) for (let t of n) e.push({
		s: t,
		kind: "read"
	});
	if (e.length === 0) return;
	O === "all" && e.sort((e, t) => l(e.s).t - l(t.s).t), zt = !1;
	let r = (I ? N : M)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(Lt(t, n));
	if (i.reverse(), M = i.concat(M), I) {
		let e = i.filter((e) => e.name.toLowerCase().includes(I));
		e.length > 0 && (N = e.concat(N));
	}
	M.length > pt && (M.length = pt), N.length > pt && (N.length = pt), xt = ((I ? N : M)[0]?.seq ?? -1) === r ? -1 : r, R();
}
function Pt() {
	Nt(), R(), requestAnimationFrame(() => D?.refresh());
}
function Ft() {
	kt(), D = null, vt = null, k = null, yt?.dispose(), yt = null, A = null, j = null, M = [], N = [], Rt.clear(), zt = !1, xt = -1, P = !1, F = !1, I = "", O = "all", L = -1, St = null;
}
function It(e) {
	P = e, A?.replaceChildren(Ce(e ? xe : be, 12)), Et(), vt?.classList.toggle("li-tr-paused", e), e || Nt();
}
function R() {
	let e = I ? N : M;
	D?.setItems(O === "all" ? e : e.filter((e) => e.kind === (O === "writes" ? "write" : "read"))), yt?.refresh();
}
function Lt(e, t) {
	let n = l(e), r = n.id, i = Bt(r), a = Ut(n.t), o = n.by, s = o === void 0 ? "" : `by ${Bt(o)}`;
	if (t === "read") return {
		seq: bt++,
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
	let c = l(e), u = y(c.prev, ft), ee = y(c.next, ft);
	return {
		seq: bt++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: u,
		prevCls: oe(c.prev),
		nextText: ee,
		nextCls: oe(c.next),
		srcText: s,
		full: `${i}: ${u} → ${ee} ${s || "(external)"}`
	};
}
var Rt = /* @__PURE__ */ new Map(), zt = !1;
function Bt(e) {
	let n = Rt.get(e);
	if (n !== void 0) return n;
	if (!zt) {
		zt = !0;
		for (let e of t().nodes) Rt.set(e.id, e.label);
		let n = Rt.get(e);
		if (n !== void 0) return n;
	}
	return `#${e}`;
}
function Vt(e, t) {
	let n = t ?? Ht(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3], a = i.children[0], o = i.children[1], s = i.children[2], c = i.children[3];
	return e.kind === "read" ? (a.textContent = "", a.className = "li-tr-val", o.textContent = "", s.textContent = "", s.className = "li-tr-val") : (a.textContent = e.prevText, a.className = `li-tr-val ${e.prevCls}`, o.textContent = " → ", s.textContent = e.nextText, s.className = `li-tr-val ${e.nextCls}`), c.textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === xt), n;
}
function Ht() {
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
function Ut(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
//#endregion
//#region src/devtools/stats.tsx
var Wt = 138, Gt = 34, Kt = 2 * Math.PI * Gt, qt = Kt * .75, Jt = 48, z = 58, Yt = 11, Xt = Yt * 2, Zt = Xt / 2, Qt = 1, $t = z / (Jt - 1), en = 9, tn = 10, nn = Math.log1p(900 / tn), rn = (e) => Math.min(1, Math.log1p(e / tn) / nn), an = [
	[0, 0],
	[.4, .03],
	[.7, .11],
	[.88, .22],
	[1, .34]
], on = 120, sn = on / 1e3, cn = 200, ln = () => void 0, un = () => !1, B = null, dn = null, fn = null, pn = null, mn = 0, hn = null, gn = null, _n = 0, vn = 0, yn = 0, bn = 0, xn = 0, Sn = 0, Cn = 0, wn = 0, Tn = 0, V = 0, H = !1, En = 0, Dn = 0, On = 0, kn = 0, An = [], jn = 0, Mn = 0, Nn = 0, Pn = !1, Fn = null, In = null, Ln = null, Rn = null, zn = null, Bn = 100, Vn = "", Hn = "", Un = !1, Wn = "", Gn = 0, Kn = 0, qn = 0, Jn = 0, Yn = 0, Xn = 0, Zn = 0, Qn = 0, $n = [], er = [];
function U(e, t, n) {
	te(e, t, n, g);
}
function W(e) {
	return e?.() ?? 0;
}
function G(e) {
	return () => (B?.(), e());
}
var K = (e, t) => e * .6 + t / sn * .4;
function q(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function tr(e) {
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
function nr(e) {
	let t = 1e3 / e;
	return t >= 55 ? "h-ok" : t >= 30 ? "h-warn" : "h-bad";
}
function rr(e, t, n) {
	return e ? e <= t ? "h-ok" : e <= n ? "h-warn" : "h-bad" : "";
}
function ir(e) {
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
var ar = ir((e) => {
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
}), or = ir((e) => {
	let t = new PerformanceObserver((t) => {
		for (let n of t.getEntries()) n.entryType === "largest-contentful-paint" && e(n.startTime);
	});
	return t.observe({
		type: "largest-contentful-paint",
		buffered: !0
	}), t;
}), sr = ir((e) => {
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
}), cr = typeof PerformanceObserver == "function" && PerformanceObserver.supportedEntryTypes?.includes("longtask") === !0, lr = ir((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let e of n.getEntries()) t += e.duration;
		e(t);
	});
	return n.observe({
		type: "longtask",
		buffered: !0
	}), n;
});
function ur() {
	return [/* @__PURE__ */ m("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: Gt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${Kt}`
	}), /* @__PURE__ */ m("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function dr() {
	let e = /* @__PURE__ */ m("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: Gt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	U(e, "stroke-dasharray", G(() => `${qt * Bn / 100} ${Kt}`)), U(e, "class", G(() => `li-garc h-${Vn}`));
	let t = /* @__PURE__ */ m("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(f(G(() => String(Bn)), g)), U(t, "class", G(() => `li-gnum h-${Vn}`)), [e, t];
}
function fr() {
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
				r: Gt,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${qt} ${Kt}`
			}),
			ne(G(() => Un), dr, ur),
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
function pr() {
	let e = [];
	for (let t = 0; t < Wt; t++) e.push(/* @__PURE__ */ m("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	let t = Array(Wt).fill(-1);
	return re(() => {
		B?.();
		let n = e.length - An.length;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (!i) continue;
			let a = r >= n ? An[r - n] ?? 0 : 0;
			if (a === t[r]) continue;
			t[r] = a;
			let o = Math.max(0, Math.min(20, a / 50 * 20));
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? nr(a) : "");
		}
	}), /* @__PURE__ */ m("div", {
		class: "li-histo",
		title: Y.frames,
		children: /* @__PURE__ */ m("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Wt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
}
function mr(e, t, n = !1) {
	let r = e.length > 1 ? z / (e.length - 1) : 0, i = Yt - 2 - Qt, a = e.map((e, n) => `${(n * r).toFixed(1)},${(Zt + t * (Qt + e * i)).toFixed(1)}`).join(" ");
	if (!n || a === "") return a;
	let o = Zt.toFixed(1);
	return `0,${o} ${a} ${(e.length > 1 ? z : 0).toFixed(1)},${o}`;
}
function hr(e) {
	let t = e * $t % en, n = "";
	for (let e = z - t; e > -.5; e -= en) n += `M${e.toFixed(1)} 0V${Xt} `;
	return n.trimEnd();
}
function gr() {
	let e = (e, t, n = !1) => /* @__PURE__ */ m("linearGradient", {
		id: e,
		x1: 0,
		y1: +!!n,
		x2: 0,
		y2: +!n,
		children: an.map(([e, n]) => /* @__PURE__ */ m("stop", {
			offset: e,
			class: t,
			"stop-opacity": n
		}))
	}), t = (e, t, n, r) => {
		let i = /* @__PURE__ */ m("polygon", {
			stroke: "none",
			fill: `url(#${r})`
		}), a = /* @__PURE__ */ m("polyline", {
			class: n,
			fill: "none",
			"stroke-width": 1,
			"stroke-linejoin": "round",
			"stroke-linecap": "round"
		});
		return U(i, "points", G(() => mr(e, t, !0))), U(a, "points", G(() => mr(e, t))), [i, a];
	}, n = /* @__PURE__ */ m("path", {
		class: "li-spk-grid",
		fill: "none",
		"stroke-width": 1
	});
	return U(n, "d", G(() => hr(mn))), /* @__PURE__ */ m("span", {
		class: "li-spark",
		title: "rendering pipeline — writes in (green ↑) vs DOM updates out (red ↓)",
		children: /* @__PURE__ */ h("svg", {
			width: z,
			height: Xt,
			viewBox: `0 0 ${z} ${Xt}`,
			role: "img",
			"aria-label": "Rendering pipeline utilization",
			children: [
				/* @__PURE__ */ h("defs", { children: [e(`${v}-spk-up`, "li-spk-up"), e(`${v}-spk-down`, "li-spk-down", !0)] }),
				n,
				t($n, -1, "li-spk-up", `${v}-spk-up`),
				t(er, 1, "li-spk-down", `${v}-spk-down`)
			]
		})
	});
}
function J(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ m("span", { class: `li-stat-v ${n}` });
	return i.append(f(G(t), g)), /* @__PURE__ */ h("div", {
		class: "li-stat",
		children: [/* @__PURE__ */ m("span", {
			class: "li-stat-k",
			title: r,
			children: e
		}), i]
	});
}
var Y = {
	fps: "Frames per second, averaged over ~0.5s windows.",
	health: "Overall health (0–100) derived from FPS against a 55fps target.",
	frames: "Recent per-frame render times; taller/red bars are slower frames.",
	lag: "Main-thread lag: how late a fixed 200ms timer fires (now · peak). High = jank.",
	heap: "JS heap used (Chrome only), re-sampled every 5s via polled().",
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
	sources: "Live lazy sources (source/polled) — external producers wired into the graph.",
	scopes: "Live scopes grouping effects and resources.",
	channels: "Registered channels — gated ring-buffer event streams for any use (7 built-in reactive ones + any the app declares).",
	unread: "States/computeds nothing currently reads (no subscribers). Some are normal; a count that keeps climbing under steady state suggests leaked cells."
};
function _r() {
	let e = /* @__PURE__ */ m("span", { class: "li-perfh-fps" });
	e.append(f(G(() => H ? `${Math.round(V)} fps` : "— fps"), g)), U(e, "class", G(() => `li-perfh-fps ${Wn}`));
	let t = /* @__PURE__ */ m("div", {
		class: "li-hlabel",
		title: Y.health
	});
	t.append(f(G(() => H ? Hn.toUpperCase() : "LOADING"), g)), U(t, "class", G(() => Un ? `li-hlabel h-${Vn}` : "li-hlabel"));
	let n = /* @__PURE__ */ h("div", {
		class: "li-hstats",
		children: [t, J("lag", () => `${jn.toFixed(0)} · pk ${Mn.toFixed(0)} ms`, "lo", Y.lag)]
	});
	return n.append(vr("blocked", () => {
		if (!cr) return "—";
		let e = W(Rn);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!cr) return "";
		let e = W(Rn);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, Y.blocked)), n.append(vr("CLS", () => W(Fn).toFixed(2), () => {
		let e = W(Fn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, Y.cls)), n.append(vr("LCP", () => {
		let e = W(In);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => rr(W(In), 2500, 4e3), Y.lcp)), n.append(vr("INP", () => {
		let e = W(Ln);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => rr(W(Ln), 200, 500), Y.inp)), /* @__PURE__ */ h("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ h("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ m("span", {
					title: Y.fps,
					children: "Performance"
				}), e]
			}),
			pr(),
			/* @__PURE__ */ h("div", {
				class: "li-hblock",
				children: [fr(), n]
			}),
			J("frame time", () => `${kn.toFixed(1)} ms`, "", Y.frameTime),
			yr() ? br() : null,
			J("writes / s", () => q(vn), "hi", Y.writes),
			J("reads / s", () => q(_n), "hi", Y.reads),
			J("computeds / s", () => q(yn), "", Y.computedsRate),
			J("effect runs / s", () => q(bn), "lo", Y.effectRuns),
			J("flushes / s", () => q(xn), "lo", Y.flushes),
			J("effects / flush", () => String(wn), "", Y.effectsPerFlush),
			J("flush time", () => `${Tn.toFixed(1)} ms`, "", Y.flushTime),
			J("creates / s", () => q(Sn), "lo", Y.creates),
			J("disposes / s", () => q(Cn), "lo", Y.disposes),
			J("states", () => String(Gn), "", Y.states),
			J("computeds", () => String(Kn), "", Y.computeds),
			vr("unread", () => String(Qn), () => Qn > 0 ? "h-warn" : "", Y.unread),
			J("effects", () => String(qn), "", Y.effects),
			J("views", () => String(Jn), "", Y.views),
			J("sources", () => String(Yn), "", Y.sources),
			J("scopes", () => String(Xn), "", Y.scopes),
			J("channels", () => String(Zn), "", Y.channels)
		]
	});
}
function vr(e, t, n, r = "") {
	let i = J(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && U(a, "class", G(() => `li-stat-v ${n()}`)), i;
}
function yr() {
	return performance.memory;
}
function br() {
	return J("heap", () => {
		let e = zn?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", Y.heap);
}
function xr() {
	let e = hn?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, s = gn?.read()?.["loom:flush"];
	_n = K(_n, t), vn = K(vn, n), bn = K(bn, r), yn = K(yn, i), Sn = K(Sn, a), Cn = K(Cn, o), xn = K(xn, s?.count ?? 0);
	let c = l(s?.samples.at(-1));
	if (c !== void 0 && (wn = c.batchSize, Tn = c.durationMs), $n.push(rn(n)), er.push(rn(r)), $n.length > Jt && $n.shift(), er.length > Jt && er.shift(), !H) Un = !1, Wn = "";
	else {
		let e = tr(V);
		Bn = e.score, Vn = e.key, Hn = e.label, Un = !0, Wn = V >= 55 ? "h-ok" : V >= 30 ? "h-warn" : "h-bad";
	}
	return ++mn;
}
function Sr() {
	let e = !un();
	if (ln() === "stats" && e) {
		let e = o();
		Gn = e.states, Kn = e.computeds, qn = e.effects, Jn = e.views, Yn = e.sources, Xn = e.scopes, Zn = e.channels, Qn = e.unread;
	} else ln() === "graph" && e ? at() : ln() === "trace" && e && Nt();
}
function Cr() {
	document.hidden && (Pn = !0);
}
function wr() {
	Nn = performance.now() + cn, dn = setInterval(() => {
		let e = performance.now(), t = Nn;
		if (Nn = e + cn, document.hidden) {
			Pn = !0;
			return;
		}
		if (Pn) {
			Pn = !1;
			return;
		}
		jn = Math.max(0, e - t), jn > Mn && (Mn = jn);
	}, cn), document.addEventListener("visibilitychange", Cr), On = 0;
	let e = (t) => {
		if (fn = requestAnimationFrame(e), On) {
			let e = Math.min(t - On, 1e3);
			if (kn = e, An.push(e), An.length > Wt && An.shift(), En += e, Dn++, En >= 500) {
				let e = Dn * 1e3 / En;
				V = H ? V * .5 + e * .5 : e, H = !0, En = 0, Dn = 0;
			}
		}
		On = t;
	};
	fn = requestAnimationFrame(e);
}
function Tr(e) {
	ln = e.activeTab, un = e.isMinimized, hn = u([
		c.read,
		c.write,
		c.compute,
		c.effect,
		c.create,
		c.dispose
	]), gn = u([c.flush], "samples"), B = n(xr, on, g), re(() => {
		B?.(), ee(Sr);
	}, {
		defer: !0,
		maxStale: on
	});
	let t;
	pn = s(() => {
		Fn = i(ar, 0, g), In = i(or, 0, g), Ln = i(sr, 0, g), Rn = i(lr, 0, g), yr() && (zn = n(() => yr()?.usedJSHeapSize ?? 0, 5e3, g)), t = _r();
	}, g);
	let r = gr();
	return wr(), {
		statsPane: t,
		sparkEl: r
	};
}
function Er() {
	pn?.pause();
}
function Dr() {
	pn?.resume();
}
function Or() {
	hn?.stop(), hn = null, gn?.stop(), gn = null, B?.stop(), B = null, dn != null && clearInterval(dn), dn = null, document.removeEventListener("visibilitychange", Cr), fn != null && cancelAnimationFrame(fn), fn = null, pn?.stop(), pn = null, zn = Fn = In = Ln = Rn = null, mn = 0, _n = vn = yn = bn = xn = 0, Sn = Cn = 0, wn = Tn = 0, V = 0, H = !1, En = Dn = On = kn = 0, An.length = 0, jn = Mn = 0, Pn = !1, Un = !1, Bn = 100, Vn = Hn = Wn = "", Gn = Kn = qn = Jn = 0, Yn = Xn = Zn = Qn = 0, $n.length = 0, er.length = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var kr = {
	system: fe,
	light: ue,
	dark: de
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
], X = null, jr = null, Z = null, Mr = null, Nr = [], Pr = null, Q = null, Fr = /* @__PURE__ */ new Map(), Ir = null;
function Lr(e) {
	try {
		return localStorage.getItem(e);
	} catch {
		return null;
	}
}
function Rr(e, t) {
	try {
		localStorage.setItem(e, t);
	} catch {}
}
var zr = `${v}-theme`, Br = `${v}-min`, Vr = `${v}-pos`, Hr = `${v}-size`, Ur = `${v}-logsize`, Wr = [
	1e3,
	5e3,
	25e3
];
function Gr() {
	let e = Lr(zr);
	return e === "light" || e === "dark" || e === "system" ? e : "system";
}
function Kr() {
	let e = Number(Lr(Ur));
	return Wr.includes(e) ? e : 1e3;
}
function qr(e, t) {
	let n = Lr(e);
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
var Jr = qr(Vr, ["left", "top"]), Yr = qr(Hr, ["width", "height"]);
function $(e) {
	let t = window.devicePixelRatio || 1;
	return Math.round(e * t) / t;
}
function Xr(e, t, n, r) {
	let i = e.offsetWidth, a = Math.min(80, i);
	return {
		left: $(Math.min(window.innerWidth - a, Math.max(a - i, n))),
		top: $(Math.min(window.innerHeight - t, Math.max(0, r)))
	};
}
function Zr(e, t, n) {
	let r = Math.max(0, window.innerWidth - e.offsetWidth), i = Math.max(0, window.innerHeight - e.offsetHeight);
	return {
		left: $(Math.max(0, Math.min(t, r))),
		top: $(Math.max(0, Math.min(n, i)))
	};
}
function Qr(e, t, n) {
	return e.addEventListener("pointermove", t), e.addEventListener("pointerup", n), e.addEventListener("pointercancel", n), () => {
		e.removeEventListener("pointermove", t), e.removeEventListener("pointerup", n), e.removeEventListener("pointercancel", n);
	};
}
function $r(e, t, n, r, i) {
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto", e.setPointerCapture?.(n.pointerId);
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s = () => {};
	s = Qr(e, (e) => r(e, a), () => {
		e.releasePointerCapture?.(n.pointerId), document.body.style.userSelect = o, i(), s();
	});
}
function ei(e, t) {
	e.addEventListener("pointerdown", (n) => {
		if (n.target?.closest("button")) return;
		n.preventDefault();
		let r = n.clientX, i = n.clientY;
		e.style.cursor = "grabbing", $r(e, t, n, (n, a) => {
			let { left: o, top: s } = Xr(t, e.offsetHeight || 40, a.left + n.clientX - r, a.top + n.clientY - i);
			t.style.left = `${o}px`, t.style.top = `${s}px`, Jr = {
				left: o,
				top: s
			};
		}, () => {
			e.style.cursor = "", Jr && Rr(Vr, JSON.stringify(Jr));
		});
	});
}
function ti(e, t) {
	e.addEventListener("pointerdown", (n) => {
		n.preventDefault(), n.stopPropagation();
		let r = n.clientX, i = n.clientY;
		$r(e, t, n, (e, n) => {
			let a = $(Math.max(240, Math.min(window.innerWidth - n.left - 8, n.width + e.clientX - r))), o = $(Math.max(160, Math.min(window.innerHeight - n.top - 8, n.height + e.clientY - i)));
			t.style.width = `${a}px`, t.style.height = `${o}px`, Yr = {
				width: a,
				height: o
			};
		}, () => {
			Yr && Rr(Hr, JSON.stringify(Yr));
		});
	});
}
function ni(e) {
	return Se(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function ri(e = document.body) {
	if (X || typeof document > "u") return;
	if (a({ inspect: !0 }), !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${v}-css`, e.textContent = ae, document.head.append(e);
	}
	Q = r("stats", g);
	let t = Gr(), n = /* @__PURE__ */ m("span", { class: "li-menu-val" }), i = () => {
		X?.setAttribute("data-theme", t), jr?.setAttribute("data-theme", t), n.innerHTML = se(kr[t], 13), o.title = `Theme: ${t} (click to cycle)`;
	}, o = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ m("span", { children: "Theme" }), n]
	});
	d(o, () => {
		let e = [
			"system",
			"light",
			"dark"
		];
		t = e[(e.indexOf(t) + 1) % e.length] ?? "system", Rr(zr, t), i();
	});
	let c = /* @__PURE__ */ m("div", {
		class: "li-menu",
		hidden: !0
	});
	c.id = `${v}-menu`, c.append(o), jr = c;
	let l = Kr(), u = /* @__PURE__ */ m("span", { class: "li-menu-val" }), ee = () => {
		u.textContent = `${l / 1e3}k`, Mt(l);
	}, te = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ m("span", { children: "Log size" }), u]
	});
	d(te, () => {
		l = Wr[(Wr.indexOf(l) + 1) % Wr.length] ?? 1e3, Rr(Ur, String(l)), ee();
	}), c.append(te), ee();
	let f = () => {
		c.hidden = !0;
	}, ne = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ m("span", { children: "Hide" }), /* @__PURE__ */ m("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	d(ne, () => {
		f(), ii();
	}), c.append(ne);
	let p = /* @__PURE__ */ m("button", {
		type: "button",
		title: "Settings"
	});
	p.append(ni(pe)), d(p, (e) => {
		if (e.stopPropagation(), !c.hidden) {
			f();
			return;
		}
		c.hidden = !1;
		let t = p.getBoundingClientRect(), n = c.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), c.style.left = `${Math.max(8, r)}px`, c.style.top = `${Math.max(8, i)}px`;
	});
	let _ = /* @__PURE__ */ m("button", { type: "button" }), ie = (e) => {
		_.title = e ? "Expand" : "Collapse", _.replaceChildren(ni(e ? le : ce));
	}, y = Lr(Br) === "1";
	ie(y), d(_, () => {
		let e = !!X?.classList.toggle("li-min");
		ie(e), Rr(Br, e ? "1" : "0"), e ? Pr?.pause() : Pr?.resume(), Tt(!e && Q?.() === "trace");
	});
	let oe = /* @__PURE__ */ h("div", {
		class: "li-bar",
		children: [
			/* @__PURE__ */ h("span", {
				class: "li-brand",
				children: [we(15), /* @__PURE__ */ m("b", { children: "Loom" })]
			}),
			/* @__PURE__ */ m("span", { class: "li-sp" }),
			p,
			_
		]
	}), ue, de;
	Pr = s(() => {
		let e = Tr({
			activeTab: () => Q?.(),
			isMinimized: () => X?.classList.contains("li-min") ?? !1
		});
		ue = e.statsPane, de = e.sparkEl;
	}, g), y && Pr.pause();
	let fe = /* @__PURE__ */ new Map(), me = /* @__PURE__ */ new Map();
	Z = /* @__PURE__ */ m("div", { class: "li-body li-fade-y" });
	for (let e of Ar) {
		let t = e.id === "stats" ? ue : e.id === "graph" ? Ie() : Dt();
		fe.set(e.id, t), Z.append(t);
	}
	Ct((e) => {
		Q?.("graph"), ct(e);
	});
	let he = /* @__PURE__ */ m("div", { class: "li-tabscroll" });
	for (let e of Ar) {
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
			t.append(e), wt(e);
		}
		d(t, () => Q?.(e.id)), me.set(e.id, t), he.append(t);
	}
	let ge = /* @__PURE__ */ h("div", {
		class: "li-tabs",
		children: [he, de]
	}), _e = /* @__PURE__ */ m("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ m("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ m("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	if (X = /* @__PURE__ */ h("div", { children: [
		oe,
		ge,
		Z,
		_e
	] }), X.id = v, y && X.classList.add("li-min"), i(), ei(oe, X), ti(_e, X), Mr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!c.hidden && (t === null || !c.contains(t)) && e.target !== p && f();
	}, document.addEventListener("pointerdown", Mr), e.append(X), document.body.append(c), Yr && (X.style.width = `${Math.max(240, Math.min(Yr.width, window.innerWidth - 16))}px`, X.style.height = `${Math.max(160, Math.min(Yr.height, window.innerHeight - 16))}px`), Jr) {
		let { left: e, top: t } = Zr(X, Jr.left, Jr.top);
		X.style.left = `${e}px`, X.style.top = `${t}px`, X.style.right = "auto", X.style.bottom = "auto";
	}
	re(() => {
		let e = Q?.();
		Ir && Ir !== e && Z && Fr.set(Ir, Z.scrollTop), e === "stats" ? Dr() : Er(), e !== "graph" && it();
		for (let t of Ar) {
			let n = t.id === e, r = fe.get(t.id), i = me.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && Z) {
			let t = Fr.get(e) ?? 0, n = Math.max(0, Z.scrollHeight - Z.clientHeight);
			Z.scrollTop = Math.min(t, n), e === "graph" ? ot() : e === "trace" && Pt();
		}
		Tt(e === "trace" && X?.classList.contains("li-min") !== !0), Ir = e ?? null;
		for (let e of Nr) e.refresh();
	}), Nr.push(ut(Z, "y"), ut(he, "x"));
}
function ii() {
	Or();
	for (let e of Nr) e.dispose();
	Nr.length = 0, ie(), Pr?.stop(), Pr = null, Mr && document.removeEventListener("pointerdown", Mr), Mr = null, jr?.remove(), jr = null, X?.remove(), X = null, Z = null, Q = null, Fr.clear(), Ir = null, lt(), Ft();
}
function ai() {
	return X !== null;
}
function oi(e = document.body) {
	X ? ii() : ri(e);
}
//#endregion
export { ai as inspectorMounted, ri as mountInspector, oi as toggleInspector, ii as unmountInspector };
