// Panel stylesheet and colour palette. CSS is a template literal interpolating PANEL_ID and the
// light/dark variable blocks; presentation only, no runtime state. Extracted from the panel so
// the dev-panel module stays focused on behaviour.
export const PANEL_ID = "loom-inspector";
const SANS =
  "ui-sans-serif,-apple-system,'SF Pro Text',Inter,system-ui,sans-serif";
const MONO = "ui-monospace,'SF Mono','JetBrains Mono',Menlo,monospace";
const LIGHT_VARS = `--li-bg:#fbfbfd;--li-fg:#16161c;--li-muted:#83838c;
  --li-border:rgba(0,0,0,.17);--li-border-soft:rgba(0,0,0,.09);--li-hover:rgba(0,0,0,.05);
  --li-fill:#eeeef3;--li-accent:#6d5cf0;--li-accent-soft:rgba(109,92,240,.16);
  --li-bar-bg:rgba(109,92,240,.1);--li-key:#6d5cf0;--li-node:#51515b;--li-vkind:#2f7ff0;
  --li-num:#2f9e5a;--li-str:#c0801f;--li-bool:#e5446b;--li-nul:#83838c;--li-input-bg:#fff;
  --li-input-fg:#16161c;--li-uline:rgba(0,0,0,.3);--li-scroll:rgba(0,0,0,.2)`;
const DARK_VARS = `--li-bg:#15151d;--li-fg:#ededf0;--li-muted:#8f8f9b;--li-border:rgba(255,255,255,.14);
  --li-border-soft:rgba(255,255,255,.08);--li-hover:rgba(255,255,255,.06);--li-fill:#1d1d28;
  --li-accent:#8b7cff;--li-accent-soft:rgba(139,124,255,.3);--li-bar-bg:rgba(139,124,255,.12);
  --li-key:#8b7cff;--li-node:#b6b6c0;--li-vkind:#5b9dff;--li-num:#57c97e;--li-str:#f0b65a;
  --li-bool:#ff7a9c;--li-nul:#8f8f9b;--li-input-bg:#ededf0;--li-input-fg:#16161c;--li-uline:rgba(255,255,255,.4);
  --li-scroll:rgba(255,255,255,.22)`;
export const CSS = `
#${PANEL_ID}{${DARK_VARS};
  position:fixed;right:12px;bottom:12px;width:360px;height:440px;max-height:calc(100vh - 24px);
  z-index:2147483647;display:flex;flex-direction:column;font:12px/1.5 ${SANS};
  color:var(--li-fg);background:var(--li-bg);border:1px solid var(--li-border);
  border-radius:10px;box-shadow:0 6px 22px rgba(0,0,0,.26);overflow:hidden}
/* Self-contained reset so host-page element styles (e.g. a global button{min-height})
   can't bleed into the panel (or its portalled menu) and break the chrome dimensions. */
#${PANEL_ID} *,#${PANEL_ID}-menu *{box-sizing:border-box}
#${PANEL_ID} button,#${PANEL_ID}-menu button{min-height:0;margin:0;line-height:1.5}
#${PANEL_ID}-menu{${DARK_VARS};
  position:fixed;z-index:2147483647;min-width:150px;padding:5px;display:flex;flex-direction:column;gap:1px;
  font:11px/1.45 ${SANS};color:var(--li-fg);background:var(--li-bg);
  border:1px solid var(--li-border);border-radius:9px;box-shadow:0 4px 16px rgba(0,0,0,.22)}
#${PANEL_ID}-menu[hidden]{display:none}
#${PANEL_ID}-menu svg{display:block;pointer-events:none}
#${PANEL_ID}[data-theme=light],#${PANEL_ID}-menu[data-theme=light]{${LIGHT_VARS}}
@media (prefers-color-scheme:light){#${PANEL_ID}[data-theme=system],#${PANEL_ID}-menu[data-theme=system]{${LIGHT_VARS}}}
#${PANEL_ID}.li-min{height:auto!important}
#${PANEL_ID}.li-min .li-resize{display:none}
#${PANEL_ID} .li-resize{position:absolute;right:0;bottom:0;width:20px;height:20px;cursor:nwse-resize;
  touch-action:none}
#${PANEL_ID} .li-resize svg{width:100%;height:100%}
#${PANEL_ID} .li-resize path{fill:none;stroke:var(--li-muted);stroke-width:1.6;stroke-linecap:round;
  opacity:.55;transition:stroke .15s,opacity .15s}
#${PANEL_ID} .li-resize:hover path{stroke:var(--li-accent);opacity:1}
#${PANEL_ID} .li-bar{display:flex;align-items:center;gap:8px;padding:7px 10px;cursor:move;
  user-select:none;touch-action:none;
  background:var(--li-bar-bg);border-bottom:1px solid var(--li-border-soft)}
#${PANEL_ID} .li-bar b{font-size:12px}
#${PANEL_ID} .li-brand{display:inline-flex;align-items:center;gap:6px;flex:0 0 auto;pointer-events:none}
#${PANEL_ID} .li-brand svg{color:var(--li-key)}
#${PANEL_ID} .li-bar .li-sp{flex:1}
#${PANEL_ID} .li-bar button{font:inherit;color:var(--li-fg);background:var(--li-fill);border:1px solid var(--li-border);
  border-radius:6px;width:26px;height:26px;padding:0;cursor:pointer;flex:0 0 auto;
  display:inline-flex;align-items:center;justify-content:center}
#${PANEL_ID} .li-bar button:hover{border-color:var(--li-accent)}
#${PANEL_ID}-menu .li-menu-item{font:inherit;color:var(--li-fg);background:transparent;border:0;border-radius:6px;
  padding:6px 8px;text-align:left;cursor:pointer;display:flex;align-items:center;gap:10px;white-space:nowrap}
#${PANEL_ID}-menu .li-menu-item:hover{background:var(--li-hover)}
#${PANEL_ID}-menu .li-menu-item>span:first-child{flex:1 1 auto}
#${PANEL_ID}-menu .li-menu-val{flex:0 0 auto;display:inline-flex;align-items:center;gap:5px;color:var(--li-muted);text-transform:capitalize}
#${PANEL_ID}-menu .li-menu-val svg{color:var(--li-accent)}
#${PANEL_ID}-menu .li-kbd{flex:0 0 auto;font:10px ${MONO};color:var(--li-muted);background:var(--li-fill);border:1px solid var(--li-border-soft);border-radius:4px;padding:1px 5px}
#${PANEL_ID} .li-body{flex:1;min-height:0;overflow:auto;padding:8px 4px;background:transparent;
  scrollbar-width:thin;scrollbar-color:var(--li-scroll) transparent;
  --li-fade-a:0px;--li-fade-b:0px;
  -webkit-mask-image:linear-gradient(to bottom,transparent 0,#000 var(--li-fade-a),#000 calc(100% - var(--li-fade-b)),transparent 100%);
  -webkit-mask-repeat:no-repeat;-webkit-mask-size:100% 100%;
  mask-image:linear-gradient(to bottom,transparent 0,#000 var(--li-fade-a),#000 calc(100% - var(--li-fade-b)),transparent 100%);
  mask-repeat:no-repeat;mask-size:100% 100%}
#${PANEL_ID} .li-body::-webkit-scrollbar{width:8px;height:8px}
#${PANEL_ID} .li-body::-webkit-scrollbar-track{background:transparent}
#${PANEL_ID} .li-body::-webkit-scrollbar-thumb{background:var(--li-scroll);border-radius:4px;
  border:2px solid transparent;background-clip:padding-box}
#${PANEL_ID} .li-empty{color:var(--li-muted);padding:16px 10px;font-size:12px;line-height:1.5}
#${PANEL_ID}.li-min .li-body,#${PANEL_ID}.li-min .li-tabs{display:none}
#${PANEL_ID} .li-stat-v,#${PANEL_ID} .li-perfh-fps{font-family:${MONO}}
#${PANEL_ID} svg{display:block;margin:0 auto;pointer-events:none}
#${PANEL_ID} .li-bar button svg{display:block;width:100%;height:100%}
#${PANEL_ID} .li-tabs{display:flex;align-items:flex-end;gap:8px;padding:0 8px;flex:0 0 auto;min-height:28px;
  background:transparent;border-bottom:2px solid var(--li-accent-soft)}
#${PANEL_ID} .li-perfh{display:flex;justify-content:space-between;align-items:baseline;
  padding:6px 10px 4px;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--li-muted)}
#${PANEL_ID} .li-perfh-fps{font-variant-numeric:tabular-nums;letter-spacing:0}
#${PANEL_ID} .li-perfh-fps.h-ok{color:var(--li-num)}
#${PANEL_ID} .li-perfh-fps.h-warn{color:var(--li-str)}
#${PANEL_ID} .li-perfh-fps.h-bad{color:var(--li-bool)}
#${PANEL_ID} .li-histo{margin:0 10px 8px}
#${PANEL_ID} .li-histo svg{display:block;width:100%;height:24px;background:var(--li-hover);border-radius:5px}
#${PANEL_ID} .li-histo rect.h-ok{fill:var(--li-accent)}
#${PANEL_ID} .li-histo rect.h-warn{fill:var(--li-str)}
#${PANEL_ID} .li-histo rect.h-bad{fill:var(--li-bool)}
#${PANEL_ID} .li-hblock{display:flex;gap:12px;align-items:center;margin:0 10px;padding:2px 0 10px;
  border-bottom:1px solid var(--li-border-soft)}
#${PANEL_ID} .li-hblock svg{flex:0 0 auto;margin:0}
#${PANEL_ID} .li-gtrack{stroke:var(--li-hover)}
#${PANEL_ID} .li-garc{transition:stroke-dasharray .2s}
#${PANEL_ID} .li-garc.h-ok{stroke:var(--li-num)}
#${PANEL_ID} .li-garc.h-warn{stroke:var(--li-str)}
#${PANEL_ID} .li-garc.h-bad{stroke:var(--li-bool)}
#${PANEL_ID} .li-gnum{font:600 22px ${MONO};fill:var(--li-fg)}
#${PANEL_ID} .li-gnum.h-ok{fill:var(--li-num)}
#${PANEL_ID} .li-gnum.h-warn{fill:var(--li-str)}
#${PANEL_ID} .li-gnum.h-bad{fill:var(--li-bool)}
#${PANEL_ID} .li-gnum.li-loading{fill:var(--li-muted);opacity:.5}
#${PANEL_ID} .li-garc.li-loading{stroke:var(--li-muted)}
#${PANEL_ID} .li-glbl{fill:var(--li-muted);font:9px ${SANS}}
#${PANEL_ID} .li-hstats{flex:1 1 auto;min-width:0}
#${PANEL_ID} .li-hstats .li-stat{padding:2px 0}
#${PANEL_ID} .li-hlabel{font-size:10.5px;letter-spacing:.08em;color:var(--li-muted);padding:0 0 2px}
#${PANEL_ID} .li-hlabel.h-ok{color:var(--li-num)}
#${PANEL_ID} .li-hlabel.h-warn{color:var(--li-str)}
#${PANEL_ID} .li-hlabel.h-bad{color:var(--li-bool)}
#${PANEL_ID} .li-stat{display:flex;justify-content:space-between;align-items:baseline;gap:10px;
  padding:1px 0;border-bottom:1px dashed var(--li-border-soft)}
#${PANEL_ID} .li-pane>.li-stat{margin:0 10px}
#${PANEL_ID} .li-stat:last-child{border-bottom:0}
#${PANEL_ID} .li-stat-k{color:var(--li-muted);white-space:nowrap}
#${PANEL_ID} .li-stat-v{font-variant-numeric:tabular-nums;text-align:right;color:var(--li-fg)}
#${PANEL_ID} .li-stat-v.hi{color:var(--li-key)}
#${PANEL_ID} .li-stat-v.lo{color:var(--li-num)}
#${PANEL_ID} .li-stat-v.h-ok{color:var(--li-num)}
#${PANEL_ID} .li-stat-v.h-warn{color:var(--li-str)}
#${PANEL_ID} .li-stat-v.h-bad{color:var(--li-bool)}
#${PANEL_ID} .li-gns-h{position:absolute;top:0;left:0;right:0;height:22px;box-sizing:border-box;
  display:flex;align-items:center;gap:6px;padding:0 10px;cursor:pointer;will-change:transform;
  color:var(--li-muted);font-size:10px;text-transform:uppercase;letter-spacing:.05em;user-select:none}
#${PANEL_ID} .li-gns-h:hover{background:var(--li-hover)}
#${PANEL_ID} .li-gns-c{font-variant-numeric:tabular-nums;opacity:.7}
#${PANEL_ID} .li-glocate{margin-left:auto;flex:0 0 auto;display:flex;align-items:center;
  pointer-events:auto;cursor:pointer;color:var(--li-muted);opacity:0;transition:opacity .12s}
#${PANEL_ID} .li-gns-h:hover .li-glocate{opacity:.75}
#${PANEL_ID} .li-glocate:hover{opacity:1;color:var(--li-accent)}
#${PANEL_ID} .li-chev{flex:0 0 auto;margin:0;color:var(--li-muted);transition:transform .12s ease}
#${PANEL_ID} .li-gns-h.collapsed .li-chev{transform:rotate(-90deg)}
#${PANEL_ID} .li-grow{position:absolute;top:0;left:0;right:0;height:22px;box-sizing:border-box;
  display:flex;align-items:center;gap:7px;padding:0 10px 0 22px;font-size:11.5px;cursor:default;
  will-change:transform}
#${PANEL_ID} .li-grow-child{padding-left:30px}
#${PANEL_ID} .li-grow:hover{background:var(--li-hover)}
#${PANEL_ID} .li-gicon{flex:0 0 auto;margin:0}
#${PANEL_ID} .li-gi-state{color:var(--li-key)}
#${PANEL_ID} .li-gi-computed{color:var(--li-num)}
#${PANEL_ID} .li-gi-dim{color:var(--li-muted);opacity:.7}
#${PANEL_ID} .li-glabel{color:var(--li-fg);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#${PANEL_ID} .li-gns-tag{flex:0 0 auto;font-size:9px;color:var(--li-muted);background:var(--li-fill);
  border-radius:3px;padding:0 4px;text-transform:uppercase;letter-spacing:.03em}
#${PANEL_ID} .li-gval{font-family:${MONO};color:var(--li-muted);white-space:nowrap;
  font-variant-numeric:tabular-nums;min-width:0;overflow:hidden;text-overflow:ellipsis}
#${PANEL_ID} .li-gv-num{color:var(--li-num)}
#${PANEL_ID} .li-gv-str{color:var(--li-str)}
#${PANEL_ID} .li-gv-bool{color:var(--li-bool)}
#${PANEL_ID} .li-gv-nul{color:var(--li-nul)}
#${PANEL_ID} .li-gval.li-edit{cursor:text;border-bottom:1px dotted transparent}
#${PANEL_ID} .li-gval.li-edit:hover{border-bottom-color:var(--li-uline)}
#${PANEL_ID} .li-gval.li-edit.li-gv-bool{cursor:pointer}
#${PANEL_ID} .li-gedit{font:inherit;font-family:${MONO};color:var(--li-input-fg);
  background:var(--li-input-bg);border:0;border-radius:3px;padding:0 4px;min-width:0;width:9ch;
  outline:1px solid var(--li-accent)}
#${PANEL_ID} .li-flash{animation:li-insp-flash .6s ease-out}
@keyframes li-insp-flash{from{background:var(--li-accent-soft)}to{background:transparent}}
#${PANEL_ID} .li-tabscroll{display:flex;align-items:flex-end;gap:1px;flex:1 1 auto;margin-top:6px;
  min-width:0;overflow-x:auto;scrollbar-width:none;
  --li-fade-a:0px;--li-fade-b:0px;
  -webkit-mask-image:linear-gradient(to right,transparent 0,#000 var(--li-fade-a),#000 calc(100% - var(--li-fade-b)),transparent 100%);
  -webkit-mask-repeat:no-repeat;-webkit-mask-size:100% 100%;
  mask-image:linear-gradient(to right,transparent 0,#000 var(--li-fade-a),#000 calc(100% - var(--li-fade-b)),transparent 100%);
  mask-repeat:no-repeat;mask-size:100% 100%}
#${PANEL_ID} .li-tabscroll::-webkit-scrollbar{display:none}
#${PANEL_ID} .li-tab{font:inherit;font-size:10.5px;color:var(--li-muted);background:var(--li-fill);border:0;
  border-radius:5px 5px 0 0;padding:5px 11px;cursor:pointer;white-space:nowrap;flex:0 0 auto;
  letter-spacing:.04em;transition:color .12s,background .12s}
#${PANEL_ID} .li-tab:hover{color:var(--li-fg);background:var(--li-bar-bg)}
#${PANEL_ID} .li-tab.active{color:var(--li-fg);background:var(--li-accent-soft)}
#${PANEL_ID} .li-spark{flex:0 0 auto;display:flex;align-items:center;gap:5px;opacity:.82;align-self:center;padding-top:2px}
#${PANEL_ID} .li-spark svg{margin:0}
#${PANEL_ID} .li-spk-cr{stop-color:var(--li-num)}
#${PANEL_ID} .li-spk-cw{stop-color:var(--li-bool)}
`;
