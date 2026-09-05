import { O as e, S as t, T as n, i as r, v as i, w as a } from "./loom-B6598vHo.js";
import { c as o } from "./ownership-base-hl0GKMLF.js";
import { _ as s, f as c, n as l, p as u, t as ee, v as te } from "./dom-Db8Yfyuc.js";
import { i as d, n as f } from "./events-CbzB9obJ.js";
import { t as ne } from "./motion-XhBP-ODU.js";
import { bindStorage as p, codecs as m, storageSlot as h } from "./storage.js";
import { virtualList as re } from "./virtual-list.js";
import "./defer.js";
import { a as ie, i as g, n as _, o as ae, r as v } from "./observe-fsc1ylyK.js";
import { jsx as y, jsxs as b } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var x = { internal: !0 }, oe = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;flex:auto;align-items:flex-end;gap:1px;min-width:0;margin-top:6px;display:flex;overflow-x:auto}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", S = "loom-inspector";
//#endregion
//#region src/devtools/format.ts
function se(e, t) {
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
function Te(e, t) {
	return we(le(e, t));
}
function Ee(e) {
	return we(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var De = 300, Oe = 22, ke = 16, C = null, w = /* @__PURE__ */ new Map(), Ae = 0, je = [], Me = [], Ne = [], Pe = null, Fe = -1, Ie = 0, Le = !1, Re = !1, T = /* @__PURE__ */ new Set(), ze = -1;
function Be() {
	return C = re({
		rowHeight: Oe,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: et
	}), C.el.classList.add("li-pane", "li-graph"), C.el;
}
function Ve(e) {
	return qe(e.id).length > 0;
}
function He(e, t) {
	if (typeof t == "number") {
		let n = Number(e);
		return Number.isNaN(n) ? t : n;
	}
	return e;
}
function Ue(e) {
	if (e.kind !== "state" || !e.source) return !1;
	let t = e.value;
	return t === null || typeof t == "number" || typeof t == "string" || typeof t == "boolean";
}
function We(e, t, n, r = !1) {
	if (Fe === n) return;
	let i = e.querySelector(".li-gval");
	if (!i) return;
	let a = se(t, ke);
	!r && !Le && e.dataset.prev !== void 0 && e.dataset.prev !== a && Ze(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${ce(t)}`, e.dataset.prev = a;
}
function Ge(e, t, n, r) {
	let i = t();
	if (typeof i == "boolean") {
		t(!i), We(r, t(), e, !0), Ke(e, r);
		return;
	}
	if (i !== null && typeof i != "number" && typeof i != "string") return;
	let a = document.createElement("input");
	a.className = "li-gedit", a.value = typeof i == "string" ? i : String(i), Pe = a, Fe = e, n.replaceWith(a), a.focus(), a.select();
	let o = () => {
		Pe = null, Fe = -1, a.parentNode && a.replaceWith(n);
	}, s = () => {
		Pe === a && (t(He(a.value, i)), o(), We(r, t(), e, !0), Ke(e, r));
	};
	a.onblur = s, a.onkeydown = (e) => {
		e.key === "Enter" ? s() : e.key === "Escape" && o();
	};
}
function Ke(e, t) {
	t.matches(":hover") && E(qe(e), !0);
}
function qe(e) {
	let t = [], n = /* @__PURE__ */ new Set([e]), r = w.get(e), i = r ? [...r.subs] : [];
	for (; i.length > 0;) {
		let e = i.shift();
		if (e === void 0 || n.has(e)) continue;
		n.add(e);
		let r = w.get(e);
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
	for (let r of w.values()) if (r.group === e) for (let e of qe(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function Ye(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function E(e, t) {
	for (let e of Ne) e.remove();
	if (Ne = [], t) for (let t of e) {
		let e = Ye(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), Ne.push(n);
	}
}
function Xe(e) {
	let t = performance.now();
	t - Ae >= De && (w = new Map(ie({ active: !0 }).nodes.map((e) => [e.id, e])), Ae = t), E(qe(e), !0);
}
function Ze(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function Qe(e, t) {
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
function $e(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `props #${e}`;
}
function et(e, t) {
	if (e.kind === "header") return t ? nt(t, e) : tt(e);
	let n = t ? it(t, e) : rt(e);
	return e.node.id === ze && (Ze(n), ze = -1), n;
}
function tt(e) {
	let t = /* @__PURE__ */ y("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ y("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = Te(ye, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ y("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(Te(be, 11));
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
	}, a.onmouseenter = () => E(Je(o), !0), a.onmouseleave = () => E(Je(o), !1), a;
}
function nt(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", T.has(t.gid)), e;
}
function rt(e) {
	let t = e.node, n = /* @__PURE__ */ y("span", { class: "li-gval" }), r = Ve(t), i = Te(t.kind === "computed" ? ve : r ? ge : _e, 13);
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
	if (e.child && o.classList.add("li-grow-child"), o.onmouseenter = () => E(qe(t.id), !0), o.onmouseleave = () => E(qe(t.id), !1), Ue(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => Ge(t.id, e, n, o);
	}
	return We(o, t.value, t.id), o;
}
function it(e, t) {
	return We(e, t.node.value, t.node.id), e;
}
function at() {
	let e = Me.length;
	for (let t of je) e += 1 + (T.has(t.gid) ? 0 : t.signals.length);
	return e;
}
function ot(e) {
	let t = e;
	for (let e of je) {
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
	return t < Me.length ? {
		kind: "signal",
		node: Me[t],
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
	let e = ie({ active: !0 }).nodes;
	w = new Map(e.map((e) => [e.id, e])), Ae = performance.now();
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) if (!(r.internal || r.kind === "effect")) {
		if (r.group !== void 0) {
			let e = t.get(r.group);
			e ? e.push(r) : t.set(r.group, [r]);
		} else n.push(r);
	}
	je = [];
	for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), je.push({
		gid: e,
		label: $e(e, n),
		signals: n
	});
	Me = n, Le = Re, C.setItems(st()), Le = !1, Re = !1;
}
function lt() {
	E([], !1);
}
function ut() {
	let e = performance.now();
	e - Ie >= De && (Ie = e, ct());
}
function dt() {
	if (C) {
		for (let e of C.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Re = !0, C.refresh();
	}
}
function ft(e) {
	let t = 0;
	for (let n of je) {
		let r = n.signals.findIndex((t) => t.id === e);
		if (r >= 0) return T.has(n.gid) && (T.delete(n.gid), C?.setItems(st())), t + 1 + r;
		t += 1 + (T.has(n.gid) ? 0 : n.signals.length);
	}
	let n = Me.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function pt(e) {
	if (C === null) return;
	ct();
	let t = ft(e);
	t < 0 || (ze = e, C.scrollToIndex(t));
}
function mt() {
	for (let e of Ne) e.remove();
	Ne = [], Pe = null, Fe = -1, C?.stop(), C = null, je = [], Me = [], T.clear(), w = /* @__PURE__ */ new Map(), Ae = 0;
}
//#endregion
//#region src/devtools/trace.tsx
var ht = 22, gt = 200, _t = 1e3, vt = [
	"writes",
	"reads",
	"all"
];
function yt(e) {
	return vt.includes(e);
}
var D = null, bt = null, xt = null, O = "all", St = null, k = null, Ct = null, A = null, j = null, M = [], N = [], P = !1, F = !1, I = "", wt = 0, Tt = -1, L = -1, Et = null;
function Dt(e) {
	Et = e;
}
function Ot(e) {
	j = e, At();
}
function kt(e) {
	F !== e && (F = e, e ? (Mt(), Lt()) : Nt(), At());
}
function At() {
	j && (j.classList.toggle("inactive", !F), j.classList.toggle("off", P), j.title = F ? P ? "Paused" : "Live — capturing" : "Trace");
}
function jt() {
	Pt(), D = re({
		rowHeight: ht,
		key: (e) => e.seq,
		render: Gt
	}), A = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), A.append(Te(Se, 12)), f(A, () => Bt(!P));
	let e = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(Te(xe, 12)), f(e, () => Ft());
	let t = /* @__PURE__ */ y("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: vt.map((e) => /* @__PURE__ */ y("option", {
			value: e,
			children: e
		}))
	});
	t.value = O, t.addEventListener("change", () => {
		yt(t.value) && (O = t.value), Pt();
	});
	let n = /* @__PURE__ */ y("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		I = n.value.trim().toLowerCase(), N = I ? M.filter((e) => e.name.toLowerCase().includes(I)) : [], R();
	}), k = /* @__PURE__ */ y("div", { class: "li-tr-scroll" }), k.append(D.el), Ct = ne(k, { transition: 120 }), k.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== L && (L = Number(t), Xe(L));
	}), k.addEventListener("pointerleave", () => {
		L = -1, lt();
	}), f(k, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (L = -1, lt(), Et?.(Number(t)));
	}), St = /* @__PURE__ */ b("div", {
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
	}), St;
}
function Mt() {
	O !== "reads" && !bt && (bt = v([_.write], "samples")), O !== "writes" && !xt && (xt = v([_.read], "samples"));
}
function Nt() {
	bt?.stop(), bt = null, xt?.stop(), xt = null;
}
function Pt() {
	Nt(), F && Mt(), Tt = -1, R(), Lt();
}
function Ft() {
	M = [], N = [], Tt = -1, R();
}
function It(e) {
	_t = e, M.length > e && (M.length = e), N.length > e && (N.length = e), R();
}
function Lt() {
	if (P || D === null) return;
	let e = [], t = bt?.read()["loom:write"]?.samples;
	if (t) for (let n of t) e.push({
		s: n,
		kind: "write"
	});
	let n = xt?.read()["loom:read"]?.samples;
	if (n) for (let t of n) e.push({
		s: t,
		kind: "read"
	});
	if (e.length === 0) return;
	O === "all" && e.sort((e, t) => g(e.s).t - g(t.s).t), Ut = !1;
	let r = (I ? N : M)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(Vt(t, n));
	if (i.reverse(), M = i.concat(M), I) {
		let e = i.filter((e) => e.name.toLowerCase().includes(I));
		e.length > 0 && (N = e.concat(N));
	}
	M.length > _t && (M.length = _t), N.length > _t && (N.length = _t), Tt = ((I ? N : M)[0]?.seq ?? -1) === r ? -1 : r, R();
}
function Rt() {
	Lt(), R(), requestAnimationFrame(() => D?.refresh());
}
function zt() {
	Nt(), D = null, St = null, k = null, Ct?.(), Ct = null, A = null, j = null, M = [], N = [], Ht.clear(), Ut = !1, Tt = -1, P = !1, F = !1, I = "", O = "all", L = -1, Et = null;
}
function Bt(e) {
	P = e, A?.replaceChildren(Te(e ? Ce : Se, 12)), At(), St?.classList.toggle("li-tr-paused", e), e || Lt();
}
function R() {
	let e = I ? N : M;
	D?.setItems(O === "all" ? e : e.filter((e) => e.kind === (O === "writes" ? "write" : "read")));
}
function Vt(e, t) {
	let n = g(e), r = n.id, i = Wt(r), a = qt(n.t), o = n.by, s = o === void 0 ? "" : `by ${Wt(o)}`;
	if (t === "read") return {
		seq: wt++,
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
	let c = g(e), l = se(c.prev, gt), u = se(c.next, gt);
	return {
		seq: wt++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: l,
		prevCls: ce(c.prev),
		nextText: u,
		nextCls: ce(c.next),
		srcText: s,
		full: `${i}: ${l} → ${u} ${s || "(external)"}`
	};
}
var Ht = /* @__PURE__ */ new Map(), Ut = !1;
function Wt(e) {
	let t = Ht.get(e);
	if (t !== void 0) return t;
	if (!Ut) {
		Ut = !0;
		for (let e of ie().nodes) Ht.set(e.id, e.label);
		let t = Ht.get(e);
		if (t !== void 0) return t;
	}
	return `#${e}`;
}
function Gt(e, t) {
	let n = t ?? Kt(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3], a = i.children[0], o = i.children[1], s = i.children[2], c = i.children[3];
	return e.kind === "read" ? (a.textContent = "", a.className = "li-tr-val", o.textContent = "", s.textContent = "", s.className = "li-tr-val") : (a.textContent = e.prevText, a.className = `li-tr-val ${e.prevCls}`, o.textContent = " → ", s.textContent = e.nextText, s.className = `li-tr-val ${e.nextCls}`), c.textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === Tt), n;
}
function Kt() {
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
function qt(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
//#endregion
//#region src/devtools/stats.tsx
var Jt = 138, Yt = 34, Xt = 2 * Math.PI * Yt, Zt = Xt * .75, Qt = 120, $t = Qt / 1e3, en = 200, tn = () => void 0, nn = () => !1, z = null, rn = null, an = null, B = null, V = !1, on = null, sn = 0, cn = null, ln = null, un = 0, dn = 0, fn = 0, pn = 0, mn = 0, hn = 0, gn = 0, _n = 0, vn = 0, H = 0, U = !1, yn = 0, bn = 0, xn = 0, Sn = 0, Cn = [], wn = 0, Tn = 0, En = 0, Dn = !1, On = null, kn = null, An = null, jn = null, Mn = null, Nn = 100, Pn = "", Fn = "", In = !1, Ln = "", Rn = 0, zn = 0, Bn = 0, Vn = 0, Hn = 0, Un = 0, Wn = 0, Gn = 0;
function W(e) {
	return e?.() ?? 0;
}
function Kn(e) {
	return () => (z?.(), e());
}
function qn(e, t, n) {
	l(e, t, Kn(n), x);
}
function Jn(e) {
	return c(Kn(e), x);
}
var G = (e, t) => e * .6 + t / $t * .4;
function K(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function Yn(e) {
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
function Xn(e) {
	let t = 1e3 / e;
	return t >= 55 ? "h-ok" : t >= 30 ? "h-warn" : "h-bad";
}
function Zn(e, t, n) {
	return e ? e <= t ? "h-ok" : e <= n ? "h-warn" : "h-bad" : "";
}
function Qn(e) {
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
var $n = Qn((e) => {
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
}), er = Qn((e) => {
	let t = new PerformanceObserver((t) => {
		for (let n of t.getEntries()) n.entryType === "largest-contentful-paint" && e(n.startTime);
	});
	return t.observe({
		type: "largest-contentful-paint",
		buffered: !0
	}), t;
}), tr = Qn((e) => {
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
}), nr = typeof PerformanceObserver == "function" && PerformanceObserver.supportedEntryTypes?.includes("longtask") === !0, rr = Qn((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let e of n.getEntries()) t += e.duration;
		e(t);
	});
	return n.observe({
		type: "longtask",
		buffered: !0
	}), n;
});
function ir() {
	return [/* @__PURE__ */ y("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: Yt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${Xt}`
	}), /* @__PURE__ */ y("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function ar() {
	let e = /* @__PURE__ */ y("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: Yt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	qn(e, "stroke-dasharray", () => `${Zt * Nn / 100} ${Xt}`), qn(e, "class", () => `li-garc h-${Pn}`);
	let t = /* @__PURE__ */ y("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(Jn(() => String(Nn))), qn(t, "class", () => `li-gnum h-${Pn}`), [e, t];
}
function or() {
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
				r: Yt,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${Zt} ${Xt}`
			}),
			u(Kn(() => In), ar, ir),
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
function sr() {
	let e = [];
	for (let t = 0; t < Jt; t++) e.push(/* @__PURE__ */ y("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	let t = Array(Jt).fill(-1), n = () => {
		z?.();
		let n = e.length - Cn.length;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (!i) continue;
			let a = r >= n ? Cn[r - n] ?? 0 : 0;
			if (a === t[r]) continue;
			t[r] = a;
			let o = Math.max(0, Math.min(20, a / 50 * 20));
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? Xn(a) : "");
		}
	}, r = /* @__PURE__ */ y("div", {
		class: "li-histo",
		title: J.frames,
		children: /* @__PURE__ */ y("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Jt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
	return ee(r, n, x), r;
}
function q(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ y("span", { class: `li-stat-v ${n}` });
	return i.append(c(Kn(t), x)), /* @__PURE__ */ b("div", {
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
function cr() {
	let e = /* @__PURE__ */ y("span", { class: "li-perfh-fps" });
	e.append(Jn(() => U ? `${Math.round(H)} fps` : "— fps")), qn(e, "class", () => `li-perfh-fps ${Ln}`);
	let t = /* @__PURE__ */ y("div", {
		class: "li-hlabel",
		title: J.health
	});
	t.append(Jn(() => U ? Fn.toUpperCase() : "LOADING")), qn(t, "class", () => In ? `li-hlabel h-${Pn}` : "li-hlabel");
	let n = /* @__PURE__ */ b("div", {
		class: "li-hstats",
		children: [t, q("lag", () => `${wn.toFixed(0)} · pk ${Tn.toFixed(0)} ms`, "lo", J.lag)]
	});
	return n.append(lr("blocked", () => {
		if (!nr) return "—";
		let e = W(jn);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!nr) return "";
		let e = W(jn);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, J.blocked)), n.append(lr("CLS", () => W(On).toFixed(2), () => {
		let e = W(On);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, J.cls)), n.append(lr("LCP", () => {
		let e = W(kn);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => Zn(W(kn), 2500, 4e3), J.lcp)), n.append(lr("INP", () => {
		let e = W(An);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => Zn(W(An), 200, 500), J.inp)), /* @__PURE__ */ b("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ b("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ y("span", {
					title: J.fps,
					children: "Performance"
				}), e]
			}),
			sr(),
			/* @__PURE__ */ b("div", {
				class: "li-hblock",
				children: [or(), n]
			}),
			q("frame time", () => `${Sn.toFixed(1)} ms`, "", J.frameTime),
			ur() ? dr() : null,
			q("writes / s", () => K(dn), "hi", J.writes),
			q("reads / s", () => K(un), "hi", J.reads),
			q("computeds / s", () => K(fn), "", J.computedsRate),
			q("effect runs / s", () => K(pn), "lo", J.effectRuns),
			q("flushes / s", () => K(mn), "lo", J.flushes),
			q("effects / flush", () => String(_n), "", J.effectsPerFlush),
			q("flush time", () => `${vn.toFixed(1)} ms`, "", J.flushTime),
			q("creates / s", () => K(hn), "lo", J.creates),
			q("disposes / s", () => K(gn), "lo", J.disposes),
			q("states", () => String(Rn), "", J.states),
			q("computeds", () => String(zn), "", J.computeds),
			lr("unread", () => String(Gn), () => Gn > 0 ? "h-warn" : "", J.unread),
			q("effects", () => String(Bn), "", J.effects),
			q("views", () => String(Vn), "", J.views),
			q("sources", () => String(Hn), "", J.sources),
			q("scopes", () => String(Un), "", J.scopes),
			q("channels", () => String(Wn), "", J.channels)
		]
	});
}
function lr(e, t, n, r = "") {
	let i = q(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && qn(a, "class", () => `li-stat-v ${n()}`), i;
}
function ur() {
	return performance.memory;
}
function dr() {
	return q("heap", () => {
		let e = Mn?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", J.heap);
}
function fr() {
	let e = cn?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, s = ln?.read()?.["loom:flush"];
	un = G(un, t), dn = G(dn, n), pn = G(pn, r), fn = G(fn, i), hn = G(hn, a), gn = G(gn, o), mn = G(mn, s?.count ?? 0);
	let c = g(s?.samples.at(-1));
	if (c !== void 0 && (_n = c.batchSize, vn = c.durationMs), !U) In = !1, Ln = "";
	else {
		let e = Yn(H);
		Nn = e.score, Pn = e.key, Fn = e.label, In = !0, Ln = H >= 55 ? "h-ok" : H >= 30 ? "h-warn" : "h-bad";
	}
	return ++sn;
}
function pr() {
	let e = !nn();
	if (tn() === "stats" && e) {
		let e = ae();
		Rn = e.states, zn = e.computeds, Bn = e.effects - e.targetedEffects, Vn = e.targetedEffects, Hn = e.sources, Un = e.scopes, Wn = e.channels, Gn = e.unread;
	} else tn() === "graph" && e ? ut() : tn() === "trace" && e && Lt();
}
function mr() {
	document.hidden && (Dn = !0);
}
function hr() {
	En = performance.now() + en, rn = setInterval(() => {
		let e = performance.now(), t = En;
		if (En = e + en, document.hidden) {
			Dn = !0;
			return;
		}
		if (Dn) {
			Dn = !1;
			return;
		}
		wn = Math.max(0, e - t), wn > Tn && (Tn = wn);
	}, en), document.addEventListener("visibilitychange", mr), xn = 0;
	let e = (t) => {
		if (an = requestAnimationFrame(e), xn) {
			let e = Math.min(t - xn, 1e3);
			if (Sn = e, Cn.push(e), Cn.length > Jt && Cn.shift(), yn += e, bn++, yn >= 500) {
				let e = bn * 1e3 / yn;
				H = U ? H * .5 + e * .5 : e, U = !0, yn = 0, bn = 0;
			}
		}
		xn = t;
	};
	an = requestAnimationFrame(e);
}
function gr(n) {
	tn = n.activeTab, nn = n.isMinimized, cn = v([
		_.read,
		_.write,
		_.compute,
		_.effect,
		_.create,
		_.dispose
	]), ln = v([_.flush], "samples"), z = i(fr, Qt, x);
	let r;
	return on = t(() => {
		On = a($n, 0, x), kn = a(er, 0, x), An = a(tr, 0, x), jn = a(rr, 0, x), ur() && (Mn = i(() => ur()?.usedJSHeapSize ?? 0, 5e3, x)), r = cr();
	}, x), ee(r, () => {
		z?.(), e(pr);
	}, {
		...x,
		defer: !0,
		maxStale: Qt
	}), B = r, V = !1, hr(), r;
}
function _r() {
	on?.pause(), B && !V && (V = !0, s(B));
}
function vr() {
	on?.resume(), B && V && (V = !1, te(B));
}
function yr() {
	cn?.stop(), cn = null, ln?.stop(), ln = null, z?.stop(), z = null, rn != null && clearInterval(rn), rn = null, typeof document < "u" && document.removeEventListener("visibilitychange", mr), an != null && cancelAnimationFrame(an), an = null, on?.stop(), on = null, B = null, V = !1, Mn = On = kn = An = jn = null, sn = 0, un = dn = fn = pn = mn = 0, hn = gn = 0, _n = vn = 0, H = 0, U = !1, yn = bn = xn = Sn = 0, Cn.length = 0, wn = Tn = 0, Dn = !1, In = !1, Nn = 100, Pn = Fn = Ln = "", Rn = zn = Bn = Vn = 0, Hn = Un = Wn = Gn = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var br = {
	system: me,
	light: fe,
	dark: pe
}, xr = [
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
], Y = null, Sr = null, X = null, Cr = null, wr = [], Tr = null, Er = null, Dr = null, Or = null, Z = null, kr = /* @__PURE__ */ new Map(), Ar = null, jr = [
	1e3,
	5e3,
	25e3
], Mr = null;
function Q() {
	if (Mr) return Mr;
	Er = new AbortController();
	let e = { signal: Er.signal }, t = {
		theme: n("system", x),
		min: n(!1, x),
		logSize: n(1e3, x),
		pos: n(null, x),
		size: n(null, x)
	};
	return p(t.theme, h(`${S}-theme`, m.string([
		"system",
		"light",
		"dark"
	])), e), p(t.min, h(`${S}-min`, m.boolean), e), p(t.logSize, h(`${S}-logsize`, {
		...m.number(),
		validate: (e) => jr.includes(e)
	}), e), p(t.pos, h(`${S}-pos`, m.json((e) => typeof e == "object" && !!e && "left" in e && "top" in e && typeof e.left == "number" && Number.isFinite(e.left) && typeof e.top == "number" && Number.isFinite(e.top))), e), p(t.size, h(`${S}-size`, m.json((e) => typeof e == "object" && !!e && "width" in e && "height" in e && typeof e.width == "number" && e.width > 0 && typeof e.height == "number" && e.height > 0)), e), Mr = t, t;
}
function $(e) {
	let t = window.devicePixelRatio || 1;
	return Math.round(e * t) / t;
}
function Nr(e, t, n, r) {
	let i = e.offsetWidth, a = Math.min(80, i);
	return {
		left: $(Math.min(window.innerWidth - a, Math.max(a - i, n))),
		top: $(Math.min(window.innerHeight - t, Math.max(0, r)))
	};
}
function Pr(e, t, n) {
	let r = Math.max(0, window.innerWidth - e.offsetWidth), i = Math.max(0, window.innerHeight - e.offsetHeight);
	return {
		left: $(Math.max(0, Math.min(t, r))),
		top: $(Math.max(0, Math.min(n, i)))
	};
}
function Fr(e, t, n, r, i) {
	Or?.();
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto";
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s = () => {};
	s = d(e, n, {
		move: (e) => r(e, a),
		end: () => {
			Or === s && (Or = null), document.body.style.userSelect = o, i();
		}
	}), Or = s;
}
function Ir(e, t) {
	e.addEventListener("pointerdown", (n) => {
		if (n.target?.closest("button")) return;
		n.preventDefault();
		let r = n.clientX, i = n.clientY, a = null;
		e.style.cursor = "grabbing", Fr(e, t, n, (n, o) => {
			let { left: s, top: c } = Nr(t, e.offsetHeight || 40, o.left + n.clientX - r, o.top + n.clientY - i);
			t.style.left = `${s}px`, t.style.top = `${c}px`, a = {
				left: s,
				top: c
			};
		}, () => {
			e.style.cursor = "", a && Q().pos(a);
		});
	});
}
function Lr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		n.preventDefault(), n.stopPropagation();
		let r = n.clientX, i = n.clientY, a = null;
		Fr(e, t, n, (e, n) => {
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
function Rr(e) {
	return we(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function zr(e) {
	if (Y || typeof document > "u") return;
	let i = e ?? document.body;
	if (Dr = r({ inspect: !0 }).inspect ?? !1, !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${S}-css`, e.textContent = oe, document.head.append(e);
	}
	Z = n("stats", x);
	let a = Q().theme(), o = /* @__PURE__ */ y("span", { class: "li-menu-val" }), c = () => {
		Y?.setAttribute("data-theme", a), Sr?.setAttribute("data-theme", a), o.innerHTML = le(br[a], 13), l.title = `Theme: ${a} (click to cycle)`;
	}, l = /* @__PURE__ */ b("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ y("span", { children: "Theme" }), o]
	});
	f(l, () => {
		let e = [
			"system",
			"light",
			"dark"
		];
		a = e[(e.indexOf(a) + 1) % e.length] ?? "system", Q().theme(a), c();
	});
	let u = /* @__PURE__ */ y("div", {
		class: "li-menu",
		hidden: !0
	});
	u.id = `${S}-menu`, u.append(l), Sr = u;
	let d = Q().logSize(), p = /* @__PURE__ */ y("span", { class: "li-menu-val" }), m = () => {
		p.textContent = `${d / 1e3}k`, It(d);
	}, h = /* @__PURE__ */ b("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ y("span", { children: "Log size" }), p]
	});
	f(h, () => {
		d = jr[(jr.indexOf(d) + 1) % jr.length] ?? 1e3, Q().logSize(d), m();
	}), u.append(h), m();
	let re = () => {
		u.hidden = !0;
	}, ie = /* @__PURE__ */ b("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ y("span", { children: "Hide" }), /* @__PURE__ */ y("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	f(ie, () => {
		re(), Br();
	}), u.append(ie);
	let g = /* @__PURE__ */ y("button", {
		type: "button",
		title: "Settings"
	});
	g.append(Rr(he)), f(g, (e) => {
		if (e.stopPropagation(), !u.hidden) {
			re();
			return;
		}
		u.hidden = !1;
		let t = g.getBoundingClientRect(), n = u.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), u.style.left = `${Math.max(8, r)}px`, u.style.top = `${Math.max(8, i)}px`;
	});
	let _ = /* @__PURE__ */ y("button", { type: "button" }), ae = (e) => {
		_.title = e ? "Expand" : "Collapse", _.replaceChildren(Rr(e ? de : ue));
	}, v = Q().min();
	ae(v), f(_, () => {
		let e = !!Y?.classList.toggle("li-min");
		ae(e), Q().min(e), e ? (Tr?.pause(), s(fe)) : (Tr?.resume(), te(fe)), kt(!e && Z?.() === "trace");
	});
	let se = /* @__PURE__ */ b("span", {
		class: "li-brand",
		children: [Ee(15), /* @__PURE__ */ y("b", { children: "Loom" })]
	}), ce = /* @__PURE__ */ b("div", {
		class: "li-bar",
		children: [
			se,
			/* @__PURE__ */ y("span", { class: "li-sp" }),
			g,
			_
		]
	}), fe;
	Tr = t(() => {
		fe = gr({
			activeTab: () => Z?.(),
			isMinimized: () => Y?.classList.contains("li-min") ?? !1
		});
	}, x), v && (Tr.pause(), s(fe));
	let pe = /* @__PURE__ */ new Map(), me = /* @__PURE__ */ new Map();
	X = /* @__PURE__ */ y("div", { class: "li-body" });
	for (let e of xr) {
		let t = e.id === "stats" ? fe : e.id === "graph" ? Be() : jt();
		pe.set(e.id, t), X.append(t);
	}
	Dt((e) => {
		Z?.("graph"), pt(e);
	});
	let ge = /* @__PURE__ */ y("div", { class: "li-tabscroll" });
	for (let e of xr) {
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
			t.append(e), Ot(e);
		}
		f(t, () => Z?.(e.id)), me.set(e.id, t), ge.append(t);
	}
	let _e = /* @__PURE__ */ y("div", {
		class: "li-tabs",
		children: ge
	}), ve = /* @__PURE__ */ y("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ y("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ y("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	Y = /* @__PURE__ */ b("div", { children: [
		ce,
		_e,
		X,
		ve
	] }), Y.id = S, v && Y.classList.add("li-min"), c(), Ir(ce, Y), Lr(ve, Y), Cr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!u.hidden && (t === null || !u.contains(t)) && e.target !== g && re();
	}, document.addEventListener("pointerdown", Cr), i.append(Y), document.body.append(u);
	let ye = Q().size(), be = Q().pos();
	if (ye && (Y.style.width = `${Math.max(240, Math.min(ye.width, window.innerWidth - 16))}px`, Y.style.height = `${Math.max(160, Math.min(ye.height, window.innerHeight - 16))}px`), be) {
		let { left: e, top: t } = Pr(Y, be.left, be.top);
		Y.style.left = `${e}px`, Y.style.top = `${t}px`, Y.style.right = "auto", Y.style.bottom = "auto";
	}
	ee(Y, () => {
		let e = Z?.();
		Ar && Ar !== e && X && kr.set(Ar, X.scrollTop), e === "stats" ? vr() : _r(), e !== "graph" && lt();
		for (let t of xr) {
			let n = t.id === e, r = pe.get(t.id), i = me.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && X) {
			let t = kr.get(e) ?? 0, n = Math.max(0, X.scrollHeight - X.clientHeight);
			X.scrollTop = Math.min(t, n), e === "graph" ? dt() : e === "trace" && Rt();
		}
		kt(e === "trace" && Y?.classList.contains("li-min") !== !0), Ar = e ?? null;
	}), wr.push(ne(X, { transition: 120 }), ne(ge, {
		axis: "x",
		transition: 120
	}));
}
function Br() {
	if (!(typeof document > "u")) {
		Or?.(), Or = null, yr();
		for (let e of wr) e();
		wr.length = 0, Tr?.stop(), Tr = null, Er?.abort(), Er = null, Mr = null, Cr && document.removeEventListener("pointerdown", Cr), Cr = null, Sr && o(Sr), Sr = null, Y && o(Y), Y = null, X = null, Z = null, kr.clear(), Ar = null, mt(), zt(), Dr !== null && r({ inspect: Dr }), Dr = null;
	}
}
function Vr() {
	return Y !== null;
}
function Hr(e) {
	Y ? Br() : zr(e);
}
//#endregion
export { Vr as inspectorMounted, zr as mountInspector, Hr as toggleInspector, Br as unmountInspector };
