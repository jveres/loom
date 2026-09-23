import { O as e, S as t, T as n, i as r, l as i, v as a, w as o } from "./loom-BsucpYd_.js";
import { c as s } from "./ownership-base-BZEik61k.js";
import { f as c, n as l, p as u, t as ee, v as te, y as ne } from "./dom-Ca8jthgP.js";
import { i as re, n as d } from "./events-koioIp6U.js";
import { t as ie } from "./motion-50oly4RL.js";
import { bindStorage as f, codecs as p, storageSlot as m } from "./storage.js";
import { virtualList as h } from "./virtual-list.js";
import "./defer.js";
import { a as ae, i as g, n as _, o as oe, r as se } from "./observe-DtHwJIc_.js";
import { jsx as v, jsxs as y } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var b = { internal: !0 }, ce = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;flex:auto;align-items:flex-end;gap:1px;min-width:0;margin-top:6px;display:flex;overflow-x:auto}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", x = "loom-inspector";
//#endregion
//#region src/devtools/format.ts
function le(e, t) {
	return e === void 0 ? "—" : e === null ? "null" : typeof e == "number" ? Number.isInteger(e) ? String(e) : e.toFixed(2) : typeof e == "string" ? e.length > t ? `"${e.slice(0, t)}…"` : `"${e}"` : typeof e == "boolean" ? String(e) : Array.isArray(e) ? `[${e.length}]` : typeof e == "object" ? "{…}" : String(e);
}
function ue(e) {
	return typeof e == "number" ? "li-gv-num" : typeof e == "string" ? "li-gv-str" : typeof e == "boolean" ? "li-gv-bool" : e == null ? "li-gv-nul" : "";
}
//#endregion
//#region src/devtools/icons.ts
function de(e, t) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${t}" height="${t}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`;
}
var fe = "<polyline points=\"4 14 10 14 10 20\"/><polyline points=\"20 10 14 10 14 4\"/><line x1=\"14\" x2=\"21\" y1=\"10\" y2=\"3\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", pe = "<polyline points=\"15 3 21 3 21 9\"/><polyline points=\"9 21 3 21 3 15\"/><line x1=\"21\" x2=\"14\" y1=\"3\" y2=\"10\"/><line x1=\"3\" x2=\"10\" y1=\"21\" y2=\"14\"/>", me = "<circle cx=\"12\" cy=\"12\" r=\"4\"/><path d=\"M12 2v2\"/><path d=\"M12 20v2\"/><path d=\"m4.93 4.93 1.41 1.41\"/><path d=\"m17.66 17.66 1.41 1.41\"/><path d=\"M2 12h2\"/><path d=\"M20 12h2\"/><path d=\"m6.34 17.66-1.41 1.41\"/><path d=\"m19.07 4.93-1.41 1.41\"/>", he = "<path d=\"M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z\"/>", ge = "<rect width=\"20\" height=\"14\" x=\"2\" y=\"3\" rx=\"2\"/><line x1=\"8\" x2=\"16\" y1=\"21\" y2=\"21\"/><line x1=\"12\" x2=\"12\" y1=\"17\" y2=\"21\"/>", _e = "<path d=\"M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", ve = "<circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"currentColor\" stroke=\"none\"/>", ye = "<circle cx=\"12\" cy=\"12\" r=\"5\"/>", be = "<path d=\"M5 19c.264.956.797 2 2.187 2c2.407 0 3.008-2 4.813-9s2.406-9 4.813-9c1.39 0 1.923 1.044 2.187 2M9 10h8\"/>", xe = "<path d=\"m6 9 6 6 6-6\"/>", Se = "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"22\" x2=\"18\" y1=\"12\" y2=\"12\"/><line x1=\"6\" x2=\"2\" y1=\"12\" y2=\"12\"/><line x1=\"12\" x2=\"12\" y1=\"6\" y2=\"2\"/><line x1=\"12\" x2=\"12\" y1=\"22\" y2=\"18\"/>", Ce = "<path d=\"M3 6h18\"/><path d=\"M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6\"/><path d=\"M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", we = "<rect x=\"14\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/><rect x=\"6\" y=\"4\" width=\"4\" height=\"16\" rx=\"1\"/>", Te = "<polygon points=\"6 3 20 12 6 21 6 3\"/>";
function Ee(e) {
	let t = document.createElement("div");
	t.innerHTML = e;
	let n = t.firstElementChild;
	if (!n) throw Error("icon markup produced no element");
	return n;
}
function De(e, t) {
	return Ee(de(e, t));
}
function Oe(e) {
	return Ee(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var ke = 300, Ae = 22, je = 16, S = null, C = /* @__PURE__ */ new Map(), Me = 0, Ne = [], Pe = [], Fe = [], Ie = null, Le = -1, Re = 0, ze = !1, Be = !1, w = /* @__PURE__ */ new Set(), Ve = -1;
function He() {
	return S = h({
		rowHeight: Ae,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: tt
	}), S.el.classList.add("li-pane", "li-graph"), S.el;
}
function Ue(e) {
	return T(e.id).length > 0;
}
function We(e, t) {
	if (typeof t == "number") {
		let n = Number(e);
		return Number.isNaN(n) ? t : n;
	}
	return e;
}
function Ge(e) {
	if (e.kind !== "state" || !e.source) return !1;
	let t = e.value;
	return t === null || typeof t == "number" || typeof t == "string" || typeof t == "boolean";
}
function Ke(e, t, n, r = !1) {
	if (Le === n) return;
	let i = e.querySelector(".li-gval");
	if (!i) return;
	let a = le(t, je);
	!r && !ze && e.dataset.prev !== void 0 && e.dataset.prev !== a && Qe(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${ue(t)}`, e.dataset.prev = a;
}
function qe(e, t, n, r) {
	let i = t();
	if (typeof i == "boolean") {
		t(!i), Ke(r, t(), e, !0), Je(e, r);
		return;
	}
	if (i !== null && typeof i != "number" && typeof i != "string") return;
	let a = document.createElement("input");
	a.className = "li-gedit", a.value = typeof i == "string" ? i : String(i), Ie = a, Le = e, n.replaceWith(a), a.focus(), a.select();
	let o = () => {
		Ie = null, Le = -1, a.parentNode && a.replaceWith(n);
	}, s = () => {
		Ie === a && (t(We(a.value, i)), o(), Ke(r, t(), e, !0), Je(e, r));
	};
	a.onblur = s, a.onkeydown = (e) => {
		e.key === "Enter" ? s() : e.key === "Escape" && o();
	};
}
function Je(e, t) {
	t.matches(":hover") && E(T(e), !0);
}
function T(e) {
	let t = [], n = /* @__PURE__ */ new Set([e]), r = C.get(e), i = r ? [...r.subs] : [];
	for (; i.length > 0;) {
		let e = i.shift();
		if (e === void 0 || n.has(e)) continue;
		n.add(e);
		let r = C.get(e);
		if (r) {
			if (r.kind === "effect") {
				let e = r.target;
				(e instanceof Element || e instanceof CharacterData) && t.push(e);
			} else for (let e of r.subs) i.push(e);
		}
	}
	return t;
}
function Ye(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of C.values()) if (r.group === e) for (let e of T(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function Xe(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function E(e, t) {
	for (let e of Fe) e.remove();
	if (Fe = [], t) for (let t of e) {
		let e = Xe(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), Fe.push(n);
	}
}
function Ze(e) {
	let t = performance.now();
	t - Me >= ke && (C = new Map(ae({ active: !0 }).nodes.map((e) => [e.id, e])), Me = t), E(T(e), !0);
}
function Qe(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function $e(e, t) {
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
function et(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `props #${e}`;
}
function tt(e, t) {
	if (e.kind === "header") return t ? rt(t, e) : nt(e);
	let n = t ? at(t, e) : it(e);
	return e.node.id === Ve && (Qe(n), Ve = -1), n;
}
function nt(e) {
	let t = /* @__PURE__ */ v("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ v("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = De(xe, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ v("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(De(Se, 11));
	let a = /* @__PURE__ */ y("div", {
		class: "li-gns-h",
		children: [
			r,
			n,
			t,
			i
		]
	}), o = e.gid;
	return w.has(o) && a.classList.add("collapsed"), a.onclick = () => {
		w.has(o) ? w.delete(o) : w.add(o), S?.setItems(ct());
	}, i.onclick = (e) => {
		e.stopPropagation(), $e(Ye(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => E(Ye(o), !0), a.onmouseleave = () => E(Ye(o), !1), a;
}
function rt(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", w.has(t.gid)), e;
}
function it(e) {
	let t = e.node, n = /* @__PURE__ */ v("span", { class: "li-gval" }), r = Ue(t), i = De(t.kind === "computed" ? be : r ? ve : ye, 13);
	i.classList.add("li-gicon", r ? t.kind === "computed" ? "li-gi-computed" : "li-gi-state" : "li-gi-dim");
	let a = e.child ? t.key ?? t.label : t.label, o = /* @__PURE__ */ y("div", {
		class: "li-grow",
		children: [
			i,
			/* @__PURE__ */ v("span", {
				class: "li-glabel",
				children: a
			}),
			n
		]
	});
	if (e.child && o.classList.add("li-grow-child"), o.onmouseenter = () => E(T(t.id), !0), o.onmouseleave = () => E(T(t.id), !1), Ge(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => qe(t.id, e, n, o);
	}
	return Ke(o, t.value, t.id), o;
}
function at(e, t) {
	return Ke(e, t.node.value, t.node.id), e;
}
function ot() {
	let e = Pe.length;
	for (let t of Ne) e += 1 + (w.has(t.gid) ? 0 : t.signals.length);
	return e;
}
function st(e) {
	let t = e;
	for (let e of Ne) {
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
	return t < Pe.length ? {
		kind: "signal",
		node: Pe[t],
		child: !1
	} : void 0;
}
function ct() {
	return {
		length: ot(),
		at: st
	};
}
function lt() {
	if (!S) return;
	let e = ae({ active: !0 }).nodes;
	C = new Map(e.map((e) => [e.id, e])), Me = performance.now();
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
		label: et(e, n),
		signals: n
	});
	Pe = n, ze = Be, S.setItems(ct()), ze = !1, Be = !1;
}
function ut() {
	E([], !1);
}
function dt() {
	let e = performance.now();
	e - Re >= ke && (Re = e, lt());
}
function ft() {
	if (S) {
		for (let e of S.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Be = !0, S.refresh();
	}
}
function pt(e) {
	let t = 0;
	for (let n of Ne) {
		let r = n.signals.findIndex((t) => t.id === e);
		if (r >= 0) return w.has(n.gid) && (w.delete(n.gid), S?.setItems(ct())), t + 1 + r;
		t += 1 + (w.has(n.gid) ? 0 : n.signals.length);
	}
	let n = Pe.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function mt(e) {
	if (S === null) return;
	lt();
	let t = pt(e);
	t < 0 || (Ve = e, S.scrollToIndex(t));
}
function ht() {
	for (let e of Fe) e.remove();
	Fe = [], Ie = null, Le = -1, S?.stop(), S = null, Ne = [], Pe = [], w.clear(), C = /* @__PURE__ */ new Map(), Me = 0, Re = 0, Ve = -1, ze = !1, Be = !1;
}
//#endregion
//#region src/devtools/trace.tsx
var gt = 22, _t = 200, vt = 1e3, yt = [
	"writes",
	"reads",
	"all"
];
function bt(e) {
	return yt.includes(e);
}
var D = null, xt = null, St = null, O = "all", Ct = null, k = null, wt = null, Tt = null, Et = null, A = [], j = [], M = !1, N = !1, P = "", Dt = 0, Ot = -1, F = -1, kt = null;
function At(e) {
	kt = e;
}
function jt(e) {
	Et = e, Nt();
}
function Mt(e) {
	N !== e && (N = e, e ? (Ft(), Bt()) : It(), Nt());
}
function Nt() {
	Et && (Et.classList.toggle("inactive", !N), Et.classList.toggle("off", M), Et.title = N ? M ? "Paused" : "Live — capturing" : "Trace");
}
function Pt() {
	Lt(), D = h({
		rowHeight: gt,
		key: (e) => e.seq,
		render: Jt
	}), Tt = /* @__PURE__ */ v("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), Tt.append(De(we, 12)), d(Tt, () => Ut(!M));
	let e = /* @__PURE__ */ v("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(De(Ce, 12)), d(e, () => Rt());
	let t = /* @__PURE__ */ v("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: yt.map((e) => /* @__PURE__ */ v("option", {
			value: e,
			children: e
		}))
	});
	t.value = O, t.addEventListener("change", () => {
		bt(t.value) && (O = t.value), Lt();
	});
	let n = /* @__PURE__ */ v("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		P = n.value.trim().toLowerCase(), j = P ? A.filter((e) => e.name.toLowerCase().includes(P)) : [], I();
	}), k = /* @__PURE__ */ v("div", { class: "li-tr-scroll" }), k.append(D.el), wt = ie(k, { transition: 120 }), k.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== F && (F = Number(t), Ze(F));
	}), k.addEventListener("pointerleave", () => {
		F = -1, ut();
	}), d(k, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (F = -1, ut(), kt?.(Number(t)));
	}), Ct = /* @__PURE__ */ y("div", {
		class: "li-pane li-trace",
		children: [/* @__PURE__ */ y("div", {
			class: "li-tr-bar",
			children: [
				Tt,
				t,
				n,
				e
			]
		}), k]
	}), Ct;
}
function Ft() {
	O !== "reads" && !xt && (xt = se([_.write], "samples")), O !== "writes" && !St && (St = se([_.read], "samples"));
}
function It() {
	xt?.stop(), xt = null, St?.stop(), St = null;
}
function Lt() {
	It(), N && Ft(), Ot = -1, I(), Bt();
}
function Rt() {
	A = [], j = [], Ot = -1, I();
}
function zt(e) {
	vt = e, A.length > e && (A.length = e), j.length > e && (j.length = e), I();
}
function Bt() {
	if (M || D === null) return;
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
	let r = (P ? j : A)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(Wt(t, n));
	if (i.reverse(), A = i.concat(A), P) {
		let e = i.filter((e) => e.name.toLowerCase().includes(P));
		e.length > 0 && (j = e.concat(j));
	}
	A.length > vt && (A.length = vt), j.length > vt && (j.length = vt), Ot = ((P ? j : A)[0]?.seq ?? -1) === r ? -1 : r, I();
}
function Vt() {
	Bt(), I(), requestAnimationFrame(() => D?.refresh());
}
function Ht() {
	It(), D = null, Ct = null, k = null, wt?.(), wt = null, Tt = null, Et = null, A = [], j = [], Gt.clear(), Kt = !1, Ot = -1, M = !1, N = !1, P = "", O = "all", F = -1, kt = null;
}
function Ut(e) {
	M = e, Tt?.replaceChildren(De(e ? Te : we, 12)), Nt(), Ct?.classList.toggle("li-tr-paused", e), e || Bt();
}
function I() {
	let e = P ? j : A;
	D?.setItems(O === "all" ? e : e.filter((e) => e.kind === (O === "writes" ? "write" : "read")));
}
function Wt(e, t) {
	let n = g(e), r = n.id, i = qt(r), a = Xt(n.t), o = n.by, s = o === void 0 ? "" : `by ${qt(o)}`;
	if (t === "read") return {
		seq: Dt++,
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
	let c = g(e), l = le(c.prev, _t), u = le(c.next, _t);
	return {
		seq: Dt++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: l,
		prevCls: ue(c.prev),
		nextText: u,
		nextCls: ue(c.next),
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
		for (let e of ae().nodes) Gt.set(e.id, e.label);
		let t = Gt.get(e);
		if (t !== void 0) return t;
	}
	return `#${e}`;
}
function Jt(e, t) {
	let n = t ?? Yt(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3], a = i.children[0], o = i.children[1], s = i.children[2], c = i.children[3];
	return e.kind === "read" ? (a.textContent = "", a.className = "li-tr-val", o.textContent = "", s.textContent = "", s.className = "li-tr-val") : (a.textContent = e.prevText, a.className = `li-tr-val ${e.prevCls}`, o.textContent = " → ", s.textContent = e.nextText, s.className = `li-tr-val ${e.nextCls}`), c.textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === Ot), n;
}
function Yt() {
	return /* @__PURE__ */ y("div", {
		class: "li-tr",
		children: [
			/* @__PURE__ */ v("span", { class: "li-tr-kind" }),
			/* @__PURE__ */ v("span", { class: "li-tr-time" }),
			/* @__PURE__ */ v("span", { class: "li-tr-name" }),
			/* @__PURE__ */ y("span", {
				class: "li-tr-change",
				children: [
					/* @__PURE__ */ v("span", { class: "li-tr-val" }),
					/* @__PURE__ */ v("span", { class: "li-tr-arrow" }),
					/* @__PURE__ */ v("span", { class: "li-tr-val" }),
					/* @__PURE__ */ v("span", { class: "li-tr-src" })
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
//#endregion
//#region src/devtools/stats.tsx
var Zt = 138, Qt = 34, $t = 2 * Math.PI * Qt, en = $t * .75, tn = 120, nn = 55, rn = 30, an = tn / 1e3, on = 200, sn = () => void 0, cn = () => !1, L = null, ln = null, un = null, R = null, z = !1, dn = !1, fn = null, pn = 0, mn = null, hn = null, gn = 0, _n = 0, vn = 0, yn = 0, bn = 0, xn = 0, Sn = 0, Cn = 0, wn = 0, B = 0, V = !1, Tn = 0, En = 0, Dn = 0, On = 0, H = [], kn = 0, An = 0, jn = 0, Mn = !1, Nn = null, Pn = null, Fn = null, In = null, Ln = null, Rn = 100, zn = "", Bn = "", Vn = !1, Hn = "", Un = 0, Wn = 0, Gn = 0, Kn = 0, qn = 0, Jn = 0, Yn = 0, Xn = 0;
function U(e) {
	return e?.() ?? 0;
}
function Zn(e) {
	return () => (L?.(), e());
}
function W(e, t, n) {
	l(e, t, Zn(n), b);
}
function Qn(e) {
	return c(Zn(e), b);
}
var G = (e, t) => e * .6 + t / an * .4;
function K(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function $n(e) {
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
function er(e) {
	return tr(1e3 / e);
}
function tr(e) {
	return e >= nn ? "h-ok" : e >= rn ? "h-warn" : "h-bad";
}
function nr(e, t, n) {
	return e ? e <= t ? "h-ok" : e <= n ? "h-warn" : "h-bad" : "";
}
function rr(e) {
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
var ir = rr((e) => {
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
}), ar = rr((e) => {
	let t = new PerformanceObserver((t) => {
		for (let n of t.getEntries()) n.entryType === "largest-contentful-paint" && e(n.startTime);
	});
	return t.observe({
		type: "largest-contentful-paint",
		buffered: !0
	}), t;
}), or = rr((e) => {
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
}), sr = typeof PerformanceObserver == "function" && PerformanceObserver.supportedEntryTypes?.includes("longtask") === !0, cr = rr((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let e of n.getEntries()) t += e.duration;
		e(t);
	});
	return n.observe({
		type: "longtask",
		buffered: !0
	}), n;
});
function lr() {
	return [/* @__PURE__ */ v("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: Qt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${$t}`
	}), /* @__PURE__ */ v("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function ur() {
	let e = /* @__PURE__ */ v("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: Qt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	W(e, "stroke-dasharray", () => `${en * Rn / 100} ${$t}`), W(e, "class", () => `li-garc h-${zn}`);
	let t = /* @__PURE__ */ v("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(Qn(() => String(Rn))), W(t, "class", () => `li-gnum h-${zn}`), [e, t];
}
function dr() {
	return /* @__PURE__ */ y("svg", {
		width: 88,
		height: 88,
		viewBox: "0 0 88 88",
		role: "img",
		"aria-label": "Health",
		children: [
			/* @__PURE__ */ v("circle", {
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
			u(Zn(() => Vn), ur, lr),
			/* @__PURE__ */ v("text", {
				class: "li-glbl",
				x: 44,
				y: 61,
				"text-anchor": "middle",
				children: "HEALTH"
			})
		]
	});
}
function fr() {
	let e = [];
	for (let t = 0; t < Zt; t++) e.push(/* @__PURE__ */ v("rect", {
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
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? er(a) : "");
		}
	}, r = /* @__PURE__ */ v("div", {
		class: "li-histo",
		title: J.frames,
		children: /* @__PURE__ */ v("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${Zt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
	return ee(r, n, b), r;
}
function q(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ v("span", { class: `li-stat-v ${n}` });
	return i.append(Qn(t)), /* @__PURE__ */ y("div", {
		class: "li-stat",
		children: [/* @__PURE__ */ v("span", {
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
function pr() {
	let e = /* @__PURE__ */ v("span", { class: "li-perfh-fps" });
	e.append(Qn(() => V ? `${Math.round(B)} fps` : "— fps")), W(e, "class", () => `li-perfh-fps ${Hn}`);
	let t = /* @__PURE__ */ v("div", {
		class: "li-hlabel",
		title: J.health
	});
	t.append(Qn(() => V ? Bn.toUpperCase() : "LOADING")), W(t, "class", () => Vn ? `li-hlabel h-${zn}` : "li-hlabel");
	let n = /* @__PURE__ */ y("div", {
		class: "li-hstats",
		children: [t, q("lag", () => `${kn.toFixed(0)} · pk ${An.toFixed(0)} ms`, "lo", J.lag)]
	});
	return n.append(mr("blocked", () => {
		if (!sr) return "—";
		let e = U(In);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!sr) return "";
		let e = U(In);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, J.blocked)), n.append(mr("CLS", () => U(Nn).toFixed(2), () => {
		let e = U(Nn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, J.cls)), n.append(mr("LCP", () => {
		let e = U(Pn);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => nr(U(Pn), 2500, 4e3), J.lcp)), n.append(mr("INP", () => {
		let e = U(Fn);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => nr(U(Fn), 200, 500), J.inp)), /* @__PURE__ */ y("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ y("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ v("span", {
					title: J.fps,
					children: "Performance"
				}), e]
			}),
			fr(),
			/* @__PURE__ */ y("div", {
				class: "li-hblock",
				children: [dr(), n]
			}),
			q("frame time", () => `${On.toFixed(1)} ms`, "", J.frameTime),
			hr() ? gr() : null,
			q("writes / s", () => K(_n), "hi", J.writes),
			q("reads / s", () => K(gn), "hi", J.reads),
			q("computeds / s", () => K(vn), "", J.computedsRate),
			q("effect runs / s", () => K(yn), "lo", J.effectRuns),
			q("flushes / s", () => K(bn), "lo", J.flushes),
			q("effects / flush", () => String(Cn), "", J.effectsPerFlush),
			q("flush time", () => `${wn.toFixed(1)} ms`, "", J.flushTime),
			q("creates / s", () => K(xn), "lo", J.creates),
			q("disposes / s", () => K(Sn), "lo", J.disposes),
			q("states", () => String(Un), "", J.states),
			q("computeds", () => String(Wn), "", J.computeds),
			mr("unread", () => String(Xn), () => Xn > 0 ? "h-warn" : "", J.unread),
			q("effects", () => String(Gn), "", J.effects),
			q("views", () => String(Kn), "", J.views),
			q("sources", () => String(qn), "", J.sources),
			q("scopes", () => String(Jn), "", J.scopes),
			q("channels", () => String(Yn), "", J.channels)
		]
	});
}
function mr(e, t, n, r = "") {
	let i = q(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && W(a, "class", () => `li-stat-v ${n()}`), i;
}
function hr() {
	return performance.memory;
}
function gr() {
	return q("heap", () => {
		let e = Ln?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", J.heap);
}
function _r() {
	let e = mn?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, s = hn?.read()?.["loom:flush"];
	gn = G(gn, t), _n = G(_n, n), yn = G(yn, r), vn = G(vn, i), xn = G(xn, a), Sn = G(Sn, o), bn = G(bn, s?.count ?? 0);
	let c = g(s?.samples.at(-1));
	if (c !== void 0 && (Cn = c.batchSize, wn = c.durationMs), !V) Vn = !1, Hn = "";
	else {
		let e = $n(B);
		Rn = e.score, zn = e.key, Bn = e.label, Vn = !0, Hn = tr(B);
	}
	return ++pn;
}
function vr() {
	let e = !cn();
	if (sn() === "stats" && e) {
		let e = oe();
		Un = e.states, Wn = e.computeds, Gn = e.effects - e.targetedEffects, Kn = e.targetedEffects, qn = e.sources, Jn = e.scopes, Yn = e.channels, Xn = e.unread;
	} else sn() === "graph" && e ? dt() : sn() === "trace" && e && Bt();
}
function yr() {
	document.hidden && (Mn = !0);
}
function br() {
	jn = performance.now() + on, ln = setInterval(() => {
		let e = performance.now(), t = jn;
		if (jn = e + on, document.hidden) {
			Mn = !0;
			return;
		}
		if (Mn) {
			Mn = !1;
			return;
		}
		kn = Math.max(0, e - t), kn > An && (An = kn);
	}, on), document.addEventListener("visibilitychange", yr), Dn = 0;
	let e = (t) => {
		if (un = requestAnimationFrame(e), Dn) {
			let e = Math.min(t - Dn, 1e3);
			if (On = e, H.push(e), H.length > Zt && H.shift(), Tn += e, En++, Tn >= 500) {
				let e = En * 1e3 / Tn;
				B = V ? B * .5 + e * .5 : e, V = !0, Tn = 0, En = 0;
			}
		}
		Dn = t;
	};
	un = requestAnimationFrame(e);
}
function xr(n) {
	sn = n.activeTab, cn = n.isMinimized, mn = se([
		_.read,
		_.write,
		_.compute,
		_.effect,
		_.create,
		_.dispose
	]), hn = se([_.flush], "samples"), L = a(_r, tn, b);
	let r;
	return fn = t(() => {
		Nn = o(ir, 0, b), Pn = o(ar, 0, b), Fn = o(or, 0, b), In = o(cr, 0, b), hr() && (Ln = a(() => hr()?.usedJSHeapSize ?? 0, 5e3, b)), r = pr();
	}, b), i(() => {
		L?.(), e(vr);
	}, {
		...b,
		defer: !0,
		maxStale: tn
	}), R = r, z = !1, br(), r;
}
function Sr() {
	fn?.pause(), R && !z && (z = !0, te(R));
}
function Cr() {
	fn?.resume(), R && z && (z = !1, ne(R));
}
function wr(e) {
	!R || dn === e || (dn = e, e ? te(R) : ne(R));
}
function Tr() {
	mn?.stop(), mn = null, hn?.stop(), hn = null, L?.stop(), L = null, ln != null && clearInterval(ln), ln = null, typeof document < "u" && document.removeEventListener("visibilitychange", yr), un != null && cancelAnimationFrame(un), un = null, fn?.stop(), fn = null, R = null, z = !1, dn = !1, Ln = Nn = Pn = Fn = In = null, pn = 0, gn = _n = vn = yn = bn = 0, xn = Sn = 0, Cn = wn = 0, B = 0, V = !1, Tn = En = Dn = On = 0, H.length = 0, kn = An = 0, Mn = !1, Vn = !1, Rn = 100, zn = Bn = Hn = "", Un = Wn = Gn = Kn = 0, qn = Jn = Yn = Xn = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var Er = [
	"system",
	"light",
	"dark"
], Dr = 240, Or = 160, kr = 8, Ar = {
	system: ge,
	light: me,
	dark: he
}, jr = [
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
], Y = null, Mr = null, X = null, Nr = null, Pr = [], Fr = null, Ir = null, Lr = null, Rr = null, Z = null, zr = /* @__PURE__ */ new Map(), Br = null, Vr = [
	1e3,
	5e3,
	25e3
], Hr = null;
function Q() {
	if (Hr) return Hr;
	Ir = new AbortController();
	let e = { signal: Ir.signal }, t = {
		theme: n("system", b),
		min: n(!1, b),
		logSize: n(1e3, b),
		pos: n(null, b),
		size: n(null, b)
	};
	return f(t.theme, m(`${x}-theme`, p.string(Er)), e), f(t.min, m(`${x}-min`, p.boolean), e), f(t.logSize, m(`${x}-logsize`, {
		...p.number(),
		validate: (e) => Vr.includes(e)
	}), e), f(t.pos, m(`${x}-pos`, p.json((e) => typeof e == "object" && !!e && "left" in e && "top" in e && typeof e.left == "number" && Number.isFinite(e.left) && typeof e.top == "number" && Number.isFinite(e.top))), e), f(t.size, m(`${x}-size`, p.json((e) => typeof e == "object" && !!e && "width" in e && "height" in e && typeof e.width == "number" && e.width > 0 && typeof e.height == "number" && e.height > 0)), e), Hr = t, t;
}
function $(e) {
	let t = window.devicePixelRatio || 1;
	return Math.round(e * t) / t;
}
function Ur(e, t, n, r) {
	let i = e.offsetWidth, a = Math.min(80, i);
	return {
		left: $(Math.min(window.innerWidth - a, Math.max(a - i, n))),
		top: $(Math.min(window.innerHeight - t, Math.max(0, r)))
	};
}
function Wr(e, t, n) {
	let r = Math.max(0, window.innerWidth - e.offsetWidth), i = Math.max(0, window.innerHeight - e.offsetHeight);
	return {
		left: $(Math.max(0, Math.min(t, r))),
		top: $(Math.max(0, Math.min(n, i)))
	};
}
function Gr(e, t, n, r, i) {
	Rr?.();
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto";
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s = () => {};
	s = re(e, n, {
		move: (e) => r(e, a),
		end: () => {
			Rr === s && (Rr = null), document.body.style.userSelect = o, i();
		}
	}), Rr = s;
}
function Kr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		if (n.target?.closest("button")) return;
		n.preventDefault();
		let r = n.clientX, i = n.clientY, a = null;
		e.style.cursor = "grabbing", Gr(e, t, n, (n, o) => {
			let { left: s, top: c } = Ur(t, e.offsetHeight || 40, o.left + n.clientX - r, o.top + n.clientY - i);
			t.style.left = `${s}px`, t.style.top = `${c}px`, a = {
				left: s,
				top: c
			};
		}, () => {
			e.style.cursor = "", a && Q().pos(a);
		});
	});
}
function qr(e, t) {
	e.addEventListener("pointerdown", (n) => {
		n.preventDefault(), n.stopPropagation();
		let r = n.clientX, i = n.clientY, a = null;
		Gr(e, t, n, (e, n) => {
			let o = $(Math.max(Dr, Math.min(window.innerWidth - n.left - kr, n.width + e.clientX - r))), s = $(Math.max(Or, Math.min(window.innerHeight - n.top - kr, n.height + e.clientY - i)));
			t.style.width = `${o}px`, t.style.height = `${s}px`, a = {
				width: o,
				height: s
			};
		}, () => {
			a && Q().size(a);
		});
	});
}
function Jr(e) {
	return Ee(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function Yr(e) {
	if (Y || typeof document > "u") return;
	let i = e ?? document.body;
	if (Lr = r({ inspect: !0 }).inspect ?? !1, !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${x}-css`, e.textContent = ce, document.head.append(e);
	}
	Z = n("stats", b);
	let a = Q().theme(), o = /* @__PURE__ */ v("span", { class: "li-menu-val" }), s = () => {
		Y?.setAttribute("data-theme", a), Mr?.setAttribute("data-theme", a), o.innerHTML = de(Ar[a], 13), c.title = `Theme: ${a} (click to cycle)`;
	}, c = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ v("span", { children: "Theme" }), o]
	});
	d(c, () => {
		a = Er[(Er.indexOf(a) + 1) % Er.length] ?? "system", Q().theme(a), s();
	});
	let l = /* @__PURE__ */ v("div", {
		class: "li-menu",
		hidden: !0
	});
	l.id = `${x}-menu`, l.append(c), Mr = l;
	let u = Q().logSize(), te = /* @__PURE__ */ v("span", { class: "li-menu-val" }), ne = () => {
		te.textContent = `${u / 1e3}k`, zt(u);
	}, re = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ v("span", { children: "Log size" }), te]
	});
	d(re, () => {
		u = Vr[(Vr.indexOf(u) + 1) % Vr.length] ?? 1e3, Q().logSize(u), ne();
	}), l.append(re), ne();
	let f = () => {
		l.hidden = !0;
	}, p = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ v("span", { children: "Hide" }), /* @__PURE__ */ v("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	d(p, () => {
		f(), Xr();
	}), l.append(p);
	let m = /* @__PURE__ */ v("button", {
		type: "button",
		title: "Settings"
	});
	m.append(Jr(_e)), d(m, (e) => {
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
	let h = /* @__PURE__ */ v("button", { type: "button" }), ae = (e) => {
		h.title = e ? "Expand" : "Collapse", h.replaceChildren(Jr(e ? pe : fe));
	}, g = Q().min();
	ae(g), d(h, () => {
		let e = !!Y?.classList.toggle("li-min");
		ae(e), Q().min(e), e ? Fr?.pause() : Fr?.resume(), wr(e), Mt(!e && Z?.() === "trace");
	});
	let _ = /* @__PURE__ */ y("span", {
		class: "li-brand",
		children: [Oe(15), /* @__PURE__ */ v("b", { children: "Loom" })]
	}), oe = /* @__PURE__ */ y("div", {
		class: "li-bar",
		children: [
			_,
			/* @__PURE__ */ v("span", { class: "li-sp" }),
			m,
			h
		]
	}), se;
	Fr = t(() => {
		se = xr({
			activeTab: () => Z?.(),
			isMinimized: () => Y?.classList.contains("li-min") ?? !1
		});
	}, b), g && (Fr.pause(), wr(!0));
	let le = /* @__PURE__ */ new Map(), ue = /* @__PURE__ */ new Map();
	X = /* @__PURE__ */ v("div", { class: "li-body" });
	for (let e of jr) {
		let t = e.id === "stats" ? se : e.id === "graph" ? He() : Pt();
		le.set(e.id, t), X.append(t);
	}
	At((e) => {
		Z?.("graph"), mt(e);
	});
	let me = /* @__PURE__ */ v("div", { class: "li-tabscroll" });
	for (let e of jr) {
		let t = /* @__PURE__ */ v("button", {
			type: "button",
			class: "li-tab",
			children: e.label
		});
		if (e.id === "trace") {
			let e = /* @__PURE__ */ v("span", {
				class: "li-tr-live",
				title: "Live — capturing"
			});
			t.append(e), jt(e);
		}
		d(t, () => Z?.(e.id)), ue.set(e.id, t), me.append(t);
	}
	let he = /* @__PURE__ */ v("div", {
		class: "li-tabs",
		children: me
	}), ge = /* @__PURE__ */ v("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ v("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ v("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	Y = /* @__PURE__ */ y("div", { children: [
		oe,
		he,
		X,
		ge
	] }), Y.id = x, g && Y.classList.add("li-min"), s(), Kr(oe, Y), qr(ge, Y), Nr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!l.hidden && (t === null || !l.contains(t)) && e.target !== m && f();
	}, document.addEventListener("pointerdown", Nr), i.append(Y), document.body.append(l);
	let ve = Q().size(), ye = Q().pos();
	if (ve && (Y.style.width = `${Math.max(Dr, Math.min(ve.width, window.innerWidth - 16))}px`, Y.style.height = `${Math.max(Or, Math.min(ve.height, window.innerHeight - 16))}px`), ye) {
		let { left: e, top: t } = Wr(Y, ye.left, ye.top);
		Y.style.left = `${e}px`, Y.style.top = `${t}px`, Y.style.right = "auto", Y.style.bottom = "auto";
	}
	ee(Y, () => {
		let e = Z?.();
		Br && Br !== e && X && zr.set(Br, X.scrollTop), e === "stats" ? Cr() : Sr(), e !== "graph" && ut();
		for (let t of jr) {
			let n = t.id === e, r = le.get(t.id), i = ue.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && X) {
			let t = zr.get(e) ?? 0, n = Math.max(0, X.scrollHeight - X.clientHeight);
			X.scrollTop = Math.min(t, n), e === "graph" ? ft() : e === "trace" && Vt();
		}
		Mt(e === "trace" && Y?.classList.contains("li-min") !== !0), Br = e ?? null;
	}), Pr.push(ie(X, { transition: 120 }), ie(me, {
		axis: "x",
		transition: 120
	}));
}
function Xr() {
	if (!(typeof document > "u")) {
		Rr?.(), Rr = null, Tr();
		for (let e of Pr) e();
		Pr.length = 0, Fr?.stop(), Fr = null, Ir?.abort(), Ir = null, Hr = null, Nr && document.removeEventListener("pointerdown", Nr), Nr = null, Mr && s(Mr), Mr = null, Y && s(Y), Y = null, X = null, Z = null, zr.clear(), Br = null, ht(), Ht(), Lr !== null && r({ inspect: Lr }), Lr = null;
	}
}
function Zr() {
	return Y !== null;
}
function Qr(e) {
	Y ? Xr() : Yr(e);
}
//#endregion
export { Zr as inspectorMounted, Yr as mountInspector, Qr as toggleInspector, Xr as unmountInspector };
