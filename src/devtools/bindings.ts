// The panel's reactive-binding infrastructure, shared by the chrome (panel.tsx) and the stats tab
// (stats.tsx). Every binding is an `internal` effect so the inspector never observes itself.
import { type Stop, effect } from "loom";
import { PANEL_ID } from "./css.js";

// Shared options for every Loom node the inspector creates: internal (filtered from the
// observability it reports) and namespaced to the panel. Set once; nodes inherit it.
export const PANEL_OPTS = { internal: true, namespace: PANEL_ID } as const;

// Every reactive binding + the tab effect; all `internal`, all disposed on unmount.
const bindings: Stop[] = [];

// Run `fn` as an internal effect and remember it for disposal.
export function bind(fn: () => void): void {
  bindings.push(effect(fn, PANEL_OPTS));
}

// Dispose every binding (from unmountInspector). Stopping them drops the web-vital sources' last
// subscribers too, which auto-disconnects their PerformanceObservers.
export function disposeBindings(): void {
  for (const stop of bindings) stop();
  bindings.length = 0;
}
