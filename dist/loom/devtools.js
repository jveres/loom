import { _ as e, i as t, o as n, p as r, v as i, x as a, y as o } from "./loom-9N47RZAW.js";
import { i as s, n as c, r as l } from "./meter-C6zJJ8H3.js";
import { n as ee, t as u } from "./observe-BR2RRI9l.js";
import { _ as d, g as te, h as ne, l as f, t as p } from "./dom-qpUW-vqx.js";
import { virtualList as m } from "./dom/virtual-list.js";
import "./defer.js";
import { scrollFade as re } from "./dom/scroll-fade.js";
import { jsx as h, jsxs as g } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var _ = { internal: !0 }, ie = [];
function ae(e, t) {
	ie.push(n(e, t ? {
		..._,
		...t
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
function y(e, t) {
	return Te(ue(e, t));
}
function Ee(e) {
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var De = 300, Oe = 22, ke = 16, b = null, x = /* @__PURE__ */ new Map(), Ae = 0, S = [], C = [], je = [], Me = null, Ne = -1, Pe = 0, Fe = !1, Ie = !1, w = /* @__PURE__ */ new Set(), Le = -1;
function Re() {
	return b = m({
		rowHeight: Oe,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: Ze
	}), b.el.classList.add("li-pane", "li-graph"), b.el;
}
function ze(e) {
	return T(e.id).length > 0;
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
function Ge(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of x.values()) if (r.group === e) for (let e of T(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function Ke(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function E(e, t) {
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
	t - Ae >= De && (x = new Map(u({ active: !0 }).nodes.map((e) => [e.id, e])), Ae = t), E(T(e), !0);
}
function Je(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function Ye(e, t) {
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
	}), r = y(be, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ h("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(y(xe, 11));
	let a = /* @__PURE__ */ g("div", {
		class: "li-gns-h",
		children: [
			r,
			n,
			t,
			i
		]
	}), o = e.gid;
	return w.has(o) && a.classList.add("collapsed"), a.onclick = () => {
		w.has(o) ? w.delete(o) : w.add(o), b?.setItems(it());
	}, i.onclick = (e) => {
		e.stopPropagation(), Ye(Ge(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => E(Ge(o), !0), a.onmouseleave = () => E(Ge(o), !1), a;
}
function $e(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", w.has(t.gid)), e;
}
function et(e) {
	let t = e.node, n = /* @__PURE__ */ h("span", { class: "li-gval" }), r = ze(t), i = y(t.kind === "computed" ? ye : r ? _e : ve, 13);
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
	if (e.child && a.classList.add("li-grow-child"), a.onmouseenter = () => E(T(t.id), !0), a.onmouseleave = () => E(T(t.id), !1), Ve(t) && t.source) {
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
	let e = C.length;
	for (let t of S) e += 1 + (w.has(t.gid) ? 0 : t.signals.length);
	return e;
}
function rt(e) {
	let t = e;
	for (let e of S) {
		if (t === 0) return {
			kind: "header",
			gid: e.gid,
			label: e.label,
			count: e.signals.length
		};
		if (--t, !w.has(e.gid)) {
			if (t < e.signals.length) return {
				kind: "signal",
				node: e.signals[t],
				child: !0
			};
			t -= e.signals.length;
		}
	}
	return t < C.length ? {
		kind: "signal",
		node: C[t],
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
	if (!b) return;
	let e = u({ active: !0 }).nodes;
	x = new Map(e.map((e) => [e.id, e])), Ae = performance.now();
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) if (!(r.internal || r.kind === "effect")) if (r.group !== void 0) {
		let e = t.get(r.group);
		e ? e.push(r) : t.set(r.group, [r]);
	} else n.push(r);
	S = [];
	for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), S.push({
		gid: e,
		label: Xe(e, n),
		signals: n
	});
	C = n, Fe = Ie, b.setItems(it()), Fe = !1, Ie = !1;
}
function ot() {
	E([], !1);
}
function st() {
	let e = performance.now();
	e - Pe >= De && (Pe = e, at());
}
function ct() {
	if (b) {
		for (let e of b.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Ie = !0, b.refresh();
	}
}
function lt(e) {
	let t = 0;
	for (let n of S) {
		let r = n.signals.findIndex((t) => t.id === e);
		if (r >= 0) return w.has(n.gid) && (w.delete(n.gid), b?.setItems(it())), t + 1 + r;
		t += 1 + (w.has(n.gid) ? 0 : n.signals.length);
	}
	let n = C.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function ut(e) {
	if (b === null) return;
	at();
	let t = lt(e);
	t < 0 || (Le = e, b.scrollToIndex(t));
}
function dt() {
	for (let e of je) e.remove();
	je = [], Me = null, Ne = -1, b?.destroy(), b = null, S = [], C = [], w.clear(), x = /* @__PURE__ */ new Map(), Ae = 0;
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
var D = null, _t = null, vt = null, O = "all", yt = null, k = null, bt = null, A = null, j = null, M = [], N = [], P = !1, F = !1, I = "", xt = 0, St = -1, L = -1, Ct = null;
function wt(e) {
	Ct = e;
}
function Tt(e) {
	j = e, Dt();
}
function Et(e) {
	F !== e && (F = e, e ? (kt(), Pt()) : At(), Dt());
}
function Dt() {
	j && (j.classList.toggle("inactive", !F), j.classList.toggle("off", P), j.title = F ? P ? "Paused" : "Live — capturing" : "Trace");
}
function Ot() {
	jt(), D = m({
		rowHeight: ft,
		key: (e) => e.seq,
		render: Ht
	}), A = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), A.append(y(Ce, 12)), f(A, () => Lt(!P));
	let e = /* @__PURE__ */ h("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(y(Se, 12)), f(e, () => Mt());
	let t = /* @__PURE__ */ h("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: ht.map((e) => /* @__PURE__ */ h("option", {
			value: e,
			children: e
		}))
	});
	t.value = O, t.addEventListener("change", () => {
		gt(t.value) && (O = t.value), jt();
	});
	let n = /* @__PURE__ */ h("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		I = n.value.trim().toLowerCase(), N = I ? M.filter((e) => e.name.toLowerCase().includes(I)) : [], R();
	}), k = /* @__PURE__ */ h("div", { class: "li-tr-scroll" }), k.append(D.el), bt = re(k), k.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== L && (L = Number(t), qe(L));
	}), k.addEventListener("pointerleave", () => {
		L = -1, ot();
	}), f(k, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (L = -1, ot(), Ct?.(Number(t)));
	}), yt = /* @__PURE__ */ g("div", {
		class: "li-pane li-trace",
		children: [/* @__PURE__ */ g("div", {
			class: "li-tr-bar",
			children: [
				A,
				t,
				n,
				e
			]
		}), k]
	}), yt;
}
function kt() {
	O !== "reads" && !_t && (_t = l([c.write], "samples")), O !== "writes" && !vt && (vt = l([c.read], "samples"));
}
function At() {
	_t?.stop(), _t = null, vt?.stop(), vt = null;
}
function jt() {
	At(), F && kt(), St = -1, R(), Pt();
}
function Mt() {
	M = [], N = [], St = -1, R();
}
function Nt(e) {
	mt = e, M.length > e && (M.length = e), N.length > e && (N.length = e), R();
}
function Pt() {
	if (P || D === null) return;
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
	O === "all" && e.sort((e, t) => s(e.s).t - s(t.s).t), Bt = !1;
	let r = (I ? N : M)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(Rt(t, n));
	if (i.reverse(), M = i.concat(M), I) {
		let e = i.filter((e) => e.name.toLowerCase().includes(I));
		e.length > 0 && (N = e.concat(N));
	}
	M.length > mt && (M.length = mt), N.length > mt && (N.length = mt), St = ((I ? N : M)[0]?.seq ?? -1) === r ? -1 : r, R();
}
function Ft() {
	Pt(), R(), requestAnimationFrame(() => D?.refresh());
}
function It() {
	At(), D = null, yt = null, k = null, bt?.(), bt = null, A = null, j = null, M = [], N = [], zt.clear(), Bt = !1, St = -1, P = !1, F = !1, I = "", O = "all", L = -1, Ct = null;
}
function Lt(e) {
	P = e, A?.replaceChildren(y(e ? we : Ce, 12)), Dt(), yt?.classList.toggle("li-tr-paused", e), e || Pt();
}
function R() {
	let e = I ? N : M;
	D?.setItems(O === "all" ? e : e.filter((e) => e.kind === (O === "writes" ? "write" : "read")));
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
	let l = s(e), ee = ce(l.prev, pt), u = ce(l.next, pt);
	return {
		seq: xt++,
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
var zt = /* @__PURE__ */ new Map(), Bt = !1;
function Vt(e) {
	let t = zt.get(e);
	if (t !== void 0) return t;
	if (!Bt) {
		Bt = !0;
		for (let e of u().nodes) zt.set(e.id, e.label);
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
var Gt = 138, Kt = 34, qt = 2 * Math.PI * Kt, Jt = qt * .75, Yt = 120, Xt = Yt / 1e3, Zt = 200, Qt = () => void 0, $t = () => !1, z = null, en = null, tn = null, nn = null, rn = 0, an = null, on = null, sn = 0, cn = 0, ln = 0, un = 0, dn = 0, fn = 0, pn = 0, mn = 0, hn = 0, B = 0, V = !1, gn = 0, _n = 0, vn = 0, yn = 0, H = [], bn = 0, xn = 0, Sn = 0, Cn = !1, wn = null, Tn = null, En = null, Dn = null, On = null, kn = 100, An = "", jn = "", Mn = !1, Nn = "", Pn = 0, Fn = 0, In = 0, Ln = 0, Rn = 0, zn = 0, Bn = 0, Vn = 0;
function U(e) {
	return e?.() ?? 0;
}
function Hn(e) {
	return () => (z?.(), e());
}
function W(e, t, n) {
	p(e, t, Hn(n), _);
}
function Un(e) {
	return ne(Hn(e), _);
}
var G = (e, t) => e * .6 + t / Xt * .4;
function K(e) {
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
	W(e, "stroke-dasharray", () => `${Jt * kn / 100} ${qt}`), W(e, "class", () => `li-garc h-${An}`);
	let t = /* @__PURE__ */ h("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(Un(() => String(kn))), W(t, "class", () => `li-gnum h-${An}`), [e, t];
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
	let t = Array(Gt).fill(-1);
	return ae(() => {
		z?.();
		let n = e.length - H.length;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (!i) continue;
			let a = r >= n ? H[r - n] ?? 0 : 0;
			if (a === t[r]) continue;
			t[r] = a;
			let o = Math.max(0, Math.min(20, a / 50 * 20));
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? Gn(a) : "");
		}
	}), /* @__PURE__ */ h("div", {
		class: "li-histo",
		title: J.frames,
		children: /* @__PURE__ */ h("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Gt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
}
function q(e, t, n = "", r = "") {
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
function rr() {
	let e = /* @__PURE__ */ h("span", { class: "li-perfh-fps" });
	e.append(Un(() => V ? `${Math.round(B)} fps` : "— fps")), W(e, "class", () => `li-perfh-fps ${Nn}`);
	let t = /* @__PURE__ */ h("div", {
		class: "li-hlabel",
		title: J.health
	});
	t.append(Un(() => V ? jn.toUpperCase() : "LOADING")), W(t, "class", () => Mn ? `li-hlabel h-${An}` : "li-hlabel");
	let n = /* @__PURE__ */ g("div", {
		class: "li-hstats",
		children: [t, q("lag", () => `${bn.toFixed(0)} · pk ${xn.toFixed(0)} ms`, "lo", J.lag)]
	});
	return n.append(ir("blocked", () => {
		if (!Zn) return "—";
		let e = U(Dn);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!Zn) return "";
		let e = U(Dn);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, J.blocked)), n.append(ir("CLS", () => U(wn).toFixed(2), () => {
		let e = U(wn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, J.cls)), n.append(ir("LCP", () => {
		let e = U(Tn);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => Kn(U(Tn), 2500, 4e3), J.lcp)), n.append(ir("INP", () => {
		let e = U(En);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => Kn(U(En), 200, 500), J.inp)), /* @__PURE__ */ g("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ g("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ h("span", {
					title: J.fps,
					children: "Performance"
				}), e]
			}),
			nr(),
			/* @__PURE__ */ g("div", {
				class: "li-hblock",
				children: [tr(), n]
			}),
			q("frame time", () => `${yn.toFixed(1)} ms`, "", J.frameTime),
			ar() ? or() : null,
			q("writes / s", () => K(cn), "hi", J.writes),
			q("reads / s", () => K(sn), "hi", J.reads),
			q("computeds / s", () => K(ln), "", J.computedsRate),
			q("effect runs / s", () => K(un), "lo", J.effectRuns),
			q("flushes / s", () => K(dn), "lo", J.flushes),
			q("effects / flush", () => String(mn), "", J.effectsPerFlush),
			q("flush time", () => `${hn.toFixed(1)} ms`, "", J.flushTime),
			q("creates / s", () => K(fn), "lo", J.creates),
			q("disposes / s", () => K(pn), "lo", J.disposes),
			q("states", () => String(Pn), "", J.states),
			q("computeds", () => String(Fn), "", J.computeds),
			ir("unread", () => String(Vn), () => Vn > 0 ? "h-warn" : "", J.unread),
			q("effects", () => String(In), "", J.effects),
			q("views", () => String(Ln), "", J.views),
			q("sources", () => String(Rn), "", J.sources),
			q("scopes", () => String(zn), "", J.scopes),
			q("channels", () => String(Bn), "", J.channels)
		]
	});
}
function ir(e, t, n, r = "") {
	let i = q(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && W(a, "class", () => `li-stat-v ${n()}`), i;
}
function ar() {
	return performance.memory;
}
function or() {
	return q("heap", () => {
		let e = On?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", J.heap);
}
function sr() {
	let e = an?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, c = on?.read()?.["loom:flush"];
	sn = G(sn, t), cn = G(cn, n), un = G(un, r), ln = G(ln, i), fn = G(fn, a), pn = G(pn, o), dn = G(dn, c?.count ?? 0);
	let l = s(c?.samples.at(-1));
	if (l !== void 0 && (mn = l.batchSize, hn = l.durationMs), !V) Mn = !1, Nn = "";
	else {
		let e = Wn(B);
		kn = e.score, An = e.key, jn = e.label, Mn = !0, Nn = B >= 55 ? "h-ok" : B >= 30 ? "h-warn" : "h-bad";
	}
	return ++rn;
}
function cr() {
	let e = !$t();
	if (Qt() === "stats" && e) {
		let e = ee();
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
			if (yn = e, H.push(e), H.length > Gt && H.shift(), gn += e, _n++, gn >= 500) {
				let e = _n * 1e3 / gn;
				B = V ? B * .5 + e * .5 : e, V = !0, gn = 0, _n = 0;
			}
		}
		vn = t;
	};
	tn = requestAnimationFrame(e);
}
function dr(t) {
	Qt = t.activeTab, $t = t.isMinimized, an = l([
		c.read,
		c.write,
		c.compute,
		c.effect,
		c.create,
		c.dispose
	]), on = l([c.flush], "samples"), z = r(sr, Yt, _), ae(() => {
		z?.(), a(cr);
	}, {
		defer: !0,
		maxStale: Yt
	});
	let n;
	return nn = e(() => {
		wn = i(Jn, 0, _), Tn = i(Yn, 0, _), En = i(Xn, 0, _), Dn = i(Qn, 0, _), ar() && (On = r(() => ar()?.usedJSHeapSize ?? 0, 5e3, _)), n = rr();
	}, _), ur(), n;
}
function fr() {
	nn?.pause();
}
function pr() {
	nn?.resume();
}
function mr() {
	an?.stop(), an = null, on?.stop(), on = null, z?.stop(), z = null, en != null && clearInterval(en), en = null, document.removeEventListener("visibilitychange", lr), tn != null && cancelAnimationFrame(tn), tn = null, nn?.stop(), nn = null, On = wn = Tn = En = Dn = null, rn = 0, sn = cn = ln = un = dn = 0, fn = pn = 0, mn = hn = 0, B = 0, V = !1, gn = _n = vn = yn = 0, H.length = 0, bn = xn = 0, Cn = !1, Mn = !1, kn = 100, An = jn = Nn = "", Pn = Fn = In = Ln = 0, Rn = zn = Bn = Vn = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var hr = {
	system: he,
	light: pe,
	dark: me
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
], Y = null, _r = null, X = null, vr = null, yr = [], br = null, Z = null, xr = /* @__PURE__ */ new Map(), Sr = null, Cr = [
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
function Mr(n = document.body) {
	if (Y || typeof document > "u") return;
	if (t({ inspect: !0 }), !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${v}-css`, e.textContent = se, document.head.append(e);
	}
	Z = o("stats", _);
	let r = Q().theme(), i = /* @__PURE__ */ h("span", { class: "li-menu-val" }), a = () => {
		Y?.setAttribute("data-theme", r), _r?.setAttribute("data-theme", r), i.innerHTML = ue(hr[r], 13), s.title = `Theme: ${r} (click to cycle)`;
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
		r = e[(e.indexOf(r) + 1) % e.length] ?? "system", Q().theme(r), a();
	});
	let c = /* @__PURE__ */ h("div", {
		class: "li-menu",
		hidden: !0
	});
	c.id = `${v}-menu`, c.append(s), _r = c;
	let l = Q().logSize(), ee = /* @__PURE__ */ h("span", { class: "li-menu-val" }), u = () => {
		ee.textContent = `${l / 1e3}k`, Nt(l);
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
		let e = !!Y?.classList.toggle("li-min");
		ie(e), Q().min(e), e ? br?.pause() : br?.resume(), Et(!e && Z?.() === "trace");
	});
	let ce = /* @__PURE__ */ g("div", {
		class: "li-bar",
		children: [
			/* @__PURE__ */ g("span", {
				class: "li-brand",
				children: [Ee(15), /* @__PURE__ */ h("b", { children: "Loom" })]
			}),
			/* @__PURE__ */ h("span", { class: "li-sp" }),
			p,
			m
		]
	}), le;
	br = e(() => {
		le = dr({
			activeTab: () => Z?.(),
			isMinimized: () => Y?.classList.contains("li-min") ?? !1
		});
	}, _), oe && br.pause();
	let pe = /* @__PURE__ */ new Map(), me = /* @__PURE__ */ new Map();
	X = /* @__PURE__ */ h("div", { class: "li-body" });
	for (let e of gr) {
		let t = e.id === "stats" ? le : e.id === "graph" ? Re() : Ot();
		pe.set(e.id, t), X.append(t);
	}
	wt((e) => {
		Z?.("graph"), ut(e);
	});
	let he = /* @__PURE__ */ h("div", { class: "li-tabscroll" });
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
	Y = /* @__PURE__ */ g("div", { children: [
		ce,
		_e,
		X,
		ve
	] }), Y.id = v, oe && Y.classList.add("li-min"), a(), kr(ce, Y), Ar(ve, Y), vr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!c.hidden && (t === null || !c.contains(t)) && e.target !== p && te();
	}, document.addEventListener("pointerdown", vr), n.append(Y), document.body.append(c);
	let ye = Q().size(), be = Q().pos();
	if (ye && (Y.style.width = `${Math.max(240, Math.min(ye.width, window.innerWidth - 16))}px`, Y.style.height = `${Math.max(160, Math.min(ye.height, window.innerHeight - 16))}px`), be) {
		let { left: e, top: t } = Er(Y, be.left, be.top);
		Y.style.left = `${e}px`, Y.style.top = `${t}px`, Y.style.right = "auto", Y.style.bottom = "auto";
	}
	ae(() => {
		let e = Z?.();
		Sr && Sr !== e && X && xr.set(Sr, X.scrollTop), e === "stats" ? pr() : fr(), e !== "graph" && ot();
		for (let t of gr) {
			let n = t.id === e, r = pe.get(t.id), i = me.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && X) {
			let t = xr.get(e) ?? 0, n = Math.max(0, X.scrollHeight - X.clientHeight);
			X.scrollTop = Math.min(t, n), e === "graph" ? ct() : e === "trace" && Ft();
		}
		Et(e === "trace" && Y?.classList.contains("li-min") !== !0), Sr = e ?? null;
	}), yr.push(re(X), re(he, { axis: "x" }));
}
function Nr() {
	mr();
	for (let e of yr) e();
	yr.length = 0, oe(), br?.stop(), br = null, vr && document.removeEventListener("pointerdown", vr), vr = null, _r?.remove(), _r = null, Y?.remove(), Y = null, X = null, Z = null, xr.clear(), Sr = null, dt(), It();
}
function Pr() {
	return Y !== null;
}
function Fr(e = document.body) {
	Y ? Nr() : Mr(e);
}
//#endregion
export { Pr as inspectorMounted, Mr as mountInspector, Fr as toggleInspector, Nr as unmountInspector };
