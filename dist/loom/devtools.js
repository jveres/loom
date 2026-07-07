import { _ as e, a as t, h as n, i as r, m as i, p as a, u as o } from "./loom-BE6Qi7th.js";
import { i as s, n as c, r as l } from "./meter-DFb_yOza.js";
import { n as ee, t as u } from "./observe-DAHMNNFv.js";
import { h as d, l as f, m as te, p as ne, t as p } from "./dom-CjuQZBbq.js";
import { virtualList as m } from "./dom/virtual-list.js";
import { scrollFade as re } from "./dom/scroll-fade.js";
import { jsx as h, jsxs as g } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var _ = { internal: !0 }, ie = [];
function ae(e, n) {
	ie.push(t(e, n ? {
		..._,
		...n
	} : _));
}
function oe() {
	for (let e of ie) e();
	ie.length = 0;
}
//#endregion
//#region src/devtools/inspector.css?inline
var se = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;flex:auto;align-items:flex-end;gap:1px;min-width:0;margin-top:6px;display:flex;overflow-x:auto}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", v = "loom-inspector";
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
function Ee(e, t) {
	return Te(ue(e, t));
}
function De(e) {
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var Oe = 300, ke = 22, Ae = 16, y = null, b = /* @__PURE__ */ new Map(), je = 0, x = [], S = [], Me = [], Ne = null, Pe = -1, Fe = 0, Ie = !1, Le = !1, C = /* @__PURE__ */ new Set(), Re = -1;
function ze() {
	return y = m({
		rowHeight: ke,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: Qe
	}), y.el.classList.add("li-pane", "li-graph"), y.el;
}
function Be(e) {
	return w(e.id).length > 0;
}
function Ve(e, t) {
	if (typeof t == "number") {
		let n = Number(e);
		return Number.isNaN(n) ? t : n;
	}
	return e;
}
function He(e) {
	if (e.kind !== "state" || !e.source) return !1;
	let t = e.value;
	return t === null || typeof t == "number" || typeof t == "string" || typeof t == "boolean";
}
function Ue(e, t, n, r = !1) {
	if (Pe === n) return;
	let i = e.querySelector(".li-gval");
	if (!i) return;
	let a = ce(t, Ae);
	!r && !Ie && e.dataset.prev !== void 0 && e.dataset.prev !== a && Ye(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${le(t)}`, e.dataset.prev = a;
}
function We(e, t, n, r) {
	let i = t();
	if (typeof i == "boolean") {
		t(!i), Ue(r, t(), e, !0), Ge(e, r);
		return;
	}
	if (i !== null && typeof i != "number" && typeof i != "string") return;
	let a = document.createElement("input");
	a.className = "li-gedit", a.value = typeof i == "string" ? i : String(i), Ne = a, Pe = e, n.replaceWith(a), a.focus(), a.select();
	let o = () => {
		Ne = null, Pe = -1, a.parentNode && a.replaceWith(n);
	}, s = () => {
		Ne === a && (t(Ve(a.value, i)), o(), Ue(r, t(), e, !0), Ge(e, r));
	};
	a.onblur = s, a.onkeydown = (e) => {
		e.key === "Enter" ? s() : e.key === "Escape" && o();
	};
}
function Ge(e, t) {
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
function Ke(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of b.values()) if (r.group === e) for (let e of w(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function qe(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function T(e, t) {
	for (let e of Me) e.remove();
	if (Me = [], t) for (let t of e) {
		let e = qe(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), Me.push(n);
	}
}
function Je(e) {
	let t = performance.now();
	t - je >= Oe && (b = new Map(u({ active: !0 }).nodes.map((e) => [e.id, e])), je = t), T(w(e), !0);
}
function Ye(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function Xe(e, t) {
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
function Ze(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `props #${e}`;
}
function Qe(e, t) {
	if (e.kind === "header") return t ? et(t, e) : $e(e);
	let n = t ? nt(t, e) : tt(e);
	return e.node.id === Re && (Ye(n), Re = -1), n;
}
function $e(e) {
	let t = /* @__PURE__ */ h("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ h("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = Ee(be, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ h("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(Ee(xe, 11));
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
		C.has(o) ? C.delete(o) : C.add(o), y?.setItems(at());
	}, i.onclick = (e) => {
		e.stopPropagation(), Xe(Ke(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => T(Ke(o), !0), a.onmouseleave = () => T(Ke(o), !1), a;
}
function et(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", C.has(t.gid)), e;
}
function tt(e) {
	let t = e.node, n = /* @__PURE__ */ h("span", { class: "li-gval" }), r = Be(t), i = Ee(t.kind === "computed" ? ye : r ? _e : ve, 13);
	i.classList.add("li-gicon", r ? t.kind === "computed" ? "li-gi-computed" : "li-gi-state" : "li-gi-dim");
	let a = /* @__PURE__ */ g("div", {
		class: "li-grow",
		children: [
			i,
			/* @__PURE__ */ h("span", {
				class: "li-glabel",
				children: e.child ? t.key ?? t.label : t.label
			}),
			n
		]
	});
	if (e.child && a.classList.add("li-grow-child"), a.onmouseenter = () => T(w(t.id), !0), a.onmouseleave = () => T(w(t.id), !1), He(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => We(t.id, e, n, a);
	}
	return Ue(a, t.value, t.id), a;
}
function nt(e, t) {
	return Ue(e, t.node.value, t.node.id), e;
}
function rt() {
	let e = S.length;
	for (let t of x) e += 1 + (C.has(t.gid) ? 0 : t.signals.length);
	return e;
}
function it(e) {
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
function at() {
	return {
		length: rt(),
		at: it
	};
}
function ot() {
	if (!y) return;
	let e = u({ active: !0 }).nodes;
	b = new Map(e.map((e) => [e.id, e])), je = performance.now();
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) if (!(r.internal || r.kind === "effect")) if (r.group !== void 0) {
		let e = t.get(r.group);
		e ? e.push(r) : t.set(r.group, [r]);
	} else n.push(r);
	x = [];
	for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), x.push({
		gid: e,
		label: Ze(e, n),
		signals: n
	});
	S = n, Ie = Le, y.setItems(at()), Ie = !1, Le = !1;
}
function st() {
	T([], !1);
}
function ct() {
	let e = performance.now();
	e - Fe >= Oe && (Fe = e, ot());
}
function lt() {
	if (y) {
		for (let e of y.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Le = !0, y.refresh();
	}
}
function ut(e) {
	let t = 0;
	for (let n of x) {
		let r = n.signals.findIndex((t) => t.id === e);
		if (r >= 0) return C.has(n.gid) && (C.delete(n.gid), y?.setItems(at())), t + 1 + r;
		t += 1 + (C.has(n.gid) ? 0 : n.signals.length);
	}
	let n = S.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function dt(e) {
	if (y === null) return;
	ot();
	let t = ut(e);
	t < 0 || (Re = e, y.scrollToIndex(t));
}
function ft() {
	for (let e of Me) e.remove();
	Me = [], Ne = null, Pe = -1, y?.destroy(), y = null, x = [], S = [], C.clear(), b = /* @__PURE__ */ new Map(), je = 0;
}
//#endregion
//#region src/devtools/trace.tsx
var pt = 22, mt = 200, ht = 1e3, gt = [
	"writes",
	"reads",
	"all"
];
function _t(e) {
	return gt.includes(e);
}
var E = null, vt = null, yt = null, D = "all", bt = null, O = null, xt = null, k = null, A = null, j = [], M = [], N = !1, P = !1, F = "", St = 0, Ct = -1, I = -1, wt = null;
function Tt(e) {
	wt = e;
}
function Et(e) {
	A = e, Ot();
}
function Dt(e) {
	P !== e && (P = e, e ? (At(), Ft()) : jt(), Ot());
}
function Ot() {
	A && (A.classList.toggle("inactive", !P), A.classList.toggle("off", N), A.title = P ? N ? "Paused" : "Live — capturing" : "Trace");
}
function kt() {
	Mt(), E = m({
		rowHeight: pt,
		key: (e) => e.seq,
		render: Ut
	}), k = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), k.append(Ee(Ce, 12)), f(k, () => Rt(!N));
	let e = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(Ee(Se, 12)), f(e, () => Nt());
	let t = /* @__PURE__ */ h("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: gt.map((e) => /* @__PURE__ */ h("option", {
			value: e,
			children: e
		}))
	});
	t.value = D, t.addEventListener("change", () => {
		_t(t.value) && (D = t.value), Mt();
	});
	let n = /* @__PURE__ */ h("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		F = n.value.trim().toLowerCase(), M = F ? j.filter((e) => e.name.toLowerCase().includes(F)) : [], L();
	}), O = /* @__PURE__ */ h("div", { class: "li-tr-scroll" }), O.append(E.el), xt = re(O), O.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== I && (I = Number(t), Je(I));
	}), O.addEventListener("pointerleave", () => {
		I = -1, st();
	}), f(O, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (I = -1, st(), wt?.(Number(t)));
	}), bt = /* @__PURE__ */ g("div", {
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
	}), bt;
}
function At() {
	D !== "reads" && !vt && (vt = l([c.write], "samples")), D !== "writes" && !yt && (yt = l([c.read], "samples"));
}
function jt() {
	vt?.stop(), vt = null, yt?.stop(), yt = null;
}
function Mt() {
	jt(), P && At(), Ct = -1, L(), Ft();
}
function Nt() {
	j = [], M = [], Ct = -1, L();
}
function Pt(e) {
	ht = e, j.length > e && (j.length = e), M.length > e && (M.length = e), L();
}
function Ft() {
	if (N || E === null) return;
	let e = [], t = vt?.read()["loom:write"]?.samples;
	if (t) for (let n of t) e.push({
		s: n,
		kind: "write"
	});
	let n = yt?.read()["loom:read"]?.samples;
	if (n) for (let t of n) e.push({
		s: t,
		kind: "read"
	});
	if (e.length === 0) return;
	D === "all" && e.sort((e, t) => s(e.s).t - s(t.s).t), Vt = !1;
	let r = (F ? M : j)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(zt(t, n));
	if (i.reverse(), j = i.concat(j), F) {
		let e = i.filter((e) => e.name.toLowerCase().includes(F));
		e.length > 0 && (M = e.concat(M));
	}
	j.length > ht && (j.length = ht), M.length > ht && (M.length = ht), Ct = ((F ? M : j)[0]?.seq ?? -1) === r ? -1 : r, L();
}
function It() {
	Ft(), L(), requestAnimationFrame(() => E?.refresh());
}
function Lt() {
	jt(), E = null, bt = null, O = null, xt?.(), xt = null, k = null, A = null, j = [], M = [], Bt.clear(), Vt = !1, Ct = -1, N = !1, P = !1, F = "", D = "all", I = -1, wt = null;
}
function Rt(e) {
	N = e, k?.replaceChildren(Ee(e ? we : Ce, 12)), Ot(), bt?.classList.toggle("li-tr-paused", e), e || Ft();
}
function L() {
	let e = F ? M : j;
	E?.setItems(D === "all" ? e : e.filter((e) => e.kind === (D === "writes" ? "write" : "read")));
}
function zt(e, t) {
	let n = s(e), r = n.id, i = Ht(r), a = Gt(n.t), o = n.by, c = o === void 0 ? "" : `by ${Ht(o)}`;
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
	let l = s(e), ee = ce(l.prev, mt), u = ce(l.next, mt);
	return {
		seq: St++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: ee,
		prevCls: le(l.prev),
		nextText: u,
		nextCls: le(l.next),
		srcText: c,
		full: `${i}: ${ee} → ${u} ${c || "(external)"}`
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
function Gt(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
//#endregion
//#region src/devtools/stats.tsx
var Kt = 138, qt = 34, Jt = 2 * Math.PI * qt, Yt = Jt * .75, Xt = 120, Zt = Xt / 1e3, Qt = 200, $t = () => void 0, en = () => !1, R = null, tn = null, nn = null, rn = null, an = 0, on = null, sn = null, cn = 0, ln = 0, un = 0, dn = 0, fn = 0, pn = 0, mn = 0, hn = 0, gn = 0, z = 0, B = !1, _n = 0, vn = 0, yn = 0, bn = 0, V = [], xn = 0, Sn = 0, Cn = 0, wn = !1, Tn = null, En = null, Dn = null, On = null, kn = null, An = 100, jn = "", Mn = "", Nn = !1, Pn = "", Fn = 0, In = 0, Ln = 0, Rn = 0, zn = 0, Bn = 0, Vn = 0, Hn = 0;
function H(e) {
	return e?.() ?? 0;
}
function Un(e) {
	return () => (R?.(), e());
}
function U(e, t, n) {
	p(e, t, Un(n), _);
}
function Wn(e) {
	return ne(Un(e), _);
}
var W = (e, t) => e * .6 + t / Zt * .4;
function G(e) {
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
	return [/* @__PURE__ */ h("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: qt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${Jt}`
	}), /* @__PURE__ */ h("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function tr() {
	let e = /* @__PURE__ */ h("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: qt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	U(e, "stroke-dasharray", () => `${Yt * An / 100} ${Jt}`), U(e, "class", () => `li-garc h-${jn}`);
	let t = /* @__PURE__ */ h("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(Wn(() => String(An))), U(t, "class", () => `li-gnum h-${jn}`), [e, t];
}
function nr() {
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
				r: qt,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${Yt} ${Jt}`
			}),
			te(Un(() => Nn), tr, er),
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
function rr() {
	let e = [];
	for (let t = 0; t < Kt; t++) e.push(/* @__PURE__ */ h("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	let t = Array(Kt).fill(-1);
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
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? Kn(a) : "");
		}
	}), /* @__PURE__ */ h("div", {
		class: "li-histo",
		title: q.frames,
		children: /* @__PURE__ */ h("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Kt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
}
function K(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ h("span", { class: `li-stat-v ${n}` });
	return i.append(ne(Un(t), _)), /* @__PURE__ */ g("div", {
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
function ir() {
	let e = /* @__PURE__ */ h("span", { class: "li-perfh-fps" });
	e.append(Wn(() => B ? `${Math.round(z)} fps` : "— fps")), U(e, "class", () => `li-perfh-fps ${Pn}`);
	let t = /* @__PURE__ */ h("div", {
		class: "li-hlabel",
		title: q.health
	});
	t.append(Wn(() => B ? Mn.toUpperCase() : "LOADING")), U(t, "class", () => Nn ? `li-hlabel h-${jn}` : "li-hlabel");
	let n = /* @__PURE__ */ g("div", {
		class: "li-hstats",
		children: [t, K("lag", () => `${xn.toFixed(0)} · pk ${Sn.toFixed(0)} ms`, "lo", q.lag)]
	});
	return n.append(ar("blocked", () => {
		if (!Qn) return "—";
		let e = H(On);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!Qn) return "";
		let e = H(On);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, q.blocked)), n.append(ar("CLS", () => H(Tn).toFixed(2), () => {
		let e = H(Tn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, q.cls)), n.append(ar("LCP", () => {
		let e = H(En);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => qn(H(En), 2500, 4e3), q.lcp)), n.append(ar("INP", () => {
		let e = H(Dn);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => qn(H(Dn), 200, 500), q.inp)), /* @__PURE__ */ g("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ g("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ h("span", {
					title: q.fps,
					children: "Performance"
				}), e]
			}),
			rr(),
			/* @__PURE__ */ g("div", {
				class: "li-hblock",
				children: [nr(), n]
			}),
			K("frame time", () => `${bn.toFixed(1)} ms`, "", q.frameTime),
			or() ? sr() : null,
			K("writes / s", () => G(ln), "hi", q.writes),
			K("reads / s", () => G(cn), "hi", q.reads),
			K("computeds / s", () => G(un), "", q.computedsRate),
			K("effect runs / s", () => G(dn), "lo", q.effectRuns),
			K("flushes / s", () => G(fn), "lo", q.flushes),
			K("effects / flush", () => String(hn), "", q.effectsPerFlush),
			K("flush time", () => `${gn.toFixed(1)} ms`, "", q.flushTime),
			K("creates / s", () => G(pn), "lo", q.creates),
			K("disposes / s", () => G(mn), "lo", q.disposes),
			K("states", () => String(Fn), "", q.states),
			K("computeds", () => String(In), "", q.computeds),
			ar("unread", () => String(Hn), () => Hn > 0 ? "h-warn" : "", q.unread),
			K("effects", () => String(Ln), "", q.effects),
			K("views", () => String(Rn), "", q.views),
			K("sources", () => String(zn), "", q.sources),
			K("scopes", () => String(Bn), "", q.scopes),
			K("channels", () => String(Vn), "", q.channels)
		]
	});
}
function ar(e, t, n, r = "") {
	let i = K(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && U(a, "class", () => `li-stat-v ${n()}`), i;
}
function or() {
	return performance.memory;
}
function sr() {
	return K("heap", () => {
		let e = kn?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", q.heap);
}
function cr() {
	let e = on?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, c = sn?.read()?.["loom:flush"];
	cn = W(cn, t), ln = W(ln, n), dn = W(dn, r), un = W(un, i), pn = W(pn, a), mn = W(mn, o), fn = W(fn, c?.count ?? 0);
	let l = s(c?.samples.at(-1));
	if (l !== void 0 && (hn = l.batchSize, gn = l.durationMs), !B) Nn = !1, Pn = "";
	else {
		let e = Gn(z);
		An = e.score, jn = e.key, Mn = e.label, Nn = !0, Pn = z >= 55 ? "h-ok" : z >= 30 ? "h-warn" : "h-bad";
	}
	return ++an;
}
function lr() {
	let e = !en();
	if ($t() === "stats" && e) {
		let e = ee();
		Fn = e.states, In = e.computeds, Ln = e.effects - e.targetedEffects, Rn = e.targetedEffects, zn = e.sources, Bn = e.scopes, Vn = e.channels, Hn = e.unread;
	} else $t() === "graph" && e ? ct() : $t() === "trace" && e && Ft();
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
			if (bn = e, V.push(e), V.length > Kt && V.shift(), _n += e, vn++, _n >= 500) {
				let e = vn * 1e3 / _n;
				z = B ? z * .5 + e * .5 : e, B = !0, _n = 0, vn = 0;
			}
		}
		yn = t;
	};
	nn = requestAnimationFrame(e);
}
function fr(t) {
	$t = t.activeTab, en = t.isMinimized, on = l([
		c.read,
		c.write,
		c.compute,
		c.effect,
		c.create,
		c.dispose
	]), sn = l([c.flush], "samples"), R = o(cr, Xt, _), ae(() => {
		R?.(), e(lr);
	}, {
		defer: !0,
		maxStale: Xt
	});
	let n;
	return rn = a(() => {
		Tn = i(Yn, 0, _), En = i(Xn, 0, _), Dn = i(Zn, 0, _), On = i($n, 0, _), or() && (kn = o(() => or()?.usedJSHeapSize ?? 0, 5e3, _)), n = ir();
	}, _), dr(), n;
}
function pr() {
	rn?.pause();
}
function mr() {
	rn?.resume();
}
function hr() {
	on?.stop(), on = null, sn?.stop(), sn = null, R?.stop(), R = null, tn != null && clearInterval(tn), tn = null, document.removeEventListener("visibilitychange", ur), nn != null && cancelAnimationFrame(nn), nn = null, rn?.stop(), rn = null, kn = Tn = En = Dn = On = null, an = 0, cn = ln = un = dn = fn = 0, pn = mn = 0, hn = gn = 0, z = 0, B = !1, _n = vn = yn = bn = 0, V.length = 0, xn = Sn = 0, wn = !1, Nn = !1, An = 100, jn = Mn = Pn = "", Fn = In = Ln = Rn = 0, zn = Bn = Vn = Hn = 0;
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
], J = null, vr = null, Y = null, yr = null, br = [], X = null, Z = null, xr = /* @__PURE__ */ new Map(), Sr = null, Cr = [
	1e3,
	5e3,
	25e3
], wr = null;
function Q() {
	return wr ??= {
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
			validate: (e) => Cr.includes(e)
		}),
		pos: d(`${v}-pos`, null, {
			internal: !0,
			validate: (e) => e !== null && typeof e.left == "number" && typeof e.top == "number"
		}),
		size: d(`${v}-size`, null, {
			internal: !0,
			validate: (e) => e !== null && typeof e.width == "number" && typeof e.height == "number"
		})
	}, wr;
}
function $(e) {
	let t = window.devicePixelRatio || 1;
	return Math.round(e * t) / t;
}
function Tr(e, t, n, r) {
	let i = e.offsetWidth, a = Math.min(80, i);
	return {
		left: $(Math.min(window.innerWidth - a, Math.max(a - i, n))),
		top: $(Math.min(window.innerHeight - t, Math.max(0, r)))
	};
}
function Er(e, t, n) {
	let r = Math.max(0, window.innerWidth - e.offsetWidth), i = Math.max(0, window.innerHeight - e.offsetHeight);
	return {
		left: $(Math.max(0, Math.min(t, r))),
		top: $(Math.max(0, Math.min(n, i)))
	};
}
function Dr(e, t, n) {
	return e.addEventListener("pointermove", t), e.addEventListener("pointerup", n), e.addEventListener("pointercancel", n), () => {
		e.removeEventListener("pointermove", t), e.removeEventListener("pointerup", n), e.removeEventListener("pointercancel", n);
	};
}
function Or(e, t, n, r, i) {
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto", e.setPointerCapture?.(n.pointerId);
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s = () => {};
	s = Dr(e, (e) => r(e, a), () => {
		e.releasePointerCapture?.(n.pointerId), document.body.style.userSelect = o, i(), s();
	});
}
function kr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		if (n.target?.closest("button")) return;
		n.preventDefault();
		let r = n.clientX, i = n.clientY, a = null;
		e.style.cursor = "grabbing", Or(e, t, n, (n, o) => {
			let { left: s, top: c } = Tr(t, e.offsetHeight || 40, o.left + n.clientX - r, o.top + n.clientY - i);
			t.style.left = `${s}px`, t.style.top = `${c}px`, a = {
				left: s,
				top: c
			};
		}, () => {
			e.style.cursor = "", a && Q().pos(a);
		});
	});
}
function Ar(e, t) {
	e.addEventListener("pointerdown", (n) => {
		n.preventDefault(), n.stopPropagation();
		let r = n.clientX, i = n.clientY, a = null;
		Or(e, t, n, (e, n) => {
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
function jr(e) {
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function Mr(e = document.body) {
	if (J || typeof document > "u") return;
	if (r({ inspect: !0 }), !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${v}-css`, e.textContent = se, document.head.append(e);
	}
	Z = n("stats", _);
	let t = Q().theme(), i = /* @__PURE__ */ h("span", { class: "li-menu-val" }), o = () => {
		J?.setAttribute("data-theme", t), vr?.setAttribute("data-theme", t), i.innerHTML = ue(gr[t], 13), s.title = `Theme: ${t} (click to cycle)`;
	}, s = /* @__PURE__ */ g("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ h("span", { children: "Theme" }), i]
	});
	f(s, () => {
		let e = [
			"system",
			"light",
			"dark"
		];
		t = e[(e.indexOf(t) + 1) % e.length] ?? "system", Q().theme(t), o();
	});
	let c = /* @__PURE__ */ h("div", {
		class: "li-menu",
		hidden: !0
	});
	c.id = `${v}-menu`, c.append(s), vr = c;
	let l = Q().logSize(), ee = /* @__PURE__ */ h("span", { class: "li-menu-val" }), u = () => {
		ee.textContent = `${l / 1e3}k`, Pt(l);
	}, d = /* @__PURE__ */ g("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ h("span", { children: "Log size" }), ee]
	});
	f(d, () => {
		l = Cr[(Cr.indexOf(l) + 1) % Cr.length] ?? 1e3, Q().logSize(l), u();
	}), c.append(d), u();
	let te = () => {
		c.hidden = !0;
	}, ne = /* @__PURE__ */ g("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ h("span", { children: "Hide" }), /* @__PURE__ */ h("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	f(ne, () => {
		te(), Nr();
	}), c.append(ne);
	let p = /* @__PURE__ */ h("button", {
		type: "button",
		title: "Settings"
	});
	p.append(jr(ge)), f(p, (e) => {
		if (e.stopPropagation(), !c.hidden) {
			te();
			return;
		}
		c.hidden = !1;
		let t = p.getBoundingClientRect(), n = c.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), c.style.left = `${Math.max(8, r)}px`, c.style.top = `${Math.max(8, i)}px`;
	});
	let m = /* @__PURE__ */ h("button", { type: "button" }), ie = (e) => {
		m.title = e ? "Expand" : "Collapse", m.replaceChildren(jr(e ? fe : de));
	}, oe = Q().min();
	ie(oe), f(m, () => {
		let e = !!J?.classList.toggle("li-min");
		ie(e), Q().min(e), e ? X?.pause() : X?.resume(), Dt(!e && Z?.() === "trace");
	});
	let ce = /* @__PURE__ */ g("div", {
		class: "li-bar",
		children: [
			/* @__PURE__ */ g("span", {
				class: "li-brand",
				children: [De(15), /* @__PURE__ */ h("b", { children: "Loom" })]
			}),
			/* @__PURE__ */ h("span", { class: "li-sp" }),
			p,
			m
		]
	}), le;
	X = a(() => {
		le = fr({
			activeTab: () => Z?.(),
			isMinimized: () => J?.classList.contains("li-min") ?? !1
		});
	}, _), oe && X.pause();
	let pe = /* @__PURE__ */ new Map(), me = /* @__PURE__ */ new Map();
	Y = /* @__PURE__ */ h("div", { class: "li-body" });
	for (let e of _r) {
		let t = e.id === "stats" ? le : e.id === "graph" ? ze() : kt();
		pe.set(e.id, t), Y.append(t);
	}
	Tt((e) => {
		Z?.("graph"), dt(e);
	});
	let he = /* @__PURE__ */ h("div", { class: "li-tabscroll" });
	for (let e of _r) {
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
			t.append(e), Et(e);
		}
		f(t, () => Z?.(e.id)), me.set(e.id, t), he.append(t);
	}
	let _e = /* @__PURE__ */ h("div", {
		class: "li-tabs",
		children: he
	}), ve = /* @__PURE__ */ h("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ h("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ h("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	J = /* @__PURE__ */ g("div", { children: [
		ce,
		_e,
		Y,
		ve
	] }), J.id = v, oe && J.classList.add("li-min"), o(), kr(ce, J), Ar(ve, J), yr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!c.hidden && (t === null || !c.contains(t)) && e.target !== p && te();
	}, document.addEventListener("pointerdown", yr), e.append(J), document.body.append(c);
	let ye = Q().size(), be = Q().pos();
	if (ye && (J.style.width = `${Math.max(240, Math.min(ye.width, window.innerWidth - 16))}px`, J.style.height = `${Math.max(160, Math.min(ye.height, window.innerHeight - 16))}px`), be) {
		let { left: e, top: t } = Er(J, be.left, be.top);
		J.style.left = `${e}px`, J.style.top = `${t}px`, J.style.right = "auto", J.style.bottom = "auto";
	}
	ae(() => {
		let e = Z?.();
		Sr && Sr !== e && Y && xr.set(Sr, Y.scrollTop), e === "stats" ? mr() : pr(), e !== "graph" && st();
		for (let t of _r) {
			let n = t.id === e, r = pe.get(t.id), i = me.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && Y) {
			let t = xr.get(e) ?? 0, n = Math.max(0, Y.scrollHeight - Y.clientHeight);
			Y.scrollTop = Math.min(t, n), e === "graph" ? lt() : e === "trace" && It();
		}
		Dt(e === "trace" && J?.classList.contains("li-min") !== !0), Sr = e ?? null;
	}), br.push(re(Y), re(he, { axis: "x" }));
}
function Nr() {
	hr();
	for (let e of br) e();
	br.length = 0, oe(), X?.stop(), X = null, yr && document.removeEventListener("pointerdown", yr), yr = null, vr?.remove(), vr = null, J?.remove(), J = null, Y = null, Z = null, xr.clear(), Sr = null, ft(), Lt();
}
function Pr() {
	return J !== null;
}
function Fr(e = document.body) {
	J ? Nr() : Mr(e);
}
//#endregion
export { Pr as inspectorMounted, Mr as mountInspector, Fr as toggleInspector, Nr as unmountInspector };
