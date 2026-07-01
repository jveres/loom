import { _ as e, a as t, c as n, f as r, h as i, i as a, l as o, m as s, o as c, p as l, u } from "./loom-4S2e7SFf.js";
import { tap as d, text as f, when as ee } from "./dom.js";
import { virtualList as te } from "./dom/virtual-list.js";
import { jsx as p, jsxs as m } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var h = { internal: !0 }, ne = [];
function re(e, n) {
	ne.push(t(e, n ? {
		...h,
		...n
	} : h));
}
function g() {
	for (let e of ne) e();
	ne.length = 0;
}
//#endregion
//#region src/devtools/inspector.css?inline
var ie = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-fade-y{--li-fade-a:0px;--li-fade-b:0px;-webkit-mask-image:linear-gradient(to bottom, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat;-webkit-mask-image:linear-gradient(to bottom, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);mask-image:linear-gradient(to bottom, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;--li-fade-a:0px;--li-fade-b:0px;min-width:0;-webkit-mask-image:linear-gradient(to right, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);-webkit-mask-size:100% 100%;-webkit-mask-repeat:no-repeat;-webkit-mask-image:linear-gradient(to right, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);mask-image:linear-gradient(to right, transparent 0, #000 var(--li-fade-a), #000 calc(100% - var(--li-fade-b)), transparent 100%);flex:auto;align-items:flex-end;gap:1px;margin-top:6px;display:flex;overflow-x:auto;-webkit-mask-size:100% 100%;mask-size:100% 100%;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector .li-spark{opacity:.82;flex:none;align-self:center;align-items:center;gap:5px;padding-top:2px;display:flex}#loom-inspector .li-spark svg{background:var(--li-hover);border-radius:4px;margin:0}#loom-inspector .li-spk-grid{stroke:var(--li-border-soft)}#loom-inspector .li-spk-up{stop-color:var(--li-num);stroke:var(--li-num)}#loom-inspector .li-spk-down{stop-color:var(--li-bool);stroke:var(--li-bool)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", _ = "loom-inspector";
//#endregion
//#region src/devtools/format.ts
function v(e, t) {
	return e === void 0 ? "—" : e === null ? "null" : typeof e == "number" ? Number.isInteger(e) ? String(e) : e.toFixed(2) : typeof e == "string" ? e.length > t ? `"${e.slice(0, t)}…"` : `"${e}"` : typeof e == "boolean" ? String(e) : Array.isArray(e) ? `[${e.length}]` : typeof e == "object" ? "{…}" : String(e);
}
function ae(e) {
	return typeof e == "number" ? "li-gv-num" : typeof e == "string" ? "li-gv-str" : typeof e == "boolean" ? "li-gv-bool" : e == null ? "li-gv-nul" : "";
}
//#endregion
//#region src/devtools/icons.ts
function oe(e, t) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`;
}
var se = "<polyline points=\"4 14 10 14 10 20\"/><polyline points=\"20 10 14 10 14 4\"/><line x1=\"14\" x2=\"21\" y1=\"10\" y2=\"3\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", ce = "<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" x2=\"14\" y1=\"3\" y2=\"10\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", le = "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>", ue = "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", de = "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>", fe = "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", pe = "<circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"currentColor\" stroke=\"none\"/>", me = "<circle cx=\"12\" cy=\"12\" r=\"5\"/>", he = "<path d=\"M5 19c.264.956.797 2 2.187 2c2.407 0 3.008-2 4.813-9s2.406-9 4.813-9c1.39 0 1.923 1.044 2.187 2M9 10h8\"/>", ge = "<path d=\"m6 9 6 6 6-6\"/>", _e = "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"22\" x2=\"18\" y1=\"12\" y2=\"12\"/><line x1=\"6\" x2=\"2\" y1=\"12\" y2=\"12\"/><line x1=\"12\" x2=\"12\" y1=\"6\" y2=\"2\"/><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"18\"/>", ve = "<path d=\"M3 6h18\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", ye = "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/>", be = "<polygon points=\"6 3 20 12 6 21 6 3\"/>";
function xe(e) {
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.firstElementChild;
	if (!n) throw Error("icon markup produced no element");
	return n;
}
function y(e, t) {
	return xe(oe(e, t));
}
function Se(e) {
	return xe(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var Ce = 300, we = 22, Te = 16, b = null, x = /* @__PURE__ */ new Map(), S = [], C = [], Ee = [], De = null, Oe = -1, ke = 0, Ae = !1, je = !1, w = /* @__PURE__ */ new Set(), Me = -1;
function Ne() {
	return b = te({
		rowHeight: we,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: Ke
	}), b.el.classList.add("li-pane", "li-graph"), b.el;
}
function Pe(e) {
	return T(e.id).length > 0;
}
function Fe(e, t) {
	if (typeof t == "number") {
		let n = Number(e);
		return Number.isNaN(n) ? t : n;
	}
	return e;
}
function Ie(e) {
	if (e.kind !== "state" || !e.source) return !1;
	let t = e.value;
	return t === null || typeof t == "number" || typeof t == "string" || typeof t == "boolean";
}
function Le(e, t, n, r = !1) {
	if (Oe === n) return;
	let i = e.querySelector(".li-gval");
	if (!i) return;
	let a = v(t, Te);
	!r && !Ae && e.dataset.prev !== void 0 && e.dataset.prev !== a && Ue(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${ae(t)}`, e.dataset.prev = a;
}
function Re(e, t, n, r) {
	let i = t();
	if (typeof i == "boolean") {
		t(!i), Le(r, t(), e, !0), ze(e, r);
		return;
	}
	if (i !== null && typeof i != "number" && typeof i != "string") return;
	let a = document.createElement("input");
	a.className = "li-gedit", a.value = typeof i == "string" ? i : String(i), De = a, Oe = e, n.replaceWith(a), a.focus(), a.select();
	let o = () => {
		De = null, Oe = -1, a.parentNode && a.replaceWith(n);
	}, s = () => {
		De === a && (t(Fe(a.value, i)), o(), Le(r, t(), e, !0), ze(e, r));
	};
	a.onblur = s, a.onkeydown = (e) => {
		e.key === "Enter" ? s() : e.key === "Escape" && o();
	};
}
function ze(e, t) {
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
function Be(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of x.values()) if (r.group === e) for (let e of T(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function Ve(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function E(e, t) {
	for (let e of Ee) e.remove();
	if (Ee = [], t) for (let t of e) {
		let e = Ve(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), Ee.push(n);
	}
}
function He(e) {
	x = new Map(n({ active: !0 }).nodes.map((e) => [e.id, e])), E(T(e), !0);
}
function Ue(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function We(e, t) {
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
function Ge(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `fields #${e}`;
}
function Ke(e, t) {
	if (e.kind === "header") return t ? Je(t, e) : qe(e);
	let n = t ? Xe(t, e) : Ye(e);
	return e.node.id === Me && (Ue(n), Me = -1), n;
}
function qe(e) {
	let t = /* @__PURE__ */ p("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ p("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = y(ge, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ p("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(y(_e, 11));
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
		w.has(o) ? w.delete(o) : w.add(o), b?.setItems($e());
	}, i.onclick = (e) => {
		e.stopPropagation(), We(Be(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => E(Be(o), !0), a.onmouseleave = () => E(Be(o), !1), a;
}
function Je(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", w.has(t.gid)), e;
}
function Ye(e) {
	let t = e.node, n = /* @__PURE__ */ p("span", { class: "li-gval" }), r = Pe(t), i = y(t.kind === "computed" ? he : r ? pe : me, 13);
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
	if (e.child && a.classList.add("li-grow-child"), a.onmouseenter = () => E(T(t.id), !0), a.onmouseleave = () => E(T(t.id), !1), Ie(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => Re(t.id, e, n, a);
	}
	return Le(a, t.value, t.id), a;
}
function Xe(e, t) {
	return Le(e, t.node.value, t.node.id), e;
}
function Ze() {
	let e = C.length;
	for (let t of S) e += 1 + (w.has(t.gid) ? 0 : t.cells.length);
	return e;
}
function Qe(e) {
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
function $e() {
	return {
		length: Ze(),
		at: Qe
	};
}
function et() {
	if (!b) return;
	let e = n({ active: !0 }).nodes;
	x = new Map(e.map((e) => [e.id, e]));
	let t = /* @__PURE__ */ new Map(), r = [];
	for (let n of e) if (!(n.internal || n.kind === "effect")) if (n.group !== void 0) {
		let e = t.get(n.group);
		e ? e.push(n) : t.set(n.group, [n]);
	} else r.push(n);
	S = [];
	for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), S.push({
		gid: e,
		label: Ge(e, n),
		cells: n
	});
	C = r, Ae = je, b.setItems($e()), Ae = !1, je = !1;
}
function tt() {
	E([], !1);
}
function nt() {
	let e = performance.now();
	e - ke >= Ce && (ke = e, et());
}
function rt() {
	if (b) {
		for (let e of b.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		je = !0, b.refresh();
	}
}
function it(e) {
	let t = 0;
	for (let n of S) {
		let r = n.cells.findIndex((t) => t.id === e);
		if (r >= 0) return w.has(n.gid) && (w.delete(n.gid), b?.setItems($e())), t + 1 + r;
		t += 1 + (w.has(n.gid) ? 0 : n.cells.length);
	}
	let n = C.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function at(e) {
	if (b === null) return;
	et();
	let t = it(e);
	t < 0 || (Me = e, b.scrollToIndex(t));
}
function ot() {
	for (let e of Ee) e.remove();
	Ee = [], De = null, Oe = -1, b?.destroy(), b = null, S = [], C = [], w.clear(), x = /* @__PURE__ */ new Map();
}
//#endregion
//#region src/devtools/scroll-fade.ts
function st(e, t) {
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
var ct = 22, lt = 200, ut = 1e3, D = null, dt = null, ft = null, O = "all", pt = null, k = null, mt = null, A = null, ht = null, j = [], M = [], N = !1, P = !1, F = "", gt = 0, _t = -1, I = -1, vt = null;
function yt(e) {
	vt = e;
}
function bt(e) {
	ht = e, St();
}
function xt(e) {
	P !== e && (P = e, e ? (wt(), kt()) : Tt(), St());
}
function St() {
	ht && (ht.classList.toggle("inactive", !P), ht.classList.toggle("off", N), ht.title = P ? N ? "Paused" : "Live — capturing" : "Trace");
}
function Ct() {
	Et(), D = te({
		rowHeight: ct,
		key: (e) => e.seq,
		render: Ft
	}), A = /* @__PURE__ */ p("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), A.append(y(ye, 12)), d(A, () => Mt(!N));
	let e = /* @__PURE__ */ p("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(y(ve, 12)), d(e, () => Dt());
	let t = /* @__PURE__ */ m("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: [
			/* @__PURE__ */ p("option", {
				value: "writes",
				children: "writes"
			}),
			/* @__PURE__ */ p("option", {
				value: "reads",
				children: "reads"
			}),
			/* @__PURE__ */ p("option", {
				value: "all",
				children: "all"
			})
		]
	});
	t.value = O, t.addEventListener("change", () => {
		O = t.value, Et();
	});
	let n = /* @__PURE__ */ p("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		F = n.value.trim().toLowerCase(), M = F ? j.filter((e) => e.name.toLowerCase().includes(F)) : [], L();
	}), k = /* @__PURE__ */ p("div", { class: "li-tr-scroll li-fade-y" }), k.append(D.el), mt = st(k, "y"), k.addEventListener("pointerover", (e) => {
		let t = (e.target.closest?.(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== I && (I = Number(t), He(I));
	}), k.addEventListener("pointerleave", () => {
		I = -1, tt();
	}), d(k, (e) => {
		let t = ((e.target.closest?.(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (I = -1, tt(), vt?.(Number(t)));
	}), pt = /* @__PURE__ */ m("div", {
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
	}), pt;
}
function wt() {
	O !== "reads" && !dt && (dt = u([c.write], "samples")), O !== "writes" && !ft && (ft = u([c.read], "samples"));
}
function Tt() {
	dt?.stop(), dt = null, ft?.stop(), ft = null;
}
function Et() {
	Tt(), P && wt(), _t = -1, L(), kt();
}
function Dt() {
	j = [], M = [], _t = -1, L();
}
function Ot(e) {
	ut = e, j.length > e && (j.length = e), M.length > e && (M.length = e), L();
}
function kt() {
	if (N || D === null) return;
	let e = [], t = dt?.read()["loom:write"]?.samples;
	if (t) for (let n of t) e.push({
		s: n,
		kind: "write"
	});
	let n = ft?.read()["loom:read"]?.samples;
	if (n) for (let t of n) e.push({
		s: t,
		kind: "read"
	});
	if (e.length === 0) return;
	O === "all" && e.sort((e, t) => e.s.t - t.s.t);
	let r = Pt(), i = (F ? M : j)[0]?.seq ?? -1;
	for (let { s: t, kind: n } of e) {
		let e = Nt(t, n, r);
		j.unshift(e), F && e.name.toLowerCase().includes(F) && M.unshift(e);
	}
	j.length > ut && (j.length = ut), M.length > ut && (M.length = ut), _t = ((F ? M : j)[0]?.seq ?? -1) === i ? -1 : i, L();
}
function At() {
	kt(), L(), requestAnimationFrame(() => D?.refresh());
}
function jt() {
	Tt(), D = null, pt = null, k = null, mt?.dispose(), mt = null, A = null, ht = null, j = [], M = [], _t = -1, N = !1, P = !1, F = "", O = "all", I = -1, vt = null;
}
function Mt(e) {
	N = e, A?.replaceChildren(y(e ? be : ye, 12)), St(), pt?.classList.toggle("li-tr-paused", e), e || kt();
}
function L() {
	let e = F ? M : j;
	D?.setItems(O === "all" ? e : e.filter((e) => e.kind === (O === "writes" ? "write" : "read"))), mt?.refresh();
}
function Nt(e, t, n) {
	let r = e.id, i = n.get(r) ?? `#${r}`, a = Lt(e.t), o = e.by, s = o === void 0 ? "" : n.get(o) ?? `#${o}`, c = s ? `by ${s}` : "";
	if (t === "read") return {
		seq: gt++,
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
	let l = v(e.prev, lt), u = v(e.next, lt);
	return {
		seq: gt++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: l,
		prevCls: ae(e.prev),
		nextText: u,
		nextCls: ae(e.next),
		srcText: c,
		full: `${i}: ${l} → ${u} ${c || "(external)"}`
	};
}
function Pt() {
	let e = /* @__PURE__ */ new Map();
	for (let t of n().nodes) e.set(t.id, t.label);
	return e;
}
function Ft(e, t) {
	let n = t ?? It(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3], a = i.children[0], o = i.children[1], s = i.children[2], c = i.children[3];
	return e.kind === "read" ? (a.textContent = "", a.className = "li-tr-val", o.textContent = "", s.textContent = "", s.className = "li-tr-val") : (a.textContent = e.prevText, a.className = `li-tr-val ${e.prevCls}`, o.textContent = " → ", s.textContent = e.nextText, s.className = `li-tr-val ${e.nextCls}`), c.textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === _t), n;
}
function It() {
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
function Lt(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
//#endregion
//#region src/devtools/stats.tsx
var Rt = 138, zt = 34, Bt = 2 * Math.PI * zt, Vt = Bt * .75, Ht = 48, R = 58, Ut = 11, Wt = Ut * 2, Gt = Wt / 2, Kt = 1, qt = R / (Ht - 1), Jt = 9, Yt = 10, Xt = Math.log1p(900 / Yt), Zt = (e) => Math.min(1, Math.log1p(e / Yt) / Xt), Qt = [
	[0, 0],
	[.4, .03],
	[.7, .11],
	[.88, .22],
	[1, .34]
], $t = 120, en = $t / 1e3, tn = 200, nn = () => void 0, rn = () => !1, z = null, an = null, on = null, sn = null, cn = 0, ln = null, un = null, dn = 0, fn = 0, pn = 0, mn = 0, hn = 0, gn = 0, _n = 0, vn = 0, yn = 0, B = 0, V = !1, bn = 0, xn = 0, Sn = 0, Cn = 0, H = [], wn = 0, Tn = 0, En = 0, Dn = !1, On = null, kn = null, An = null, jn = null, Mn = null, Nn = 100, Pn = "", Fn = !1, In = "", Ln = 0, Rn = 0, zn = 0, Bn = 0, Vn = 0, Hn = 0, Un = 0, Wn = 0, Gn = [], Kn = [];
function U(e, t, n) {
	let r;
	re(() => {
		let i = n();
		i !== r && (r = i, e.setAttribute(t, i));
	});
}
function W(e) {
	return () => (z?.(), e());
}
var G = (e, t) => e * .6 + t / en * .4;
function K(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function qn(e) {
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
function Jn(e) {
	let t = 1e3 / e;
	return t >= 55 ? "h-ok" : t >= 30 ? "h-warn" : "h-bad";
}
function Yn(e, t, n) {
	return e ? e <= t ? "h-ok" : e <= n ? "h-warn" : "h-bad" : "";
}
function Xn(e) {
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
var Zn = Xn((e) => {
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
}), Qn = Xn((e) => {
	let t = new PerformanceObserver((t) => {
		for (let n of t.getEntries()) n.entryType === "largest-contentful-paint" && e(n.startTime);
	});
	return t.observe({
		type: "largest-contentful-paint",
		buffered: !0
	}), t;
}), $n = Xn((e) => {
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
}), er = typeof PerformanceObserver == "function" && PerformanceObserver.supportedEntryTypes?.includes("longtask") === !0, tr = Xn((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let e of n.getEntries()) t += e.duration;
		e(t);
	});
	return n.observe({
		type: "longtask",
		buffered: !0
	}), n;
});
function nr() {
	return [/* @__PURE__ */ p("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: zt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${Bt}`
	}), /* @__PURE__ */ p("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function rr() {
	let e = /* @__PURE__ */ p("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: zt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	U(e, "stroke-dasharray", W(() => `${Vt * Nn / 100} ${Bt}`)), U(e, "class", W(() => `li-garc h-${Pn}`));
	let t = /* @__PURE__ */ p("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(f(W(() => String(Nn)), h)), U(t, "class", W(() => `li-gnum h-${Pn}`)), [e, t];
}
function ir() {
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
				r: zt,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${Vt} ${Bt}`
			}),
			ee(W(() => Fn), rr, nr),
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
function ar() {
	let e = [];
	for (let t = 0; t < Rt; t++) e.push(/* @__PURE__ */ p("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	return re(() => {
		z?.();
		let t = e.length - H.length;
		for (let n = 0; n < e.length; n++) {
			let r = e[n];
			if (!r) continue;
			let i = n >= t ? H[n - t] ?? 0 : 0, a = Math.max(0, Math.min(20, i / 50 * 20));
			r.setAttribute("y", String(20 - a)), r.setAttribute("height", String(a)), r.setAttribute("class", i ? Jn(i) : "");
		}
	}), /* @__PURE__ */ p("div", {
		class: "li-histo",
		title: J.frames,
		children: /* @__PURE__ */ p("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Rt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
}
function or(e, t, n = !1) {
	let r = e.length > 1 ? R / (e.length - 1) : 0, i = Ut - 2 - Kt, a = e.map((e, n) => `${(n * r).toFixed(1)},${(Gt + t * (Kt + e * i)).toFixed(1)}`).join(" ");
	if (!n || a === "") return a;
	let o = Gt.toFixed(1);
	return `0,${o} ${a} ${(e.length > 1 ? R : 0).toFixed(1)},${o}`;
}
function sr(e) {
	let t = e * qt % Jt, n = "";
	for (let e = R - t; e > -.5; e -= Jt) n += `M${e.toFixed(1)} 0V${Wt} `;
	return n.trimEnd();
}
function cr() {
	let e = (e, t, n = !1) => /* @__PURE__ */ p("linearGradient", {
		id: e,
		x1: 0,
		y1: +!!n,
		x2: 0,
		y2: +!n,
		children: Qt.map(([e, n]) => /* @__PURE__ */ p("stop", {
			offset: e,
			class: t,
			"stop-opacity": n
		}))
	}), t = (e, t, n, r) => {
		let i = /* @__PURE__ */ p("polygon", {
			stroke: "none",
			fill: `url(#${r})`
		}), a = /* @__PURE__ */ p("polyline", {
			class: n,
			fill: "none",
			"stroke-width": 1,
			"stroke-linejoin": "round",
			"stroke-linecap": "round"
		});
		return U(i, "points", W(() => or(e, t, !0))), U(a, "points", W(() => or(e, t))), [i, a];
	}, n = /* @__PURE__ */ p("path", {
		class: "li-spk-grid",
		fill: "none",
		"stroke-width": 1
	});
	return U(n, "d", W(() => sr(cn))), /* @__PURE__ */ p("span", {
		class: "li-spark",
		title: "rendering pipeline — writes in (green ↑) vs DOM updates out (red ↓)",
		children: /* @__PURE__ */ m("svg", {
			width: R,
			height: Wt,
			viewBox: `0 0 ${R} ${Wt}`,
			role: "img",
			"aria-label": "Rendering pipeline utilization",
			children: [
				/* @__PURE__ */ m("defs", { children: [e(`${_}-spk-up`, "li-spk-up"), e(`${_}-spk-down`, "li-spk-down", !0)] }),
				n,
				t(Gn, -1, "li-spk-up", `${_}-spk-up`),
				t(Kn, 1, "li-spk-down", `${_}-spk-down`)
			]
		})
	});
}
function q(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ p("span", { class: `li-stat-v ${n}` });
	return i.append(f(W(t), h)), /* @__PURE__ */ m("div", {
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
function lr() {
	let e = /* @__PURE__ */ p("span", { class: "li-perfh-fps" });
	e.append(f(W(() => V ? `${Math.round(B)} fps` : "— fps"), h)), U(e, "class", W(() => `li-perfh-fps ${In}`));
	let t = /* @__PURE__ */ p("div", {
		class: "li-hlabel",
		title: J.health
	});
	t.append(f(W(() => V ? qn(B).label.toUpperCase() : "LOADING"), h)), U(t, "class", W(() => Fn ? `li-hlabel h-${Pn}` : "li-hlabel"));
	let n = /* @__PURE__ */ m("div", {
		class: "li-hstats",
		children: [t, q("lag", () => `${wn.toFixed(0)} · pk ${Tn.toFixed(0)} ms`, "lo", J.lag)]
	}), r = () => jn?.() ?? 0;
	n.append(ur("blocked", () => {
		if (!er) return "—";
		let e = r();
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!er) return "";
		let e = r();
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, J.blocked));
	let i = () => On?.() ?? 0, a = () => kn?.() ?? 0, o = () => An?.() ?? 0;
	return n.append(ur("CLS", () => i().toFixed(2), () => {
		let e = i();
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, J.cls)), n.append(ur("LCP", () => a() ? `${(a() / 1e3).toFixed(2)} s` : "—", () => Yn(a(), 2500, 4e3), J.lcp)), n.append(ur("INP", () => o() ? `${o().toFixed(0)} ms` : "—", () => Yn(o(), 200, 500), J.inp)), /* @__PURE__ */ m("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ m("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ p("span", {
					title: J.fps,
					children: "Performance"
				}), e]
			}),
			ar(),
			/* @__PURE__ */ m("div", {
				class: "li-hblock",
				children: [ir(), n]
			}),
			q("frame time", () => `${Cn.toFixed(1)} ms`, "", J.frameTime),
			dr() ? fr() : null,
			q("writes / s", () => K(fn), "hi", J.writes),
			q("reads / s", () => K(dn), "hi", J.reads),
			q("computeds / s", () => K(pn), "", J.computedsRate),
			q("effect runs / s", () => K(mn), "lo", J.effectRuns),
			q("flushes / s", () => K(hn), "lo", J.flushes),
			q("effects / flush", () => String(vn), "", J.effectsPerFlush),
			q("flush time", () => `${yn.toFixed(1)} ms`, "", J.flushTime),
			q("creates / s", () => K(gn), "lo", J.creates),
			q("disposes / s", () => K(_n), "lo", J.disposes),
			q("states", () => String(Ln), "", J.states),
			q("computeds", () => String(Rn), "", J.computeds),
			ur("unread", () => String(Wn), () => Wn > 0 ? "h-warn" : "", J.unread),
			q("effects", () => String(zn), "", J.effects),
			q("views", () => String(Bn), "", J.views),
			q("sources", () => String(Vn), "", J.sources),
			q("scopes", () => String(Hn), "", J.scopes),
			q("channels", () => String(Un), "", J.channels)
		]
	});
}
function ur(e, t, n, r = "") {
	let i = q(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && U(a, "class", W(() => `li-stat-v ${n()}`)), i;
}
function dr() {
	return performance.memory;
}
function fr() {
	return q("heap", () => {
		let e = Mn?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", J.heap);
}
function pr() {
	let e = ln?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, s = un?.read()?.["loom:flush"];
	dn = G(dn, t), fn = G(fn, n), mn = G(mn, r), pn = G(pn, i), gn = G(gn, a), _n = G(_n, o), hn = G(hn, s?.count ?? 0);
	let c = s?.samples.at(-1);
	if (c !== void 0 && (vn = c.batchSize, yn = c.durationMs), Gn.push(Zt(n)), Kn.push(Zt(r)), Gn.length > Ht && Gn.shift(), Kn.length > Ht && Kn.shift(), !V) Fn = !1, In = "";
	else {
		let e = qn(B);
		Nn = e.score, Pn = e.key, Fn = !0, In = B >= 55 ? "h-ok" : B >= 30 ? "h-warn" : "h-bad";
	}
	return ++cn;
}
function mr() {
	let e = !rn();
	if (nn() === "stats" && e) {
		let e = o();
		Ln = e.states, Rn = e.computeds, zn = e.effects, Bn = e.views, Vn = e.sources, Hn = e.scopes, Un = e.channels, Wn = e.unread;
	} else nn() === "graph" && e ? nt() : nn() === "trace" && e && kt();
}
function hr() {
	document.hidden && (Dn = !0);
}
function gr() {
	En = performance.now() + tn, an = setInterval(() => {
		let e = performance.now(), t = En;
		if (En = e + tn, document.hidden) {
			Dn = !0;
			return;
		}
		if (Dn) {
			Dn = !1;
			return;
		}
		wn = Math.max(0, e - t), wn > Tn && (Tn = wn);
	}, tn), document.addEventListener("visibilitychange", hr), Sn = 0;
	let e = (t) => {
		if (on = requestAnimationFrame(e), Sn) {
			let e = Math.min(t - Sn, 1e3);
			if (Cn = e, H.push(e), H.length > Rt && H.shift(), bn += e, xn++, bn >= 500) {
				let e = xn * 1e3 / bn;
				B = V ? B * .5 + e * .5 : e, V = !0, bn = 0, xn = 0;
			}
		}
		Sn = t;
	};
	on = requestAnimationFrame(e);
}
function _r(t) {
	nn = t.activeTab, rn = t.isMinimized, ln = u([
		c.read,
		c.write,
		c.compute,
		c.effect,
		c.create,
		c.dispose
	]), un = u([c.flush], "samples"), z = r(pr, $t, h), re(() => {
		z?.(), e(mr);
	}, {
		defer: !0,
		maxStale: $t
	});
	let n;
	sn = l(() => {
		On = s(Zn, 0, h), kn = s(Qn, 0, h), An = s($n, 0, h), jn = s(tr, 0, h), dr() && (Mn = r(() => dr()?.usedJSHeapSize ?? 0, 5e3, h)), n = lr();
	}, h);
	let i = cr();
	return gr(), {
		statsPane: n,
		sparkEl: i
	};
}
function vr() {
	sn?.pause();
}
function yr() {
	sn?.resume();
}
function br() {
	ln?.stop(), ln = null, un?.stop(), un = null, z?.stop(), z = null, an != null && clearInterval(an), an = null, document.removeEventListener("visibilitychange", hr), on != null && cancelAnimationFrame(on), on = null, sn?.stop(), sn = null, Mn = On = kn = An = jn = null, cn = 0, dn = fn = pn = mn = hn = 0, gn = _n = 0, vn = yn = 0, B = 0, V = !1, bn = xn = Sn = Cn = 0, H.length = 0, wn = Tn = 0, Fn = !1, Ln = Rn = zn = Bn = 0, Vn = Hn = Un = Wn = 0, Gn.length = 0, Kn.length = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var xr = {
	system: de,
	light: le,
	dark: ue
}, Sr = [
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
], Y = null, Cr = null, X = null, wr = null, Tr = [], Z = null, Q = null, Er = /* @__PURE__ */ new Map(), Dr = null;
function Or(e) {
	try {
		return localStorage.getItem(e);
	} catch {
		return null;
	}
}
function kr(e, t) {
	try {
		localStorage.setItem(e, t);
	} catch {}
}
var Ar = `${_}-theme`, jr = `${_}-min`, Mr = `${_}-pos`, Nr = `${_}-size`, Pr = `${_}-logsize`, Fr = [
	1e3,
	5e3,
	25e3
];
function Ir() {
	let e = Or(Ar);
	return e === "light" || e === "dark" || e === "system" ? e : "system";
}
function Lr() {
	let e = Number(Or(Pr));
	return Fr.includes(e) ? e : 1e3;
}
function Rr() {
	let e = Or(Mr);
	if (!e) return null;
	try {
		let t = JSON.parse(e);
		if (typeof t?.left == "number" && typeof t?.top == "number") return {
			left: t.left,
			top: t.top
		};
	} catch {}
	return null;
}
function zr() {
	let e = Or(Nr);
	if (!e) return null;
	try {
		let t = JSON.parse(e);
		if (typeof t?.width == "number" && typeof t?.height == "number") return {
			width: t.width,
			height: t.height
		};
	} catch {}
	return null;
}
var Br = Rr(), Vr = zr();
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
function Wr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		if (n.target?.closest("button")) return;
		n.preventDefault();
		let r = t.getBoundingClientRect(), i = r.left, a = r.top, o = n.clientX, s = n.clientY;
		t.style.left = `${$(i)}px`, t.style.top = `${$(a)}px`, t.style.right = "auto", t.style.bottom = "auto", e.setPointerCapture?.(n.pointerId), e.style.cursor = "grabbing";
		let c = document.body.style.userSelect;
		document.body.style.userSelect = "none";
		let l = (n) => {
			let { left: r, top: c } = Hr(t, e.offsetHeight || 40, i + n.clientX - o, a + n.clientY - s);
			t.style.left = `${r}px`, t.style.top = `${c}px`, Br = {
				left: r,
				top: c
			};
		}, u = () => {
			e.releasePointerCapture?.(n.pointerId), e.style.cursor = "", document.body.style.userSelect = c, Br && kr(Mr, JSON.stringify(Br)), e.removeEventListener("pointermove", l), e.removeEventListener("pointerup", u), e.removeEventListener("pointercancel", u);
		};
		e.addEventListener("pointermove", l), e.addEventListener("pointerup", u), e.addEventListener("pointercancel", u);
	});
}
function Gr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		n.preventDefault(), n.stopPropagation();
		let r = t.getBoundingClientRect();
		t.style.left = `${$(r.left)}px`, t.style.top = `${$(r.top)}px`, t.style.right = "auto", t.style.bottom = "auto";
		let i = r.width, a = r.height, o = n.clientX, s = n.clientY;
		e.setPointerCapture?.(n.pointerId);
		let c = document.body.style.userSelect;
		document.body.style.userSelect = "none";
		let l = (e) => {
			let n = $(Math.max(240, Math.min(window.innerWidth - r.left - 8, i + e.clientX - o))), c = $(Math.max(160, Math.min(window.innerHeight - r.top - 8, a + e.clientY - s)));
			t.style.width = `${n}px`, t.style.height = `${c}px`, Vr = {
				width: n,
				height: c
			};
		}, u = () => {
			e.releasePointerCapture?.(n.pointerId), document.body.style.userSelect = c, Vr && kr(Nr, JSON.stringify(Vr)), e.removeEventListener("pointermove", l), e.removeEventListener("pointerup", u), e.removeEventListener("pointercancel", u);
		};
		e.addEventListener("pointermove", l), e.addEventListener("pointerup", u), e.addEventListener("pointercancel", u);
	});
}
function Kr(e) {
	return xe(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function qr(e = document.body) {
	if (Y || typeof document > "u") return;
	if (a({ inspect: !0 }), !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${_}-css`, e.textContent = ie, document.head.append(e);
	}
	Q = i("stats", h);
	let t = Ir(), n = /* @__PURE__ */ p("span", { class: "li-menu-val" }), r = () => {
		Y?.setAttribute("data-theme", t), Cr?.setAttribute("data-theme", t), n.innerHTML = oe(xr[t], 13), o.title = `Theme: ${t} (click to cycle)`;
	}, o = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ p("span", { children: "Theme" }), n]
	});
	d(o, () => {
		let e = [
			"system",
			"light",
			"dark"
		];
		t = e[(e.indexOf(t) + 1) % e.length] ?? "system", kr(Ar, t), r();
	});
	let s = /* @__PURE__ */ p("div", {
		class: "li-menu",
		hidden: !0
	});
	s.id = `${_}-menu`, s.append(o), Cr = s;
	let c = Lr(), u = /* @__PURE__ */ p("span", { class: "li-menu-val" }), f = () => {
		u.textContent = `${c / 1e3}k`, Ot(c);
	}, ee = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ p("span", { children: "Log size" }), u]
	});
	d(ee, () => {
		c = Fr[(Fr.indexOf(c) + 1) % Fr.length] ?? 1e3, kr(Pr, String(c)), f();
	}), s.append(ee), f();
	let te = () => {
		s.hidden = !0;
	}, ne = /* @__PURE__ */ m("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ p("span", { children: "Hide" }), /* @__PURE__ */ p("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	d(ne, () => {
		te(), Jr();
	}), s.append(ne);
	let g = /* @__PURE__ */ p("button", {
		type: "button",
		title: "Settings"
	});
	g.append(Kr(fe)), d(g, (e) => {
		if (e.stopPropagation(), !s.hidden) {
			te();
			return;
		}
		s.hidden = !1;
		let t = g.getBoundingClientRect(), n = s.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), s.style.left = `${Math.max(8, r)}px`, s.style.top = `${Math.max(8, i)}px`;
	});
	let v = /* @__PURE__ */ p("button", { type: "button" }), ae = (e) => {
		v.title = e ? "Expand" : "Collapse", v.replaceChildren(Kr(e ? ce : se));
	}, le = Or(jr) === "1";
	ae(le), d(v, () => {
		let e = !!Y?.classList.toggle("li-min");
		ae(e), kr(jr, e ? "1" : "0"), e ? Z?.pause() : Z?.resume(), xt(!e && Q?.() === "trace");
	});
	let ue = /* @__PURE__ */ m("div", {
		class: "li-bar",
		children: [
			/* @__PURE__ */ m("span", {
				class: "li-brand",
				children: [Se(15), /* @__PURE__ */ p("b", { children: "Loom" })]
			}),
			/* @__PURE__ */ p("span", { class: "li-sp" }),
			g,
			v
		]
	}), de, pe;
	Z = l(() => {
		let e = _r({
			activeTab: () => Q?.(),
			isMinimized: () => Y?.classList.contains("li-min") ?? !1
		});
		de = e.statsPane, pe = e.sparkEl;
	}, h), le && Z.pause();
	let me = /* @__PURE__ */ new Map(), he = /* @__PURE__ */ new Map();
	X = /* @__PURE__ */ p("div", { class: "li-body li-fade-y" });
	for (let e of Sr) {
		let t = e.id === "stats" ? de : e.id === "graph" ? Ne() : Ct();
		me.set(e.id, t), X.append(t);
	}
	yt((e) => {
		Q?.("graph"), at(e);
	});
	let ge = /* @__PURE__ */ p("div", { class: "li-tabscroll" });
	for (let e of Sr) {
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
			t.append(e), bt(e);
		}
		d(t, () => Q?.(e.id)), he.set(e.id, t), ge.append(t);
	}
	let _e = /* @__PURE__ */ m("div", {
		class: "li-tabs",
		children: [ge, pe]
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
		ue,
		_e,
		X,
		ve
	] }), Y.id = _, le && Y.classList.add("li-min"), r(), Wr(ue, Y), Gr(ve, Y), wr = (e) => {
		!s.hidden && !s.contains(e.target) && e.target !== g && te();
	}, document.addEventListener("pointerdown", wr), e.append(Y), document.body.append(s), Vr && (Y.style.width = `${Math.max(240, Math.min(Vr.width, window.innerWidth - 16))}px`, Y.style.height = `${Math.max(160, Math.min(Vr.height, window.innerHeight - 16))}px`), Br) {
		let { left: e, top: t } = Ur(Y, Br.left, Br.top);
		Y.style.left = `${e}px`, Y.style.top = `${t}px`, Y.style.right = "auto", Y.style.bottom = "auto";
	}
	re(() => {
		let e = Q?.();
		Dr && Dr !== e && X && Er.set(Dr, X.scrollTop), e === "stats" ? yr() : vr(), e !== "graph" && tt();
		for (let t of Sr) {
			let n = t.id === e, r = me.get(t.id), i = he.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && X) {
			let t = Er.get(e) ?? 0, n = Math.max(0, X.scrollHeight - X.clientHeight);
			X.scrollTop = Math.min(t, n), e === "graph" ? rt() : e === "trace" && At();
		}
		xt(e === "trace" && Y?.classList.contains("li-min") !== !0), Dr = e ?? null;
		for (let e of Tr) e.refresh();
	}), Tr.push(st(X, "y"), st(ge, "x"));
}
function Jr() {
	br();
	for (let e of Tr) e.dispose();
	Tr.length = 0, g(), Z?.stop(), Z = null, wr && document.removeEventListener("pointerdown", wr), wr = null, Cr?.remove(), Cr = null, Y?.remove(), Y = null, X = null, Q = null, Er.clear(), Dr = null, ot(), jt();
}
function Yr() {
	return Y !== null;
}
function Xr(e = document.body) {
	Y ? Jr() : qr(e);
}
//#endregion
export { Yr as inspectorMounted, qr as mountInspector, Xr as toggleInspector, Jr as unmountInspector };
