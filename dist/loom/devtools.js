import { O as e, S as t, T as n, i as r, v as i, w as a } from "./loom-B6598vHo.js";
import { c as o } from "./ownership-base-hl0GKMLF.js";
import { f as s, n as c, p as l, t as ee, v as te, y as ne } from "./dom-TiflUfBQ.js";
import { i as u, n as d } from "./events-CbzB9obJ.js";
import { t as re } from "./motion-XhBP-ODU.js";
import { bindStorage as f, codecs as p, storageSlot as m } from "./storage.js";
import { virtualList as ie } from "./virtual-list.js";
import "./defer.js";
import { a as ae, i as h, n as g, o as oe, r as _ } from "./observe-fsc1ylyK.js";
import { jsx as v, jsxs as y } from "./jsx-runtime.js";
//#region src/devtools/bindings.ts
var b = { internal: !0 }, se = "#loom-inspector,#loom-inspector-menu{--lightningcss-light: ;--lightningcss-dark:initial;color-scheme:dark;--li-bg:var(--lightningcss-light,#fbfbfd)var(--lightningcss-dark,#15151d);--li-fg:var(--lightningcss-light,#16161c)var(--lightningcss-dark,#ededf0);--li-muted:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-border:var(--lightningcss-light,#0000002b)var(--lightningcss-dark,#ffffff24);--li-border-soft:var(--lightningcss-light,#00000017)var(--lightningcss-dark,#ffffff14);--li-hover:var(--lightningcss-light,#0000000d)var(--lightningcss-dark,#ffffff0f);--li-fill:var(--lightningcss-light,#eeeef3)var(--lightningcss-dark,#1d1d28);--li-accent:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-accent-soft:var(--lightningcss-light,#6d5cf029)var(--lightningcss-dark,#8b7cff4d);--li-bar-bg:var(--lightningcss-light,#6d5cf01a)var(--lightningcss-dark,#8b7cff1f);--li-key:var(--lightningcss-light,#6d5cf0)var(--lightningcss-dark,#8b7cff);--li-num:var(--lightningcss-light,#2f9e5a)var(--lightningcss-dark,#57c97e);--li-str:var(--lightningcss-light,#c0801f)var(--lightningcss-dark,#f0b65a);--li-bool:var(--lightningcss-light,#e5446b)var(--lightningcss-dark,#ff7a9c);--li-nul:var(--lightningcss-light,#83838c)var(--lightningcss-dark,#8f8f9b);--li-input-bg:var(--lightningcss-light,#fff)var(--lightningcss-dark,#ededf0);--li-input-fg:#16161c;--li-uline:var(--lightningcss-light,#0000004d)var(--lightningcss-dark,#fff6);--li-scroll:var(--lightningcss-light,#0003)var(--lightningcss-dark,#ffffff38)}#loom-inspector[data-theme=light],#loom-inspector-menu[data-theme=light]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light}#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light:initial;--lightningcss-dark: ;color-scheme:light dark}@media (prefers-color-scheme:dark){#loom-inspector[data-theme=system],#loom-inspector-menu[data-theme=system]{--lightningcss-light: ;--lightningcss-dark:initial}}#loom-inspector{z-index:2147483647;width:360px;height:440px;max-height:calc(100vh - 24px);color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:10px;flex-direction:column;font:12px/1.5 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;bottom:12px;right:12px;overflow:hidden;box-shadow:0 6px 22px #00000042}#loom-inspector.li-min{height:auto!important}#loom-inspector.li-min .li-resize{display:none}#loom-inspector .li-resize{cursor:nwse-resize;touch-action:none;width:20px;height:20px;position:absolute;bottom:0;right:0}#loom-inspector .li-resize svg{width:100%;height:100%}#loom-inspector .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6px;stroke-linecap:round;opacity:.55;transition:stroke .15s,opacity .15s}#loom-inspector .li-resize:hover path{stroke:var(--li-accent);opacity:1}#loom-inspector .li-bar{cursor:move;-webkit-user-select:none;user-select:none;touch-action:none;background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft);align-items:center;gap:8px;padding:7px 10px;display:flex}#loom-inspector .li-bar b{font-size:12px}#loom-inspector .li-brand{pointer-events:none;flex:none;align-items:center;gap:6px;display:inline-flex}#loom-inspector .li-brand svg{color:var(--li-key)}#loom-inspector .li-bar .li-sp{flex:1}#loom-inspector .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:6px;flex:none;justify-content:center;align-items:center;width:26px;height:26px;padding:0;display:inline-flex}#loom-inspector .li-bar button:hover{border-color:var(--li-accent)}#loom-inspector .li-body{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;background:0 0;flex:1;min-height:0;padding:8px 4px;overflow:auto}#loom-inspector .li-body::-webkit-scrollbar{width:8px;height:8px}#loom-inspector .li-body::-webkit-scrollbar-track{background:0 0}#loom-inspector .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector.li-min .li-body,#loom-inspector.li-min .li-tabs{display:none}#loom-inspector .li-stat-v,#loom-inspector .li-perfh-fps{font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector svg{pointer-events:none;margin:0 auto;display:block}#loom-inspector .li-bar button svg{width:100%;height:100%;display:block}#loom-inspector .li-tabs{border-bottom:2px solid var(--li-accent-soft);background:0 0;flex:none;align-items:flex-end;gap:8px;min-height:28px;padding:0 8px;display:flex}#loom-inspector .li-perfh{letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted);justify-content:space-between;align-items:baseline;padding:6px 10px 4px;font-size:10px;display:flex}#loom-inspector .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}#loom-inspector .li-perfh-fps.h-ok{color:var(--li-num)}#loom-inspector .li-perfh-fps.h-warn{color:var(--li-str)}#loom-inspector .li-perfh-fps.h-bad{color:var(--li-bool)}#loom-inspector .li-histo{margin:0 10px 8px}#loom-inspector .li-histo svg{background:var(--li-hover);border-radius:5px;width:100%;height:24px;display:block}#loom-inspector .li-histo rect.h-ok{fill:var(--li-accent)}#loom-inspector .li-histo rect.h-warn{fill:var(--li-str)}#loom-inspector .li-histo rect.h-bad{fill:var(--li-bool)}#loom-inspector .li-hblock{border-bottom:1px solid var(--li-border-soft);align-items:center;gap:12px;margin:0 10px;padding:2px 0 10px;display:flex}#loom-inspector .li-hblock svg{flex:none;margin:0}#loom-inspector .li-gtrack{stroke:var(--li-hover)}#loom-inspector .li-garc{transition:stroke-dasharray .2s}#loom-inspector .li-garc.h-ok{stroke:var(--li-num)}#loom-inspector .li-garc.h-warn{stroke:var(--li-str)}#loom-inspector .li-garc.h-bad{stroke:var(--li-bool)}#loom-inspector .li-gnum{fill:var(--li-fg);font:600 22px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-gnum.h-ok{fill:var(--li-num)}#loom-inspector .li-gnum.h-warn{fill:var(--li-str)}#loom-inspector .li-gnum.h-bad{fill:var(--li-bool)}#loom-inspector .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}#loom-inspector .li-garc.li-loading{stroke:var(--li-muted)}#loom-inspector .li-glbl{fill:var(--li-muted);font:9px ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif}#loom-inspector .li-hstats{flex:auto;min-width:0}#loom-inspector .li-hstats .li-stat{padding:2px 0}#loom-inspector .li-hlabel{letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px;font-size:10.5px}#loom-inspector .li-hlabel.h-ok{color:var(--li-num)}#loom-inspector .li-hlabel.h-warn{color:var(--li-str)}#loom-inspector .li-hlabel.h-bad{color:var(--li-bool)}#loom-inspector .li-stat{border-bottom:1px dashed var(--li-border-soft);justify-content:space-between;align-items:baseline;gap:10px;padding:1px 0;display:flex}#loom-inspector .li-pane>.li-stat{margin:0 10px}#loom-inspector .li-stat:last-child{border-bottom:0}#loom-inspector .li-stat-k{color:var(--li-muted);white-space:nowrap}#loom-inspector .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}#loom-inspector .li-stat-v.hi{color:var(--li-key)}#loom-inspector .li-stat-v.lo,#loom-inspector .li-stat-v.h-ok{color:var(--li-num)}#loom-inspector .li-stat-v.h-warn{color:var(--li-str)}#loom-inspector .li-stat-v.h-bad{color:var(--li-bool)}#loom-inspector .li-gns-h{box-sizing:border-box;cursor:pointer;will-change:transform;height:22px;color:var(--li-muted);text-transform:uppercase;letter-spacing:.05em;-webkit-user-select:none;user-select:none;align-items:center;gap:6px;padding:0 10px;font-size:10px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-gns-h:hover{background:var(--li-hover)}#loom-inspector .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}#loom-inspector .li-glocate{pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;flex:none;align-items:center;margin-left:auto;transition:opacity .12s;display:flex}#loom-inspector .li-gns-h:hover .li-glocate{opacity:.75}#loom-inspector .li-glocate:hover{opacity:1;color:var(--li-accent)}#loom-inspector .li-chev{color:var(--li-muted);flex:none;margin:0;transition:transform .12s}#loom-inspector .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}#loom-inspector .li-grow{box-sizing:border-box;cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px 0 22px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-grow-child{padding-left:30px}#loom-inspector .li-grow:hover{background:var(--li-hover)}#loom-inspector .li-gicon{flex:none;margin:0}#loom-inspector .li-gi-state{color:var(--li-key)}#loom-inspector .li-gi-computed{color:var(--li-num)}#loom-inspector .li-gi-dim{color:var(--li-muted);opacity:.7}#loom-inspector .li-glabel{color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;overflow:hidden}#loom-inspector .li-gval{color:var(--li-muted);white-space:nowrap;font-variant-numeric:tabular-nums;text-overflow:ellipsis;min-width:0;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;overflow:hidden}#loom-inspector .li-gv-num{color:var(--li-num)}#loom-inspector .li-gv-str{color:var(--li-str)}#loom-inspector .li-gv-bool{color:var(--li-bool)}#loom-inspector .li-gv-nul{color:var(--li-nul)}#loom-inspector .li-gval.li-edit{cursor:text;border-bottom:1px dotted #0000}#loom-inspector .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}#loom-inspector .li-gval.li-edit.li-gv-bool{cursor:pointer}#loom-inspector .li-gedit{font:inherit;color:var(--li-input-fg);background:var(--li-input-bg);outline:1px solid var(--li-accent);border:0;border-radius:3px;width:9ch;min-width:0;padding:0 4px;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-flash{animation:.6s ease-out li-insp-flash}#loom-inspector .li-trace{flex-direction:column;height:100%;display:flex}#loom-inspector .li-tr-bar{border-bottom:1px solid var(--li-border-soft);flex:none;align-items:center;gap:6px;margin-top:-8px;padding:5px 8px;display:flex}#loom-inspector .li-tr-live{vertical-align:middle;box-sizing:border-box;background:var(--li-bool);border-radius:50%;width:7px;height:7px;margin-left:6px;animation:1s step-end infinite li-tr-blink;display:inline-block}#loom-inspector .li-tr-live.off{background:var(--li-bool);opacity:.3;animation:none}#loom-inspector .li-tr-live.inactive{display:none}#loom-inspector .li-tr-btn{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;justify-content:center;align-items:center;width:24px;height:22px;display:inline-flex}#loom-inspector .li-tr-btn:hover{background:var(--li-bar-bg)}#loom-inspector .li-tr-btn svg{flex:none;width:12px;height:12px}#loom-inspector .li-tr-filter{min-width:0;font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);border-radius:5px;outline:none;flex:auto;height:22px;padding:2px 8px}#loom-inspector .li-tr-filter::placeholder{color:var(--li-muted)}#loom-inspector .li-tr-filter:focus{border-color:var(--li-accent)}#loom-inspector .li-tr-mode{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);cursor:pointer;border-radius:5px;flex:none;height:22px;padding:0 4px}#loom-inspector .li-tr-scroll{scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;flex:auto;min-height:0;padding:6px 0;position:relative;overflow:auto}#loom-inspector .li-tr-scroll::-webkit-scrollbar{width:8px}#loom-inspector .li-tr-scroll::-webkit-scrollbar-thumb{background:var(--li-scroll);background-clip:padding-box;border:2px solid #0000;border-radius:4px}#loom-inspector .li-tr{cursor:default;will-change:transform;align-items:center;gap:7px;height:22px;padding:0 10px;font-size:11.5px;display:flex;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr-mark:before{content:\"\";background:var(--li-accent);opacity:.6;height:2px;position:absolute;top:0;left:0;right:0}#loom-inspector .li-tr:hover{background:var(--li-hover)}#loom-inspector .li-tr-time{color:var(--li-muted);font-variant-numeric:tabular-nums;opacity:.7;flex:none;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace;font-size:10px}#loom-inspector .li-tr-name{max-width:45%;color:var(--li-fg);white-space:nowrap;text-overflow:ellipsis;cursor:pointer;flex:none;overflow:hidden}#loom-inspector .li-tr-name:hover{color:var(--li-accent);text-decoration:underline}#loom-inspector .li-tr-change{white-space:nowrap;text-overflow:ellipsis;flex:auto;min-width:0;overflow:hidden}#loom-inspector .li-tr-val{font-variant-numeric:tabular-nums;font-family:ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector .li-tr-arrow{color:var(--li-muted)}#loom-inspector .li-tr-src{color:var(--li-muted);margin-left:6px;font-style:italic}#loom-inspector .li-tr-src:empty{margin-left:0}#loom-inspector .li-tr-kind{text-align:center;border-radius:3px;flex:none;width:15px;font-size:9px;font-weight:700;line-height:14px}#loom-inspector .li-tr-kind-write{color:var(--li-bool);background:var(--li-hover)}#loom-inspector .li-tr-kind-read{color:var(--li-num);background:var(--li-hover)}#loom-inspector .li-trace.li-tr-paused .li-tr{opacity:.5}#loom-inspector .li-tabscroll{scrollbar-width:none;flex:auto;align-items:flex-end;gap:1px;min-width:0;margin-top:6px;display:flex;overflow-x:auto}#loom-inspector .li-tabscroll::-webkit-scrollbar{display:none}#loom-inspector .li-tab{font:inherit;color:var(--li-muted);background:var(--li-fill);cursor:pointer;white-space:nowrap;letter-spacing:.04em;border:0;border-radius:5px 5px 0 0;flex:none;width:max-content;padding:5px 11px;font-size:10.5px;transition:color .12s,background .12s}#loom-inspector .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}#loom-inspector .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}#loom-inspector-menu{z-index:2147483647;min-width:150px;color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);border-radius:9px;flex-direction:column;gap:1px;padding:5px;font:11px/1.45 ui-sans-serif,-apple-system,SF Pro Text,Inter,system-ui,sans-serif;display:flex;position:fixed;box-shadow:0 4px 16px #00000038}#loom-inspector-menu[hidden]{display:none}#loom-inspector-menu svg{pointer-events:none;display:block}#loom-inspector-menu .li-menu-item{font:inherit;color:var(--li-fg);text-align:left;cursor:pointer;white-space:nowrap;background:0 0;border:0;border-radius:6px;align-items:center;gap:10px;padding:6px 8px;display:flex}#loom-inspector-menu .li-menu-item:hover{background:var(--li-hover)}#loom-inspector-menu .li-menu-item>span:first-child{flex:auto}#loom-inspector-menu .li-menu-val{color:var(--li-muted);text-transform:capitalize;flex:none;align-items:center;gap:5px;display:inline-flex}#loom-inspector-menu .li-menu-val svg{color:var(--li-accent)}#loom-inspector-menu .li-kbd{color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;flex:none;padding:1px 5px;font:10px ui-monospace,SF Mono,JetBrains Mono,Menlo,monospace}#loom-inspector *,#loom-inspector-menu *{box-sizing:border-box}#loom-inspector button,#loom-inspector-menu button{appearance:none;-webkit-tap-highlight-color:transparent;outline:none;min-height:0;margin:0;line-height:1.5}@keyframes li-insp-flash{0%{background:var(--li-accent-soft)}to{background:0 0}}@keyframes li-tr-blink{50%{opacity:.2}}", x = "loom-inspector";
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
function S(e, t) {
	return Te(ue(e, t));
}
function Ee(e) {
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="${e}" height="${e}" viewBox="0 0 96 96" fill="none" aria-hidden="true"><defs><linearGradient id="li-loom-a" x1="16" y1="16" x2="60" y2="60" gradientUnits="userSpaceOnUse"><stop stop-color="#8b6cff"/><stop offset="1" stop-color="#5b8cff"/></linearGradient><linearGradient id="li-loom-b" x1="36" y1="36" x2="80" y2="80" gradientUnits="userSpaceOnUse"><stop stop-color="#2dd4ee"/><stop offset="1" stop-color="#0ea5b7"/></linearGradient></defs><rect x="16" y="16" width="44" height="44" rx="15" stroke="url(#li-loom-a)" stroke-width="11"/><rect x="36" y="36" width="44" height="44" rx="15" stroke="url(#li-loom-b)" stroke-width="11"/><path d="M27 60 H45" stroke="url(#li-loom-a)" stroke-width="11" stroke-linecap="round"/></svg>`);
}
//#endregion
//#region src/devtools/graph.tsx
var De = 300, Oe = 22, ke = 16, C = null, w = /* @__PURE__ */ new Map(), Ae = 0, T = [], je = [], Me = [], Ne = null, Pe = -1, Fe = 0, Ie = !1, Le = !1, E = /* @__PURE__ */ new Set(), Re = -1;
function ze() {
	return C = ie({
		rowHeight: Oe,
		key: (e) => e.kind === "header" ? `g${e.gid}` : e.node.id,
		render: $e
	}), C.el.classList.add("li-pane", "li-graph"), C.el;
}
function Be(e) {
	return Ke(e.id).length > 0;
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
	let a = ce(t, ke);
	!r && !Ie && e.dataset.prev !== void 0 && e.dataset.prev !== a && Xe(e), i.textContent = a, i.className = `li-gval${i.classList.contains("li-edit") ? " li-edit" : ""} ${le(t)}`, e.dataset.prev = a;
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
	t.matches(":hover") && D(Ke(e), !0);
}
function Ke(e) {
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
function qe(e) {
	let t = [], n = /* @__PURE__ */ new Set();
	for (let r of w.values()) if (r.group === e) for (let e of Ke(r.id)) n.has(e) || (n.add(e), t.push(e));
	return t;
}
function Je(e) {
	if (!e.isConnected) return null;
	if (e instanceof Element) return e.getBoundingClientRect();
	let t = document.createRange();
	return t.selectNode(e), t.getBoundingClientRect();
}
function D(e, t) {
	for (let e of Me) e.remove();
	if (Me = [], t) for (let t of e) {
		let e = Je(t);
		if (!e || e.width === 0 && e.height === 0) continue;
		let n = document.createElement("div");
		n.style.cssText = `position:fixed;left:${e.left}px;top:${e.top}px;width:${e.width}px;height:${e.height}px;border:1.5px solid #ff9500;border-radius:0;pointer-events:none;z-index:2147483646`, document.body.append(n), Me.push(n);
	}
}
function Ye(e) {
	let t = performance.now();
	t - Ae >= De && (w = new Map(ae({ active: !0 }).nodes.map((e) => [e.id, e])), Ae = t), D(Ke(e), !0);
}
function Xe(e) {
	e.classList.remove("li-flash"), e.offsetWidth, e.classList.add("li-flash");
}
function Ze(e, t) {
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
function Qe(e, t) {
	let n = t[0], r = n ? n.label.lastIndexOf(".") : -1;
	return n && r > 0 ? n.label.slice(0, r) : `props #${e}`;
}
function $e(e, t) {
	if (e.kind === "header") return t ? tt(t, e) : et(e);
	let n = t ? rt(t, e) : nt(e);
	return e.node.id === Re && (Xe(n), Re = -1), n;
}
function et(e) {
	let t = /* @__PURE__ */ v("span", {
		class: "li-gns-c",
		children: `(${e.count})`
	}), n = /* @__PURE__ */ v("span", {
		class: "li-gns-lbl",
		children: e.label
	}), r = S(be, 11);
	r.classList.add("li-chev");
	let i = /* @__PURE__ */ v("span", {
		class: "li-glocate",
		title: "Scroll into view"
	});
	i.append(S(xe, 11));
	let a = /* @__PURE__ */ y("div", {
		class: "li-gns-h",
		children: [
			r,
			n,
			t,
			i
		]
	}), o = e.gid;
	return E.has(o) && a.classList.add("collapsed"), a.onclick = () => {
		E.has(o) ? E.delete(o) : E.add(o), C?.setItems(ot());
	}, i.onclick = (e) => {
		e.stopPropagation(), Ze(qe(o), () => a.matches(":hover"));
	}, a.onmouseenter = () => D(qe(o), !0), a.onmouseleave = () => D(qe(o), !1), a;
}
function tt(e, t) {
	let n = e.querySelector(".li-gns-c");
	n && (n.textContent = `(${t.count})`);
	let r = e.querySelector(".li-gns-lbl");
	return r && (r.textContent = t.label), e.classList.toggle("collapsed", E.has(t.gid)), e;
}
function nt(e) {
	let t = e.node, n = /* @__PURE__ */ v("span", { class: "li-gval" }), r = Be(t), i = S(t.kind === "computed" ? ye : r ? _e : ve, 13);
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
	if (e.child && o.classList.add("li-grow-child"), o.onmouseenter = () => D(Ke(t.id), !0), o.onmouseleave = () => D(Ke(t.id), !1), He(t) && t.source) {
		n.classList.add("li-edit");
		let e = t.source;
		n.onclick = () => We(t.id, e, n, o);
	}
	return Ue(o, t.value, t.id), o;
}
function rt(e, t) {
	return Ue(e, t.node.value, t.node.id), e;
}
function it() {
	let e = je.length;
	for (let t of T) e += 1 + (E.has(t.gid) ? 0 : t.signals.length);
	return e;
}
function at(e) {
	let t = e;
	for (let e of T) {
		if (t === 0) return {
			kind: "header",
			gid: e.gid,
			label: e.label,
			count: e.signals.length
		};
		if (--t, !E.has(e.gid)) {
			if (t < e.signals.length) return {
				kind: "signal",
				node: e.signals[t],
				child: !0
			};
			t -= e.signals.length;
		}
	}
	return t < je.length ? {
		kind: "signal",
		node: je[t],
		child: !1
	} : void 0;
}
function ot() {
	return {
		length: it(),
		at
	};
}
function st() {
	if (!C) return;
	let e = ae({ active: !0 }).nodes;
	w = new Map(e.map((e) => [e.id, e])), Ae = performance.now();
	let t = /* @__PURE__ */ new Map(), n = [];
	for (let r of e) if (!(r.internal || r.kind === "effect")) {
		if (r.group !== void 0) {
			let e = t.get(r.group);
			e ? e.push(r) : t.set(r.group, [r]);
		} else n.push(r);
	}
	T = [];
	for (let [e, n] of t) n.sort((e, t) => (e.key ?? e.label).localeCompare(t.key ?? t.label)), T.push({
		gid: e,
		label: Qe(e, n),
		signals: n
	});
	je = n, Ie = Le, C.setItems(ot()), Ie = !1, Le = !1;
}
function ct() {
	D([], !1);
}
function lt() {
	let e = performance.now();
	e - Fe >= De && (Fe = e, st());
}
function ut() {
	if (C) {
		for (let e of C.el.querySelectorAll(".li-flash")) e.classList.remove("li-flash");
		Le = !0, C.refresh();
	}
}
function dt(e) {
	let t = 0;
	for (let n of T) {
		let r = n.signals.findIndex((t) => t.id === e);
		if (r >= 0) return E.has(n.gid) && (E.delete(n.gid), C?.setItems(ot())), t + 1 + r;
		t += 1 + (E.has(n.gid) ? 0 : n.signals.length);
	}
	let n = je.findIndex((t) => t.id === e);
	return n >= 0 ? t + n : -1;
}
function ft(e) {
	if (C === null) return;
	st();
	let t = dt(e);
	t < 0 || (Re = e, C.scrollToIndex(t));
}
function pt() {
	for (let e of Me) e.remove();
	Me = [], Ne = null, Pe = -1, C?.stop(), C = null, T = [], je = [], E.clear(), w = /* @__PURE__ */ new Map(), Ae = 0;
}
//#endregion
//#region src/devtools/trace.tsx
var mt = 22, ht = 200, gt = 1e3, _t = [
	"writes",
	"reads",
	"all"
];
function vt(e) {
	return _t.includes(e);
}
var O = null, yt = null, bt = null, k = "all", xt = null, A = null, St = null, j = null, M = null, N = [], P = [], F = !1, I = !1, L = "", Ct = 0, wt = -1, R = -1, Tt = null;
function Et(e) {
	Tt = e;
}
function Dt(e) {
	M = e, kt();
}
function Ot(e) {
	I !== e && (I = e, e ? (jt(), It()) : Mt(), kt());
}
function kt() {
	M && (M.classList.toggle("inactive", !I), M.classList.toggle("off", F), M.title = I ? F ? "Paused" : "Live — capturing" : "Trace");
}
function At() {
	Nt(), O = ie({
		rowHeight: mt,
		key: (e) => e.seq,
		render: Wt
	}), j = /* @__PURE__ */ v("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Pause / resume the trace"
	}), j.append(S(Ce, 12)), d(j, () => zt(!F));
	let e = /* @__PURE__ */ v("button", {
		type: "button",
		class: "li-tr-btn",
		title: "Clear the trace"
	});
	e.append(S(Se, 12)), d(e, () => Pt());
	let t = /* @__PURE__ */ v("select", {
		class: "li-tr-mode",
		title: "Which events to stream",
		children: _t.map((e) => /* @__PURE__ */ v("option", {
			value: e,
			children: e
		}))
	});
	t.value = k, t.addEventListener("change", () => {
		vt(t.value) && (k = t.value), Nt();
	});
	let n = /* @__PURE__ */ v("input", {
		type: "text",
		class: "li-tr-filter",
		placeholder: "filter by name…",
		spellcheck: !1
	});
	return n.addEventListener("input", () => {
		L = n.value.trim().toLowerCase(), P = L ? N.filter((e) => e.name.toLowerCase().includes(L)) : [], z();
	}), A = /* @__PURE__ */ v("div", { class: "li-tr-scroll" }), A.append(O.el), St = re(A, { transition: 120 }), A.addEventListener("pointerover", (e) => {
		let t = ((e.target instanceof Element ? e.target : null)?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && Number(t) !== R && (R = Number(t), Ye(R));
	}), A.addEventListener("pointerleave", () => {
		R = -1, ct();
	}), d(A, (e) => {
		let t = (((e.target instanceof Element ? e.target : null)?.closest(".li-tr-name"))?.closest(".li-tr"))?.dataset.id;
		t !== void 0 && (R = -1, ct(), Tt?.(Number(t)));
	}), xt = /* @__PURE__ */ y("div", {
		class: "li-pane li-trace",
		children: [/* @__PURE__ */ y("div", {
			class: "li-tr-bar",
			children: [
				j,
				t,
				n,
				e
			]
		}), A]
	}), xt;
}
function jt() {
	k !== "reads" && !yt && (yt = _([g.write], "samples")), k !== "writes" && !bt && (bt = _([g.read], "samples"));
}
function Mt() {
	yt?.stop(), yt = null, bt?.stop(), bt = null;
}
function Nt() {
	Mt(), I && jt(), wt = -1, z(), It();
}
function Pt() {
	N = [], P = [], wt = -1, z();
}
function Ft(e) {
	gt = e, N.length > e && (N.length = e), P.length > e && (P.length = e), z();
}
function It() {
	if (F || O === null) return;
	let e = [], t = yt?.read()["loom:write"]?.samples;
	if (t) for (let n of t) e.push({
		s: n,
		kind: "write"
	});
	let n = bt?.read()["loom:read"]?.samples;
	if (n) for (let t of n) e.push({
		s: t,
		kind: "read"
	});
	if (e.length === 0) return;
	k === "all" && e.sort((e, t) => h(e.s).t - h(t.s).t), Ht = !1;
	let r = (L ? P : N)[0]?.seq ?? -1, i = [];
	for (let { s: t, kind: n } of e) i.push(Bt(t, n));
	if (i.reverse(), N = i.concat(N), L) {
		let e = i.filter((e) => e.name.toLowerCase().includes(L));
		e.length > 0 && (P = e.concat(P));
	}
	N.length > gt && (N.length = gt), P.length > gt && (P.length = gt), wt = ((L ? P : N)[0]?.seq ?? -1) === r ? -1 : r, z();
}
function Lt() {
	It(), z(), requestAnimationFrame(() => O?.refresh());
}
function Rt() {
	Mt(), O = null, xt = null, A = null, St?.(), St = null, j = null, M = null, N = [], P = [], Vt.clear(), Ht = !1, wt = -1, F = !1, I = !1, L = "", k = "all", R = -1, Tt = null;
}
function zt(e) {
	F = e, j?.replaceChildren(S(e ? we : Ce, 12)), kt(), xt?.classList.toggle("li-tr-paused", e), e || It();
}
function z() {
	let e = L ? P : N;
	O?.setItems(k === "all" ? e : e.filter((e) => e.kind === (k === "writes" ? "write" : "read")));
}
function Bt(e, t) {
	let n = h(e), r = n.id, i = Ut(r), a = Kt(n.t), o = n.by, s = o === void 0 ? "" : `by ${Ut(o)}`;
	if (t === "read") return {
		seq: Ct++,
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
	let c = h(e), l = ce(c.prev, ht), ee = ce(c.next, ht);
	return {
		seq: Ct++,
		id: r,
		kind: t,
		timeText: a,
		name: i,
		prevText: l,
		prevCls: le(c.prev),
		nextText: ee,
		nextCls: le(c.next),
		srcText: s,
		full: `${i}: ${l} → ${ee} ${s || "(external)"}`
	};
}
var Vt = /* @__PURE__ */ new Map(), Ht = !1;
function Ut(e) {
	let t = Vt.get(e);
	if (t !== void 0) return t;
	if (!Ht) {
		Ht = !0;
		for (let e of ae().nodes) Vt.set(e.id, e.label);
		let t = Vt.get(e);
		if (t !== void 0) return t;
	}
	return `#${e}`;
}
function Wt(e, t) {
	let n = t ?? Gt(), r = n.children[0];
	r.textContent = e.kind === "read" ? "R" : "W", r.className = `li-tr-kind li-tr-kind-${e.kind}`, n.children[1].textContent = e.timeText, n.children[2].textContent = e.name;
	let i = n.children[3], a = i.children[0], o = i.children[1], s = i.children[2], c = i.children[3];
	return e.kind === "read" ? (a.textContent = "", a.className = "li-tr-val", o.textContent = "", s.textContent = "", s.className = "li-tr-val") : (a.textContent = e.prevText, a.className = `li-tr-val ${e.prevCls}`, o.textContent = " → ", s.textContent = e.nextText, s.className = `li-tr-val ${e.nextCls}`), c.textContent = e.srcText, n.title = e.full, n.dataset.id = String(e.id), n.classList.toggle("li-tr-mark", e.seq === wt), n;
}
function Gt() {
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
function Kt(e) {
	if (!e) return "";
	let t = new Date(e), n = (e) => String(e).padStart(2, "0");
	return `${n(t.getMinutes())}:${n(t.getSeconds())}.${String(t.getMilliseconds()).padStart(3, "0")}`;
}
//#endregion
//#region src/devtools/stats.tsx
var qt = 138, Jt = 34, Yt = 2 * Math.PI * Jt, Xt = Yt * .75, Zt = 120, Qt = Zt / 1e3, $t = 200, en = () => void 0, tn = () => !1, B = null, nn = null, rn = null, V = null, an = !1, on = null, sn = 0, cn = null, ln = null, un = 0, dn = 0, fn = 0, pn = 0, mn = 0, hn = 0, gn = 0, _n = 0, vn = 0, H = 0, yn = !1, bn = 0, xn = 0, Sn = 0, Cn = 0, wn = [], Tn = 0, En = 0, Dn = 0, On = !1, kn = null, An = null, jn = null, Mn = null, Nn = null, Pn = 100, Fn = "", In = "", Ln = !1, Rn = "", zn = 0, Bn = 0, Vn = 0, Hn = 0, Un = 0, Wn = 0, Gn = 0, Kn = 0;
function U(e) {
	return e?.() ?? 0;
}
function qn(e) {
	return () => (B?.(), e());
}
function Jn(e, t, n) {
	c(e, t, qn(n), b);
}
function Yn(e) {
	return s(qn(e), b);
}
var W = (e, t) => e * .6 + t / Qt * .4;
function G(e) {
	let t = Math.round(e);
	return t >= 1e4 ? `${Math.round(t / 1e3)}k` : t >= 1e3 ? `${(t / 1e3).toFixed(1)}k` : String(t);
}
function Xn(e) {
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
function Zn(e) {
	let t = 1e3 / e;
	return t >= 55 ? "h-ok" : t >= 30 ? "h-warn" : "h-bad";
}
function Qn(e, t, n) {
	return e ? e <= t ? "h-ok" : e <= n ? "h-warn" : "h-bad" : "";
}
function $n(e) {
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
var er = $n((e) => {
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
}), tr = $n((e) => {
	let t = new PerformanceObserver((t) => {
		for (let n of t.getEntries()) n.entryType === "largest-contentful-paint" && e(n.startTime);
	});
	return t.observe({
		type: "largest-contentful-paint",
		buffered: !0
	}), t;
}), nr = $n((e) => {
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
}), rr = typeof PerformanceObserver == "function" && PerformanceObserver.supportedEntryTypes?.includes("longtask") === !0, ir = $n((e) => {
	let t = 0, n = new PerformanceObserver((n) => {
		for (let e of n.getEntries()) t += e.duration;
		e(t);
	});
	return n.observe({
		type: "longtask",
		buffered: !0
	}), n;
});
function ar() {
	return [/* @__PURE__ */ v("circle", {
		class: "li-garc li-loading",
		cx: 44,
		cy: 44,
		r: Jt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)",
		"stroke-dasharray": `0.1 ${Yt}`
	}), /* @__PURE__ */ v("text", {
		class: "li-gnum li-loading",
		x: 44,
		y: 48,
		"text-anchor": "middle",
		children: "100"
	})];
}
function or() {
	let e = /* @__PURE__ */ v("circle", {
		class: "li-garc",
		cx: 44,
		cy: 44,
		r: Jt,
		fill: "none",
		"stroke-width": 9,
		"stroke-linecap": "round",
		transform: "rotate(135 44 44)"
	});
	Jn(e, "stroke-dasharray", () => `${Xt * Pn / 100} ${Yt}`), Jn(e, "class", () => `li-garc h-${Fn}`);
	let t = /* @__PURE__ */ v("text", {
		class: "li-gnum",
		x: 44,
		y: 48,
		"text-anchor": "middle"
	});
	return t.append(Yn(() => String(Pn))), Jn(t, "class", () => `li-gnum h-${Fn}`), [e, t];
}
function sr() {
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
				r: Jt,
				fill: "none",
				"stroke-width": 9,
				"stroke-linecap": "round",
				transform: "rotate(135 44 44)",
				"stroke-dasharray": `${Xt} ${Yt}`
			}),
			l(qn(() => Ln), or, ar),
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
function cr() {
	let e = [];
	for (let t = 0; t < qt; t++) e.push(/* @__PURE__ */ v("rect", {
		x: t + .1,
		width: .8,
		y: 20,
		height: 0
	}));
	let t = Array(qt).fill(-1), n = () => {
		B?.();
		let n = e.length - wn.length;
		for (let r = 0; r < e.length; r++) {
			let i = e[r];
			if (!i) continue;
			let a = r >= n ? wn[r - n] ?? 0 : 0;
			if (a === t[r]) continue;
			t[r] = a;
			let o = Math.max(0, Math.min(20, a / 50 * 20));
			i.setAttribute("y", String(20 - o)), i.setAttribute("height", String(o)), i.setAttribute("class", a ? Zn(a) : "");
		}
	}, r = /* @__PURE__ */ v("div", {
		class: "li-histo",
		title: q.frames,
		children: /* @__PURE__ */ v("svg", {
			preserveAspectRatio: "none",
			viewBox: `0 0 ${qt} 20`,
			role: "img",
			"aria-label": "Frame times",
			children: e
		})
	});
	return ee(r, n, b), r;
}
function K(e, t, n = "", r = "") {
	let i = /* @__PURE__ */ v("span", { class: `li-stat-v ${n}` });
	return i.append(s(qn(t), b)), /* @__PURE__ */ y("div", {
		class: "li-stat",
		children: [/* @__PURE__ */ v("span", {
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
function lr() {
	let e = /* @__PURE__ */ v("span", { class: "li-perfh-fps" });
	e.append(Yn(() => yn ? `${Math.round(H)} fps` : "— fps")), Jn(e, "class", () => `li-perfh-fps ${Rn}`);
	let t = /* @__PURE__ */ v("div", {
		class: "li-hlabel",
		title: q.health
	});
	t.append(Yn(() => yn ? In.toUpperCase() : "LOADING")), Jn(t, "class", () => Ln ? `li-hlabel h-${Fn}` : "li-hlabel");
	let n = /* @__PURE__ */ y("div", {
		class: "li-hstats",
		children: [t, K("lag", () => `${Tn.toFixed(0)} · pk ${En.toFixed(0)} ms`, "lo", q.lag)]
	});
	return n.append(ur("blocked", () => {
		if (!rr) return "—";
		let e = U(Mn);
		return e < 1e3 ? `${e.toFixed(0)} ms` : `${(e / 1e3).toFixed(1)} s`;
	}, () => {
		if (!rr) return "";
		let e = U(Mn);
		return e <= 200 ? "h-ok" : e <= 600 ? "h-warn" : "h-bad";
	}, q.blocked)), n.append(ur("CLS", () => U(kn).toFixed(2), () => {
		let e = U(kn);
		return e < .1 ? "h-ok" : e < .25 ? "h-warn" : "h-bad";
	}, q.cls)), n.append(ur("LCP", () => {
		let e = U(An);
		return e ? `${(e / 1e3).toFixed(2)} s` : "—";
	}, () => Qn(U(An), 2500, 4e3), q.lcp)), n.append(ur("INP", () => {
		let e = U(jn);
		return e ? `${e.toFixed(0)} ms` : "—";
	}, () => Qn(U(jn), 200, 500), q.inp)), /* @__PURE__ */ y("div", {
		class: "li-pane",
		children: [
			/* @__PURE__ */ y("div", {
				class: "li-perfh",
				children: [/* @__PURE__ */ v("span", {
					title: q.fps,
					children: "Performance"
				}), e]
			}),
			cr(),
			/* @__PURE__ */ y("div", {
				class: "li-hblock",
				children: [sr(), n]
			}),
			K("frame time", () => `${Cn.toFixed(1)} ms`, "", q.frameTime),
			dr() ? fr() : null,
			K("writes / s", () => G(dn), "hi", q.writes),
			K("reads / s", () => G(un), "hi", q.reads),
			K("computeds / s", () => G(fn), "", q.computedsRate),
			K("effect runs / s", () => G(pn), "lo", q.effectRuns),
			K("flushes / s", () => G(mn), "lo", q.flushes),
			K("effects / flush", () => String(_n), "", q.effectsPerFlush),
			K("flush time", () => `${vn.toFixed(1)} ms`, "", q.flushTime),
			K("creates / s", () => G(hn), "lo", q.creates),
			K("disposes / s", () => G(gn), "lo", q.disposes),
			K("states", () => String(zn), "", q.states),
			K("computeds", () => String(Bn), "", q.computeds),
			ur("unread", () => String(Kn), () => Kn > 0 ? "h-warn" : "", q.unread),
			K("effects", () => String(Vn), "", q.effects),
			K("views", () => String(Hn), "", q.views),
			K("sources", () => String(Un), "", q.sources),
			K("scopes", () => String(Wn), "", q.scopes),
			K("channels", () => String(Gn), "", q.channels)
		]
	});
}
function ur(e, t, n, r = "") {
	let i = K(e, t, "", r), a = i.querySelector(".li-stat-v");
	return a && Jn(a, "class", () => `li-stat-v ${n()}`), i;
}
function dr() {
	return performance.memory;
}
function fr() {
	return K("heap", () => {
		let e = Nn?.() ?? 0;
		return e ? `${(e / 1048576).toFixed(1)} MB` : "—";
	}, "lo", q.heap);
}
function pr() {
	let e = cn?.read(), t = e?.["loom:read"]?.count ?? 0, n = e?.["loom:write"]?.count ?? 0, r = e?.["loom:effect"]?.count ?? 0, i = e?.["loom:compute"]?.count ?? 0, a = e?.["loom:create"]?.count ?? 0, o = e?.["loom:dispose"]?.count ?? 0, s = ln?.read()?.["loom:flush"];
	un = W(un, t), dn = W(dn, n), pn = W(pn, r), fn = W(fn, i), hn = W(hn, a), gn = W(gn, o), mn = W(mn, s?.count ?? 0);
	let c = h(s?.samples.at(-1));
	if (c !== void 0 && (_n = c.batchSize, vn = c.durationMs), !yn) Ln = !1, Rn = "";
	else {
		let e = Xn(H);
		Pn = e.score, Fn = e.key, In = e.label, Ln = !0, Rn = H >= 55 ? "h-ok" : H >= 30 ? "h-warn" : "h-bad";
	}
	return ++sn;
}
function mr() {
	let e = !tn();
	if (en() === "stats" && e) {
		let e = oe();
		zn = e.states, Bn = e.computeds, Vn = e.effects - e.targetedEffects, Hn = e.targetedEffects, Un = e.sources, Wn = e.scopes, Gn = e.channels, Kn = e.unread;
	} else en() === "graph" && e ? lt() : en() === "trace" && e && It();
}
function hr() {
	document.hidden && (On = !0);
}
function gr() {
	Dn = performance.now() + $t, nn = setInterval(() => {
		let e = performance.now(), t = Dn;
		if (Dn = e + $t, document.hidden) {
			On = !0;
			return;
		}
		if (On) {
			On = !1;
			return;
		}
		Tn = Math.max(0, e - t), Tn > En && (En = Tn);
	}, $t), document.addEventListener("visibilitychange", hr), Sn = 0;
	let e = (t) => {
		if (rn = requestAnimationFrame(e), Sn) {
			let e = Math.min(t - Sn, 1e3);
			if (Cn = e, wn.push(e), wn.length > qt && wn.shift(), bn += e, xn++, bn >= 500) {
				let e = xn * 1e3 / bn;
				H = yn ? H * .5 + e * .5 : e, yn = !0, bn = 0, xn = 0;
			}
		}
		Sn = t;
	};
	rn = requestAnimationFrame(e);
}
function _r(n) {
	en = n.activeTab, tn = n.isMinimized, cn = _([
		g.read,
		g.write,
		g.compute,
		g.effect,
		g.create,
		g.dispose
	]), ln = _([g.flush], "samples"), B = i(pr, Zt, b);
	let r;
	return on = t(() => {
		kn = a(er, 0, b), An = a(tr, 0, b), jn = a(nr, 0, b), Mn = a(ir, 0, b), dr() && (Nn = i(() => dr()?.usedJSHeapSize ?? 0, 5e3, b)), r = lr();
	}, b), ee(r, () => {
		B?.(), e(mr);
	}, {
		...b,
		defer: !0,
		maxStale: Zt
	}), V = r, an = !1, gr(), r;
}
function vr() {
	on?.pause(), V && !an && (an = !0, te(V));
}
function yr() {
	on?.resume(), V && an && (an = !1, ne(V));
}
function br() {
	cn?.stop(), cn = null, ln?.stop(), ln = null, B?.stop(), B = null, nn != null && clearInterval(nn), nn = null, typeof document < "u" && document.removeEventListener("visibilitychange", hr), rn != null && cancelAnimationFrame(rn), rn = null, on?.stop(), on = null, V = null, an = !1, Nn = kn = An = jn = Mn = null, sn = 0, un = dn = fn = pn = mn = 0, hn = gn = 0, _n = vn = 0, H = 0, yn = !1, bn = xn = Sn = Cn = 0, wn.length = 0, Tn = En = 0, On = !1, Ln = !1, Pn = 100, Fn = In = Rn = "", zn = Bn = Vn = Hn = 0, Un = Wn = Gn = Kn = 0;
}
//#endregion
//#region src/devtools/panel.tsx
var xr = {
	system: he,
	light: pe,
	dark: me
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
], J = null, Cr = null, Y = null, wr = null, Tr = [], Er = null, Dr = null, Or = null, X = null, Z = null, kr = /* @__PURE__ */ new Map(), Ar = null, jr = [
	1e3,
	5e3,
	25e3
], Mr = null;
function Q() {
	if (Mr) return Mr;
	Dr = new AbortController();
	let e = { signal: Dr.signal }, t = {
		theme: n("system", b),
		min: n(!1, b),
		logSize: n(1e3, b),
		pos: n(null, b),
		size: n(null, b)
	};
	return f(t.theme, m(`${x}-theme`, p.string([
		"system",
		"light",
		"dark"
	])), e), f(t.min, m(`${x}-min`, p.boolean), e), f(t.logSize, m(`${x}-logsize`, {
		...p.number(),
		validate: (e) => jr.includes(e)
	}), e), f(t.pos, m(`${x}-pos`, p.json((e) => typeof e == "object" && !!e && "left" in e && "top" in e && typeof e.left == "number" && Number.isFinite(e.left) && typeof e.top == "number" && Number.isFinite(e.top))), e), f(t.size, m(`${x}-size`, p.json((e) => typeof e == "object" && !!e && "width" in e && "height" in e && typeof e.width == "number" && e.width > 0 && typeof e.height == "number" && e.height > 0)), e), Mr = t, t;
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
	X?.();
	let a = t.getBoundingClientRect();
	t.style.left = `${$(a.left)}px`, t.style.top = `${$(a.top)}px`, t.style.right = "auto", t.style.bottom = "auto";
	let o = document.body.style.userSelect;
	document.body.style.userSelect = "none";
	let s = () => {};
	s = u(e, n, {
		move: (e) => r(e, a),
		end: () => {
			X === s && (X = null), document.body.style.userSelect = o, i();
		}
	}), X = s;
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
	return Te(`<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="-8.571 -8.571 41.143 41.143" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${e}</svg>`);
}
function zr(e) {
	if (J || typeof document > "u") return;
	let i = e ?? document.body;
	if (Or = r({ inspect: !0 }).inspect ?? !1, !document.getElementById("loom-inspector-css")) {
		let e = document.createElement("style");
		e.id = `${x}-css`, e.textContent = se, document.head.append(e);
	}
	Z = n("stats", b);
	let a = Q().theme(), o = /* @__PURE__ */ v("span", { class: "li-menu-val" }), s = () => {
		J?.setAttribute("data-theme", a), Cr?.setAttribute("data-theme", a), o.innerHTML = ue(xr[a], 13), c.title = `Theme: ${a} (click to cycle)`;
	}, c = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-menu-item",
		title: "Click to change theme",
		children: [/* @__PURE__ */ v("span", { children: "Theme" }), o]
	});
	d(c, () => {
		let e = [
			"system",
			"light",
			"dark"
		];
		a = e[(e.indexOf(a) + 1) % e.length] ?? "system", Q().theme(a), s();
	});
	let l = /* @__PURE__ */ v("div", {
		class: "li-menu",
		hidden: !0
	});
	l.id = `${x}-menu`, l.append(c), Cr = l;
	let u = Q().logSize(), f = /* @__PURE__ */ v("span", { class: "li-menu-val" }), p = () => {
		f.textContent = `${u / 1e3}k`, Ft(u);
	}, m = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-menu-item",
		title: "Trace log size (click to cycle)",
		children: [/* @__PURE__ */ v("span", { children: "Log size" }), f]
	});
	d(m, () => {
		u = jr[(jr.indexOf(u) + 1) % jr.length] ?? 1e3, Q().logSize(u), p();
	}), l.append(m), p();
	let ie = () => {
		l.hidden = !0;
	}, ae = /* @__PURE__ */ y("button", {
		type: "button",
		class: "li-menu-item",
		title: "Hide the inspector (⌃⌘L toggles)",
		children: [/* @__PURE__ */ v("span", { children: "Hide" }), /* @__PURE__ */ v("span", {
			class: "li-kbd",
			children: "⌃⌘L"
		})]
	});
	d(ae, () => {
		ie(), Br();
	}), l.append(ae);
	let h = /* @__PURE__ */ v("button", {
		type: "button",
		title: "Settings"
	});
	h.append(Rr(ge)), d(h, (e) => {
		if (e.stopPropagation(), !l.hidden) {
			ie();
			return;
		}
		l.hidden = !1;
		let t = h.getBoundingClientRect(), n = l.getBoundingClientRect(), r = t.left;
		r + n.width > window.innerWidth - 8 && (r = t.right - n.width);
		let i = t.bottom;
		i + n.height > window.innerHeight - 8 && (i = t.top - n.height), l.style.left = `${Math.max(8, r)}px`, l.style.top = `${Math.max(8, i)}px`;
	});
	let g = /* @__PURE__ */ v("button", { type: "button" }), oe = (e) => {
		g.title = e ? "Expand" : "Collapse", g.replaceChildren(Rr(e ? fe : de));
	}, _ = Q().min();
	oe(_), d(g, () => {
		let e = !!J?.classList.toggle("li-min");
		oe(e), Q().min(e), e ? (Er?.pause(), te(pe)) : (Er?.resume(), ne(pe)), Ot(!e && Z?.() === "trace");
	});
	let ce = /* @__PURE__ */ y("span", {
		class: "li-brand",
		children: [Ee(15), /* @__PURE__ */ v("b", { children: "Loom" })]
	}), le = /* @__PURE__ */ y("div", {
		class: "li-bar",
		children: [
			ce,
			/* @__PURE__ */ v("span", { class: "li-sp" }),
			h,
			g
		]
	}), pe;
	Er = t(() => {
		pe = _r({
			activeTab: () => Z?.(),
			isMinimized: () => J?.classList.contains("li-min") ?? !1
		});
	}, b), _ && (Er.pause(), te(pe));
	let me = /* @__PURE__ */ new Map(), he = /* @__PURE__ */ new Map();
	Y = /* @__PURE__ */ v("div", { class: "li-body" });
	for (let e of Sr) {
		let t = e.id === "stats" ? pe : e.id === "graph" ? ze() : At();
		me.set(e.id, t), Y.append(t);
	}
	Et((e) => {
		Z?.("graph"), ft(e);
	});
	let _e = /* @__PURE__ */ v("div", { class: "li-tabscroll" });
	for (let e of Sr) {
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
			t.append(e), Dt(e);
		}
		d(t, () => Z?.(e.id)), he.set(e.id, t), _e.append(t);
	}
	let ve = /* @__PURE__ */ v("div", {
		class: "li-tabs",
		children: _e
	}), ye = /* @__PURE__ */ v("div", {
		class: "li-resize",
		title: "Drag to resize",
		children: /* @__PURE__ */ v("svg", {
			viewBox: "0 0 20 20",
			"aria-hidden": "true",
			children: /* @__PURE__ */ v("path", { d: "M18 10 A8 8 0 0 1 10 18" })
		})
	});
	J = /* @__PURE__ */ y("div", { children: [
		le,
		ve,
		Y,
		ye
	] }), J.id = x, _ && J.classList.add("li-min"), s(), Ir(le, J), Lr(ye, J), wr = (e) => {
		let t = e.target instanceof Node ? e.target : null;
		!l.hidden && (t === null || !l.contains(t)) && e.target !== h && ie();
	}, document.addEventListener("pointerdown", wr), i.append(J), document.body.append(l);
	let be = Q().size(), xe = Q().pos();
	if (be && (J.style.width = `${Math.max(240, Math.min(be.width, window.innerWidth - 16))}px`, J.style.height = `${Math.max(160, Math.min(be.height, window.innerHeight - 16))}px`), xe) {
		let { left: e, top: t } = Pr(J, xe.left, xe.top);
		J.style.left = `${e}px`, J.style.top = `${t}px`, J.style.right = "auto", J.style.bottom = "auto";
	}
	ee(J, () => {
		let e = Z?.();
		Ar && Ar !== e && Y && kr.set(Ar, Y.scrollTop), e === "stats" ? yr() : vr(), e !== "graph" && ct();
		for (let t of Sr) {
			let n = t.id === e, r = me.get(t.id), i = he.get(t.id);
			r && (r.style.display = n ? "" : "none"), i && (i.classList.toggle("active", n), n && i.scrollIntoView({
				inline: "nearest",
				block: "nearest",
				behavior: "smooth"
			}));
		}
		if (e && Y) {
			let t = kr.get(e) ?? 0, n = Math.max(0, Y.scrollHeight - Y.clientHeight);
			Y.scrollTop = Math.min(t, n), e === "graph" ? ut() : e === "trace" && Lt();
		}
		Ot(e === "trace" && J?.classList.contains("li-min") !== !0), Ar = e ?? null;
	}), Tr.push(re(Y, { transition: 120 }), re(_e, {
		axis: "x",
		transition: 120
	}));
}
function Br() {
	if (!(typeof document > "u")) {
		X?.(), X = null, br();
		for (let e of Tr) e();
		Tr.length = 0, Er?.stop(), Er = null, Dr?.abort(), Dr = null, Mr = null, wr && document.removeEventListener("pointerdown", wr), wr = null, Cr && o(Cr), Cr = null, J && o(J), J = null, Y = null, Z = null, kr.clear(), Ar = null, pt(), Rt(), Or !== null && r({ inspect: Or }), Or = null;
	}
}
function Vr() {
	return J !== null;
}
function Hr(e) {
	J ? Br() : zr(e);
}
//#endregion
export { Vr as inspectorMounted, zr as mountInspector, Hr as toggleInspector, Br as unmountInspector };
