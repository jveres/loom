// The panel's reactive-binding infrastructure, shared by the chrome (panel.tsx) and the stats tab
// (stats.tsx). Every binding is an `internal` effect so the inspector never observes itself.
import { type EffectOptions, effect, type Stop } from "loom";

// Shared options for every Loom node the inspector creates: internal, so the inspector never appears
// in the observability it reports. Set once; nodes inherit it.
export const PANEL_OPTS = { internal: true } as const;

// Every reactive binding + the tab effect; all `internal`, all disposed on unmount.
const bindings: Stop[] = [];

// Run `fn` as an internal effect and remember it for disposal. `extra` merges over PANEL_OPTS — used
// to opt a binding into the deferred lane ({ defer, maxStale }).
export function bind(fn: () => void, extra?: EffectOptions): void {
  bindings.push(effect(fn, extra ? { ...PANEL_OPTS, ...extra } : PANEL_OPTS));
}

// Dispose every binding (from unmountInspector). Stopping them drops the web-vital sources' last
// subscribers too, which auto-disconnects their PerformanceObservers.
export function disposeBindings(): void {
  for (const stop of bindings) stop();
  bindings.length = 0;
}
